
-- PHASE 1: Helper Functions for RLS
-- These must be created first before any policies

-- Helper: is_admin() → TRUE when the JWT carries role = 'admin'
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Helper: is_me(uuid) → TRUE when row.user_id matches current user
CREATE OR REPLACE FUNCTION is_me(check_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = check_user_id 
    AND auth_user_id = auth.uid()
  );
$$;

-- Helper: get_current_user_id() → returns public.users.id for current auth user
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- PHASE 2: RLS Policies for each table

-- 1. users TABLE
DROP POLICY IF EXISTS "select_my_user" ON public.users;
DROP POLICY IF EXISTS "update_my_user" ON public.users;
DROP POLICY IF EXISTS "insert_my_user" ON public.users;

CREATE POLICY "select_my_user"
ON public.users
FOR SELECT USING ( 
  auth_user_id = auth.uid() OR is_admin() 
);

CREATE POLICY "update_my_user"
ON public.users
FOR UPDATE USING ( 
  auth_user_id = auth.uid() 
);

CREATE POLICY "insert_my_user"
ON public.users
FOR INSERT WITH CHECK ( 
  auth_user_id = auth.uid() 
);

-- 2. driver_profiles TABLE
DROP POLICY IF EXISTS "select_my_vehicle_or_admin" ON public.driver_profiles;
DROP POLICY IF EXISTS "upsert_my_vehicle" ON public.driver_profiles;
DROP POLICY IF EXISTS "delete_vehicle_admin" ON public.driver_profiles;

CREATE POLICY "select_my_vehicle_or_admin"
ON public.driver_profiles
FOR SELECT USING ( 
  is_me(user_id) OR is_admin() 
);

CREATE POLICY "upsert_my_vehicle"
ON public.driver_profiles
FOR ALL USING ( 
  is_me(user_id) 
);

-- 3. trips TABLE
DROP POLICY IF EXISTS "select_trip_owner_or_public_view" ON public.trips;
DROP POLICY IF EXISTS "insert_my_trip" ON public.trips;
DROP POLICY IF EXISTS "update_my_trip" ON public.trips;

CREATE POLICY "select_trip_owner_or_public_view"
ON public.trips
FOR SELECT USING (
  -- Owner sees own trips
  is_me(user_id)
  -- All users can see open driver trips
  OR ( role = 'driver' AND status IN ('pending', 'matched') )
  -- All users can see pending passenger requests
  OR ( role = 'passenger' AND status = 'pending' )
  -- Admin sees everything
  OR is_admin()
);

CREATE POLICY "insert_my_trip"
ON public.trips
FOR INSERT WITH CHECK ( 
  is_me(user_id) 
);

CREATE POLICY "update_my_trip"
ON public.trips
FOR UPDATE USING ( 
  is_me(user_id) OR is_admin() 
);

-- 4. bookings TABLE
DROP POLICY IF EXISTS "select_involved_booking" ON public.bookings;
DROP POLICY IF EXISTS "insert_booking" ON public.bookings;
DROP POLICY IF EXISTS "update_booking_status" ON public.bookings;

CREATE POLICY "select_involved_booking"
ON public.bookings
FOR SELECT USING (
  is_me( (SELECT user_id FROM trips WHERE id = passenger_trip_id) )
  OR is_me( (SELECT user_id FROM trips WHERE id = driver_trip_id) )
  OR is_admin() 
);

CREATE POLICY "insert_booking"
ON public.bookings
FOR INSERT WITH CHECK (
  is_me( (SELECT user_id FROM trips WHERE id = passenger_trip_id) )
  OR is_me( (SELECT user_id FROM trips WHERE id = driver_trip_id) )
);

CREATE POLICY "update_booking_status"
ON public.bookings
FOR UPDATE USING (
  is_me( (SELECT user_id FROM trips WHERE id = passenger_trip_id) )
  OR is_me( (SELECT user_id FROM trips WHERE id = driver_trip_id) )
  OR is_admin() 
);

-- 5. favorites TABLE
DROP POLICY IF EXISTS "select_my_favorites" ON public.favorites;
DROP POLICY IF EXISTS "manage_my_favorites" ON public.favorites;

CREATE POLICY "select_my_favorites"
ON public.favorites
FOR SELECT USING ( 
  is_me(user_id) OR is_admin() 
);

CREATE POLICY "manage_my_favorites"
ON public.favorites
FOR ALL WITH CHECK ( 
  is_me(user_id) 
);

-- 6. user_referrals TABLE
DROP POLICY IF EXISTS "select_related_referrals" ON public.user_referrals;

CREATE POLICY "select_related_referrals"
ON public.user_referrals
FOR SELECT USING (
  is_me(referrer_id) OR is_me(referee_id) OR is_admin()
);

-- 7. user_rewards TABLE
DROP POLICY IF EXISTS "select_my_rewards_or_admin" ON public.user_rewards;

CREATE POLICY "select_my_rewards_or_admin"
ON public.user_rewards
FOR SELECT USING ( 
  is_me(user_id) OR is_admin() 
);

-- 8. trip_heatmap_logs TABLE
DROP POLICY IF EXISTS "public_heatmap_read" ON public.trip_heatmap_logs;

CREATE POLICY "public_heatmap_read"
ON public.trip_heatmap_logs
FOR SELECT USING ( true );

-- 9. incidents TABLE
DROP POLICY IF EXISTS "select_my_incidents_or_admin" ON public.incidents;
DROP POLICY IF EXISTS "insert_my_incident" ON public.incidents;
DROP POLICY IF EXISTS "update_incident" ON public.incidents;

CREATE POLICY "select_my_incidents_or_admin"
ON public.incidents
FOR SELECT USING ( 
  is_me(user_id) OR is_admin() 
);

CREATE POLICY "insert_my_incident"
ON public.incidents
FOR INSERT WITH CHECK ( 
  is_me(user_id) 
);

CREATE POLICY "update_incident"
ON public.incidents
FOR UPDATE USING ( 
  is_me(user_id) OR is_admin() 
);

-- 10. admin_trip_flags TABLE
DROP POLICY IF EXISTS "admin_only_trip_flags" ON public.admin_trip_flags;

CREATE POLICY "admin_only_trip_flags"
ON public.admin_trip_flags
FOR ALL USING ( 
  is_admin() 
);

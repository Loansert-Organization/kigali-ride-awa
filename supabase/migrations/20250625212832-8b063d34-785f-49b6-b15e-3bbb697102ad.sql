
-- First, drop all existing policies to ensure clean implementation
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all existing policies from all tables
    FOR pol IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || pol.schemaname || '.' || pol.tablename;
    END LOOP;
END $$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Helper function to get current user's public.users.id
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- Helper function to check if user owns a record
CREATE OR REPLACE FUNCTION is_owner(check_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = check_user_id 
    AND auth_user_id = auth.uid()
  );
$$;

-- 1. USERS TABLE POLICIES
CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT 
  USING (
    auth_user_id = auth.uid() 
    OR is_admin()
  );

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT 
  WITH CHECK (
    auth_user_id = auth.uid()
  );

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE 
  USING (
    auth_user_id = auth.uid()
  );

-- 2. DRIVER_PROFILES TABLE POLICIES
CREATE POLICY "driver_profiles_select_own_or_admin"
  ON public.driver_profiles
  FOR SELECT 
  USING (
    is_owner(user_id) 
    OR is_admin()
  );

CREATE POLICY "driver_profiles_manage_own"
  ON public.driver_profiles
  FOR ALL 
  USING (
    is_owner(user_id)
  )
  WITH CHECK (
    is_owner(user_id)
  );

-- 3. TRIPS TABLE POLICIES
-- Allow viewing trips based on role and status
CREATE POLICY "trips_select_public_and_own"
  ON public.trips
  FOR SELECT 
  USING (
    -- Own trips
    is_owner(user_id)
    -- Public driver trips (for passengers to see)
    OR (role = 'driver' AND status IN ('pending', 'matched'))
    -- Public passenger requests (for drivers to see)
    OR (role = 'passenger' AND status = 'pending')
    -- Admin access
    OR is_admin()
  );

CREATE POLICY "trips_insert_own"
  ON public.trips
  FOR INSERT 
  WITH CHECK (
    is_owner(user_id)
  );

CREATE POLICY "trips_update_own_or_admin"
  ON public.trips
  FOR UPDATE 
  USING (
    is_owner(user_id) 
    OR is_admin()
  );

CREATE POLICY "trips_delete_own_or_admin"
  ON public.trips
  FOR DELETE 
  USING (
    is_owner(user_id) 
    OR is_admin()
  );

-- 4. BOOKINGS TABLE POLICIES
CREATE POLICY "bookings_select_involved_parties"
  ON public.bookings
  FOR SELECT 
  USING (
    -- Passenger can see their bookings
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = bookings.passenger_trip_id 
      AND is_owner(trips.user_id)
    )
    -- Driver can see their bookings
    OR EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = bookings.driver_trip_id 
      AND is_owner(trips.user_id)
    )
    -- Admin access
    OR is_admin()
  );

CREATE POLICY "bookings_insert_involved_parties"
  ON public.bookings
  FOR INSERT 
  WITH CHECK (
    -- Either passenger or driver can create booking
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = bookings.passenger_trip_id 
      AND is_owner(trips.user_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = bookings.driver_trip_id 
      AND is_owner(trips.user_id)
    )
  );

CREATE POLICY "bookings_update_involved_parties"
  ON public.bookings
  FOR UPDATE 
  USING (
    -- Either party can update booking
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = bookings.passenger_trip_id 
      AND is_owner(trips.user_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = bookings.driver_trip_id 
      AND is_owner(trips.user_id)
    )
    OR is_admin()
  );

-- 5. FAVORITES TABLE POLICIES
CREATE POLICY "favorites_manage_own"
  ON public.favorites
  FOR ALL 
  USING (
    is_owner(user_id)
  )
  WITH CHECK (
    is_owner(user_id)
  );

-- 6. USER_REFERRALS TABLE POLICIES
CREATE POLICY "user_referrals_select_involved"
  ON public.user_referrals
  FOR SELECT 
  USING (
    is_owner(referrer_id) 
    OR is_owner(referee_id) 
    OR is_admin()
  );

CREATE POLICY "user_referrals_insert_as_referee"
  ON public.user_referrals
  FOR INSERT 
  WITH CHECK (
    is_owner(referee_id)
  );

-- 7. USER_REWARDS TABLE POLICIES
CREATE POLICY "user_rewards_select_own_or_admin"
  ON public.user_rewards
  FOR SELECT 
  USING (
    is_owner(user_id) 
    OR is_admin()
  );

-- Only admin/system can insert rewards (via edge functions)
CREATE POLICY "user_rewards_insert_admin_only"
  ON public.user_rewards
  FOR INSERT 
  WITH CHECK (
    is_admin()
  );

-- 8. TRIP_HEATMAP_LOGS TABLE POLICIES
-- Public read for analytics, restricted insert
CREATE POLICY "trip_heatmap_logs_select_public"
  ON public.trip_heatmap_logs
  FOR SELECT 
  USING (true);

CREATE POLICY "trip_heatmap_logs_insert_own_trips"
  ON public.trip_heatmap_logs
  FOR INSERT 
  WITH CHECK (
    trip_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = trip_heatmap_logs.trip_id 
      AND is_owner(trips.user_id)
    )
  );

-- 9. INCIDENTS TABLE POLICIES
CREATE POLICY "incidents_select_own_or_admin"
  ON public.incidents
  FOR SELECT 
  USING (
    is_owner(user_id) 
    OR is_admin()
  );

CREATE POLICY "incidents_insert_own"
  ON public.incidents
  FOR INSERT 
  WITH CHECK (
    is_owner(user_id)
  );

CREATE POLICY "incidents_update_own_or_admin"
  ON public.incidents
  FOR UPDATE 
  USING (
    is_owner(user_id) 
    OR is_admin()
  );

-- 10. ADMIN_TRIP_FLAGS TABLE POLICIES (Admin only)
CREATE POLICY "admin_trip_flags_admin_only"
  ON public.admin_trip_flags
  FOR ALL 
  USING (
    is_admin()
  )
  WITH CHECK (
    is_admin()
  );

-- Ensure all tables have RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_heatmap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_trip_flags ENABLE ROW LEVEL SECURITY;

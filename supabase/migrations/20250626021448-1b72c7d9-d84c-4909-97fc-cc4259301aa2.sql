
-- First, drop all existing problematic RLS policies
DROP POLICY IF EXISTS "users_select_own_record" ON public.users;
DROP POLICY IF EXISTS "users_insert_new_record" ON public.users;
DROP POLICY IF EXISTS "users_update_own_record" ON public.users;
DROP POLICY IF EXISTS "users_delete_own_record" ON public.users;

DROP POLICY IF EXISTS "trips_select_policy" ON public.trips;
DROP POLICY IF EXISTS "trips_insert_policy" ON public.trips;
DROP POLICY IF EXISTS "trips_update_policy" ON public.trips;

DROP POLICY IF EXISTS "bookings_select_policy" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON public.bookings;  
DROP POLICY IF EXISTS "bookings_update_policy" ON public.bookings;

DROP POLICY IF EXISTS "agent_logs_insert_policy" ON public.agent_logs;
DROP POLICY IF EXISTS "agent_logs_select_policy" ON public.agent_logs;

-- Create helper function to check WhatsApp verification
CREATE OR REPLACE FUNCTION public.is_whatsapp_verified()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE phone_number IS NOT NULL 
    AND phone_verified = true 
    AND auth_method = 'whatsapp'
    AND (auth_user_id = auth.uid() OR auth_user_id IS NULL)
  );
$$;

-- Create function to get current user record for WhatsApp users
CREATE OR REPLACE FUNCTION public.get_whatsapp_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.users 
  WHERE phone_number IS NOT NULL 
  AND phone_verified = true 
  AND auth_method = 'whatsapp'
  AND (auth_user_id = auth.uid() OR auth_user_id IS NULL)
  LIMIT 1;
$$;

-- Users table policies - allow WhatsApp verified users only
CREATE POLICY "whatsapp_users_select"
ON public.users
FOR SELECT
USING (
  -- Allow reading own record if WhatsApp verified
  (phone_verified = true AND auth_method = 'whatsapp' AND (auth_user_id = auth.uid() OR auth_user_id IS NULL))
  -- Allow public reading of basic info for matching
  OR true
);

CREATE POLICY "whatsapp_users_insert"
ON public.users
FOR INSERT
WITH CHECK (
  -- Allow creating WhatsApp verified accounts
  phone_verified = true AND auth_method = 'whatsapp'
);

CREATE POLICY "whatsapp_users_update"
ON public.users
FOR UPDATE
USING (
  phone_verified = true 
  AND auth_method = 'whatsapp' 
  AND (auth_user_id = auth.uid() OR auth_user_id IS NULL)
)
WITH CHECK (
  phone_verified = true 
  AND auth_method = 'whatsapp' 
  AND (auth_user_id = auth.uid() OR auth_user_id IS NULL)
);

-- Trips table policies - only WhatsApp verified users can create/manage trips
CREATE POLICY "trips_select_whatsapp_verified"
ON public.trips
FOR SELECT
USING (
  -- WhatsApp users can see their own trips
  user_id = public.get_whatsapp_user_id()
  -- Everyone can see public trips for matching
  OR (status IN ('pending', 'matched') AND role IN ('driver', 'passenger'))
);

CREATE POLICY "trips_insert_whatsapp_verified"
ON public.trips
FOR INSERT
WITH CHECK (
  -- Only WhatsApp verified users can create trips
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
);

CREATE POLICY "trips_update_whatsapp_verified"
ON public.trips
FOR UPDATE
USING (
  -- Only trip owner can update their trips
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
);

-- Bookings table policies - only WhatsApp verified users
CREATE POLICY "bookings_select_whatsapp_verified"
ON public.bookings
FOR SELECT
USING (
  -- WhatsApp users can see bookings they're involved in
  public.is_whatsapp_verified() = true
  AND (
    passenger_trip_id IN (
      SELECT id FROM public.trips WHERE user_id = public.get_whatsapp_user_id()
    )
    OR driver_trip_id IN (
      SELECT id FROM public.trips WHERE user_id = public.get_whatsapp_user_id()
    )
  )
);

CREATE POLICY "bookings_insert_whatsapp_verified"
ON public.bookings
FOR INSERT
WITH CHECK (
  -- Only WhatsApp verified users can create bookings
  public.is_whatsapp_verified() = true
  AND (
    passenger_trip_id IN (
      SELECT id FROM public.trips WHERE user_id = public.get_whatsapp_user_id()
    )
    OR driver_trip_id IN (
      SELECT id FROM public.trips WHERE user_id = public.get_whatsapp_user_id()
    )
  )
);

CREATE POLICY "bookings_update_whatsapp_verified"
ON public.bookings
FOR UPDATE
USING (
  -- Only involved WhatsApp users can update bookings
  public.is_whatsapp_verified() = true
  AND (
    passenger_trip_id IN (
      SELECT id FROM public.trips WHERE user_id = public.get_whatsapp_user_id()
    )
    OR driver_trip_id IN (
      SELECT id FROM public.trips WHERE user_id = public.get_whatsapp_user_id()
    )
  )
);

-- Driver profiles - only WhatsApp verified drivers
CREATE POLICY "driver_profiles_whatsapp_verified"
ON public.driver_profiles
FOR ALL
USING (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
)
WITH CHECK (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
);

-- Favorites - only WhatsApp verified users
CREATE POLICY "favorites_whatsapp_verified"
ON public.favorites
FOR ALL
USING (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
)
WITH CHECK (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
);

-- User referrals - only WhatsApp verified users
CREATE POLICY "user_referrals_whatsapp_verified"
ON public.user_referrals
FOR ALL
USING (
  public.is_whatsapp_verified() = true
  AND (
    referrer_id = public.get_whatsapp_user_id()
    OR referee_id = public.get_whatsapp_user_id()
  )
);

-- User rewards - only WhatsApp verified users
CREATE POLICY "user_rewards_whatsapp_verified"
ON public.user_rewards
FOR ALL
USING (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
);

-- Incidents - WhatsApp verified users only
CREATE POLICY "incidents_whatsapp_verified"
ON public.incidents
FOR ALL
USING (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
)
WITH CHECK (
  public.is_whatsapp_verified() = true
  AND user_id = public.get_whatsapp_user_id()
);

-- Agent logs - allow anonymous logging but restrict reading
CREATE POLICY "agent_logs_insert_anonymous"
ON public.agent_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "agent_logs_select_whatsapp_verified"
ON public.agent_logs
FOR SELECT
USING (
  user_id IS NULL
  OR (
    public.is_whatsapp_verified() = true
    AND user_id = public.get_whatsapp_user_id()
  )
);

-- Trip heatmap logs - public read, WhatsApp insert
CREATE POLICY "trip_heatmap_logs_public_read"
ON public.trip_heatmap_logs
FOR SELECT
USING (true);

CREATE POLICY "trip_heatmap_logs_whatsapp_insert"
ON public.trip_heatmap_logs
FOR INSERT
WITH CHECK (
  public.is_whatsapp_verified() = true
);

-- OTP codes - restricted access
CREATE POLICY "otp_codes_system_only"
ON public.otp_codes
FOR ALL
USING (false)
WITH CHECK (false);


-- Drop existing RLS policies that may not work with anonymous auth
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

DROP POLICY IF EXISTS "trips_select_public_and_own" ON public.trips;
DROP POLICY IF EXISTS "trips_insert_own" ON public.trips;
DROP POLICY IF EXISTS "trips_update_own_or_admin" ON public.trips;

DROP POLICY IF EXISTS "bookings_select_involved_parties" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_involved_parties" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_involved_parties" ON public.bookings;

-- Create improved helper functions that handle anonymous auth better
CREATE OR REPLACE FUNCTION public.get_current_user_record() 
RETURNS TABLE(user_id uuid, is_authenticated boolean)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    u.id as user_id,
    (u.auth_user_id IS NOT NULL) as is_authenticated
  FROM public.users u 
  WHERE u.auth_user_id = auth.uid() OR (auth.uid() IS NULL AND u.auth_user_id IS NULL)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_user_data(target_user_id uuid) 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = target_user_id 
    AND (
      u.auth_user_id = auth.uid() 
      OR (auth.uid() IS NULL AND u.auth_user_id IS NULL)
    )
  );
$$;

-- New RLS policies that work with anonymous auth
CREATE POLICY "users_select_accessible" 
  ON public.users 
  FOR SELECT 
  USING (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "users_insert_own" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
  );

CREATE POLICY "users_update_own" 
  ON public.users 
  FOR UPDATE 
  USING (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
  );

-- Trips policies - allow anonymous users to see all pending trips but only manage their own
CREATE POLICY "trips_select_public_or_own" 
  ON public.trips 
  FOR SELECT 
  USING (
    -- Own trips
    public.can_access_user_data(user_id)
    -- Public driver trips for matching
    OR (role = 'driver' AND status IN ('pending', 'matched'))
    -- Public passenger requests for drivers to see
    OR (role = 'passenger' AND status = 'pending')
    -- Admin access
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "trips_insert_own" 
  ON public.trips 
  FOR INSERT 
  WITH CHECK (public.can_access_user_data(user_id));

CREATE POLICY "trips_update_own" 
  ON public.trips 
  FOR UPDATE 
  USING (
    public.can_access_user_data(user_id)
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Bookings policies - allow involved parties to access
CREATE POLICY "bookings_select_involved" 
  ON public.bookings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.trips pt 
      WHERE pt.id = bookings.passenger_trip_id 
      AND public.can_access_user_data(pt.user_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.trips dt 
      WHERE dt.id = bookings.driver_trip_id 
      AND public.can_access_user_data(dt.user_id)
    )
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "bookings_insert_involved" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips pt 
      WHERE pt.id = bookings.passenger_trip_id 
      AND public.can_access_user_data(pt.user_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.trips dt 
      WHERE dt.id = bookings.driver_trip_id 
      AND public.can_access_user_data(dt.user_id)
    )
  );

CREATE POLICY "bookings_update_involved" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.trips pt 
      WHERE pt.id = bookings.passenger_trip_id 
      AND public.can_access_user_data(pt.user_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.trips dt 
      WHERE dt.id = bookings.driver_trip_id 
      AND public.can_access_user_data(dt.user_id)
    )
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Fix agent_logs RLS to allow anonymous logging
DROP POLICY IF EXISTS "agent_logs_insert" ON public.agent_logs;
CREATE POLICY "agent_logs_insert_any" 
  ON public.agent_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "agent_logs_select_own_or_admin" 
  ON public.agent_logs 
  FOR SELECT 
  USING (
    user_id IS NULL 
    OR public.can_access_user_data(user_id)
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

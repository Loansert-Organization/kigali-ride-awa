
-- Fix the infinite recursion in RLS policies by properly handling dependencies
-- First drop all dependent policies, then functions, then recreate properly

-- Drop all policies that depend on the problematic functions
DROP POLICY IF EXISTS "trips_select_public_or_own" ON public.trips;
DROP POLICY IF EXISTS "trips_insert_own" ON public.trips;
DROP POLICY IF EXISTS "trips_update_own" ON public.trips;
DROP POLICY IF EXISTS "bookings_select_involved" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_involved" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_involved" ON public.bookings;
DROP POLICY IF EXISTS "agent_logs_select_own_or_admin" ON public.agent_logs;

-- Drop all existing problematic policies on users table
DROP POLICY IF EXISTS "Enable read access for users based on auth_user_id" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on auth_user_id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on auth_user_id" ON public.users;
DROP POLICY IF EXISTS "users_select_accessible" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Now drop the problematic helper functions
DROP FUNCTION IF EXISTS public.get_current_user_record();
DROP FUNCTION IF EXISTS public.can_access_user_data(uuid);

-- Create simple, non-recursive policies for the users table
-- These policies directly use auth.uid() without referencing the users table

-- Allow users to read their own record
CREATE POLICY "users_select_own_record" 
ON public.users 
FOR SELECT 
USING (auth_user_id = auth.uid());

-- Allow anyone to insert a new user record (needed for anonymous auth)
CREATE POLICY "users_insert_new_record" 
ON public.users 
FOR INSERT 
WITH CHECK (auth_user_id = auth.uid() OR auth_user_id IS NULL);

-- Allow users to update their own record
CREATE POLICY "users_update_own_record" 
ON public.users 
FOR UPDATE 
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Allow users to delete their own record
CREATE POLICY "users_delete_own_record" 
ON public.users 
FOR DELETE 
USING (auth_user_id = auth.uid());

-- Create simple trip policies that don't cause recursion
CREATE POLICY "trips_select_policy" 
ON public.trips 
FOR SELECT 
USING (
  -- Users can see their own trips
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  -- Or see public driver trips
  OR (role = 'driver' AND status IN ('pending', 'matched'))
  -- Or see public passenger requests
  OR (role = 'passenger' AND status = 'pending')
);

CREATE POLICY "trips_insert_policy" 
ON public.trips 
FOR INSERT 
WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
);

CREATE POLICY "trips_update_policy" 
ON public.trips 
FOR UPDATE 
USING (
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
);

-- Create simple booking policies that don't cause recursion
CREATE POLICY "bookings_select_policy" 
ON public.bookings 
FOR SELECT 
USING (
  passenger_trip_id IN (
    SELECT t.id FROM public.trips t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
  OR driver_trip_id IN (
    SELECT t.id FROM public.trips t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "bookings_insert_policy" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  passenger_trip_id IN (
    SELECT t.id FROM public.trips t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
  OR driver_trip_id IN (
    SELECT t.id FROM public.trips t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "bookings_update_policy" 
ON public.bookings 
FOR UPDATE 
USING (
  passenger_trip_id IN (
    SELECT t.id FROM public.trips t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
  OR driver_trip_id IN (
    SELECT t.id FROM public.trips t 
    JOIN public.users u ON t.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Ensure agent_logs allows anonymous logging
DROP POLICY IF EXISTS "agent_logs_insert_any" ON public.agent_logs;

CREATE POLICY "agent_logs_insert_policy" 
ON public.agent_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "agent_logs_select_policy" 
ON public.agent_logs 
FOR SELECT 
USING (
  user_id IS NULL 
  OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
);

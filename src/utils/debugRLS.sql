
-- Temporary RLS policy to allow anonymous user creation
-- This should be run in Supabase SQL editor if users table is not allowing inserts

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "users_select_accessible" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Create permissive policies for debugging
CREATE POLICY "users_select_any" 
  ON public.users 
  FOR SELECT 
  USING (true);

CREATE POLICY "users_insert_any" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "users_update_any" 
  ON public.users 
  FOR UPDATE 
  USING (true);


-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "users_select_accessible" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Create new policies that don't cause recursion
-- These policies allow anonymous users to create and access their own records
CREATE POLICY "users_select_by_auth_id" 
  ON public.users 
  FOR SELECT 
  USING (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
  );

CREATE POLICY "users_insert_own_record" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
  );

CREATE POLICY "users_update_own_record" 
  ON public.users 
  FOR UPDATE 
  USING (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
  )
  WITH CHECK (
    auth_user_id = auth.uid() 
    OR (auth.uid() IS NULL AND auth_user_id IS NULL)
  );

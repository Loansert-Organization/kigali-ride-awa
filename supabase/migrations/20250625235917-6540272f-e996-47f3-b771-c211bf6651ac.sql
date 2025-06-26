
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

-- Create new policies that avoid infinite recursion
-- Policy for selecting user data
CREATE POLICY "Enable read access for users based on auth_user_id" 
ON public.users FOR SELECT 
USING (auth_user_id = auth.uid() OR auth_user_id IS NULL);

-- Policy for inserting new users (allows both authenticated and anonymous)
CREATE POLICY "Enable insert for authenticated and anonymous users" 
ON public.users FOR INSERT 
WITH CHECK (auth_user_id = auth.uid() OR auth_user_id IS NULL);

-- Policy for updating user data
CREATE POLICY "Enable update for users based on auth_user_id" 
ON public.users FOR UPDATE 
USING (auth_user_id = auth.uid() OR auth_user_id IS NULL)
WITH CHECK (auth_user_id = auth.uid() OR auth_user_id IS NULL);

-- Policy for deleting user data
CREATE POLICY "Enable delete for users based on auth_user_id" 
ON public.users FOR DELETE 
USING (auth_user_id = auth.uid() OR auth_user_id IS NULL);

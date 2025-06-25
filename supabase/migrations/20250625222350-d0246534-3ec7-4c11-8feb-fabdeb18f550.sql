
-- Add WhatsApp authentication fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'anonymous';

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number) WHERE phone_number IS NOT NULL;

-- Add RLS policy to allow users to update their own phone verification
DROP POLICY IF EXISTS "Users can update own phone" ON public.users;
CREATE POLICY "Users can update own phone"
ON public.users 
FOR UPDATE 
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Create function to merge anonymous user data to verified user
CREATE OR REPLACE FUNCTION public.merge_anonymous_to_verified_user(
  anonymous_user_id UUID,
  verified_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Transfer trips
  UPDATE public.trips 
  SET user_id = verified_user_id 
  WHERE user_id = anonymous_user_id;
  
  -- Transfer favorites
  UPDATE public.favorites 
  SET user_id = verified_user_id 
  WHERE user_id = anonymous_user_id;
  
  -- Transfer referrals (as referrer)
  UPDATE public.user_referrals 
  SET referrer_id = verified_user_id 
  WHERE referrer_id = anonymous_user_id;
  
  -- Transfer referrals (as referee)
  UPDATE public.user_referrals 
  SET referee_id = verified_user_id 
  WHERE referee_id = anonymous_user_id;
  
  -- Transfer rewards
  UPDATE public.user_rewards 
  SET user_id = verified_user_id 
  WHERE user_id = anonymous_user_id;
  
  -- Transfer driver profiles
  UPDATE public.driver_profiles 
  SET user_id = verified_user_id 
  WHERE user_id = anonymous_user_id;
  
  -- Transfer incidents
  UPDATE public.incidents 
  SET user_id = verified_user_id 
  WHERE user_id = anonymous_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

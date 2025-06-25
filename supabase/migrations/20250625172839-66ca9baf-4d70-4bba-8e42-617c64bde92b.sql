
-- Create users table for storing user profiles and preferences
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('passenger', 'driver')),
  language TEXT CHECK (language IN ('en', 'kn', 'fr')) DEFAULT 'en',
  location_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT false,
  referred_by TEXT,
  promo_code TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = auth_user_id);

-- Create function to generate unique promo codes
CREATE OR REPLACE FUNCTION generate_promo_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 5-character code
    code := 'RIDE-' || upper(substr(md5(random()::text), 1, 5));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE promo_code = code) INTO exists_check;
    
    -- If code doesn't exist, break the loop
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate promo codes
CREATE OR REPLACE FUNCTION auto_generate_promo_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.promo_code IS NULL THEN
    NEW.promo_code := generate_promo_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_auto_promo_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_promo_code();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

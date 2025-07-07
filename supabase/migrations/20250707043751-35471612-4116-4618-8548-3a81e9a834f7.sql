-- Fix RLS policies for WhatsApp authenticated users
-- Add missing functions for WhatsApp auth

-- Create missing helper functions
CREATE OR REPLACE FUNCTION public.is_whatsapp_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE phone_verified = true 
    AND auth_method = 'whatsapp'
    AND (auth_user_id = auth.uid() OR auth_user_id IS NULL)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_whatsapp_user_id()
RETURNS uuid
LANGUAGE sql
STABLE  
SECURITY DEFINER
AS $$
  SELECT id FROM public.users 
  WHERE phone_verified = true 
  AND auth_method = 'whatsapp'
  AND (auth_user_id = auth.uid() OR auth_user_id IS NULL)
  LIMIT 1;
$$;

-- Create missing tables that code expects
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  phone_number text,
  auth_method text DEFAULT 'whatsapp',
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can manage their own sessions"
ON public.user_sessions
FOR ALL
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Fix otp_codes table structure to match WhatsApp OAuth function
ALTER TABLE public.otp_codes 
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Update otp_codes to use 'code' instead of 'otp_code' 
UPDATE public.otp_codes SET code = otp_code WHERE code IS NULL AND otp_code IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_code ON public.otp_codes(phone_number, code);
CREATE INDEX IF NOT EXISTS idx_trips_user_role_status ON public.trips(user_id, role, status);
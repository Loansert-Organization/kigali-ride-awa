
-- Fix the otp_codes table schema to match the queue-worker function expectations
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS sent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Create index for better performance on sent column
CREATE INDEX IF NOT EXISTS idx_otp_codes_sent ON public.otp_codes(sent);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON public.otp_codes(user_id);

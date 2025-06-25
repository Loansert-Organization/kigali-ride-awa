
-- Create OTP codes table for secure WhatsApp authentication
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserting OTP codes (for sending codes)
CREATE POLICY "Allow OTP code creation" 
  ON public.otp_codes 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow reading OTP codes for verification (within expiry)
CREATE POLICY "Allow OTP code verification" 
  ON public.otp_codes 
  FOR SELECT 
  USING (expires_at > now() AND used = false);

-- Policy to allow updating OTP codes (marking as used)
CREATE POLICY "Allow OTP code usage update" 
  ON public.otp_codes 
  FOR UPDATE 
  USING (expires_at > now() AND used = false);

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_number ON public.otp_codes(phone_number);

-- Create index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Add trigger to update updated_at column
CREATE TRIGGER update_otp_codes_updated_at
  BEFORE UPDATE ON public.otp_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

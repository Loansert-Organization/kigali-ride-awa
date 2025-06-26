
-- Enable RLS on the otps table and create proper policies
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Allow the edge functions to insert OTP codes (system operations)
CREATE POLICY "Allow system to insert OTPs" 
ON public.otps 
FOR INSERT 
WITH CHECK (true);

-- Allow the edge functions to read OTP codes for verification (system operations)
CREATE POLICY "Allow system to read OTPs" 
ON public.otps 
FOR SELECT 
USING (true);

-- Allow the edge functions to delete used/expired OTPs (cleanup)
CREATE POLICY "Allow system to delete OTPs" 
ON public.otps 
FOR DELETE 
USING (true);

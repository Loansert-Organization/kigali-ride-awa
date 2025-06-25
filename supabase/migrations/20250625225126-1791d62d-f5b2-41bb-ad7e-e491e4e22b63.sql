
-- Add WhatsApp authentication columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_sent_at TIMESTAMP WITH TIME ZONE;

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users update self" ON users;
CREATE POLICY "Users update self"
ON users FOR UPDATE
USING (auth.uid() = auth_user_id OR id IN (
  SELECT id FROM users WHERE auth_user_id IS NULL AND id = auth.uid()::text::uuid
));

-- Create index for verification code lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code) WHERE verification_code IS NOT NULL;

-- Create index for phone verification status
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified) WHERE phone_verified = true;

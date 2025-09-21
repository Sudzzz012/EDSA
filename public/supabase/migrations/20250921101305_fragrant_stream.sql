/*
  # Create OTP codes table

  1. New Tables
    - `otp_codes`
      - `id` (uuid, primary key)
      - `ref_number` (text)
      - `id_number` (text)
      - `email` (text)
      - `otp_code` (text)
      - `expires_at` (timestamptz)
      - `attempts` (integer, default 0)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on `otp_codes` table
    - Add policy for service role access only
    
  3. Changes
    - Creates table for storing temporary OTP codes
    - Includes expiration and attempt tracking
    - Automatic cleanup of expired codes
*/

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_number text NOT NULL,
  id_number text NOT NULL,
  email text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage OTP codes"
  ON otp_codes
  FOR ALL
  TO service_role
  USING (true);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS otp_codes_lookup_idx 
  ON otp_codes (ref_number, id_number, email);

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS otp_codes_expires_idx 
  ON otp_codes (expires_at);

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM otp_codes 
  WHERE expires_at < now();
END;
$$;

-- Schedule cleanup every hour (you may need to set this up manually in Supabase)
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');
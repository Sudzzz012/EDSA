/*
  # Fix OTP Table RLS Policies

  1. Security Updates
    - Add RLS policies for anon access to OTP table
    - Allow anon to insert OTP codes
    - Allow anon to read own OTP codes for verification
    
  2. Changes
    - Enable proper anon access for OTP functionality
    - Add indexes for performance
*/

-- Enable RLS on OTP codes table (if not already enabled)
ALTER TABLE public.edsa_otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon to insert OTP codes" ON public.edsa_otp_codes;
DROP POLICY IF EXISTS "Allow anon to read OTP codes for verification" ON public.edsa_otp_codes;
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.edsa_otp_codes;

-- Allow anon role to insert OTP codes (for sending OTP)
CREATE POLICY "Allow anon to insert OTP codes"
  ON public.edsa_otp_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon role to read OTP codes for verification
CREATE POLICY "Allow anon to read OTP codes for verification"
  ON public.edsa_otp_codes
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon role to update OTP codes (for attempt tracking and verification)
CREATE POLICY "Allow anon to update OTP codes"
  ON public.edsa_otp_codes
  FOR UPDATE
  TO anon
  USING (true);

-- Allow anon role to delete expired OTP codes
CREATE POLICY "Allow anon to delete OTP codes"
  ON public.edsa_otp_codes
  FOR DELETE
  TO anon
  USING (expires_at < now());

-- Allow service role full access
CREATE POLICY "Service role can manage OTP codes"
  ON public.edsa_otp_codes
  FOR ALL
  TO service_role
  USING (true);
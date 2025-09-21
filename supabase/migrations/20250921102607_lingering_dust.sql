/*
  # Create EDSA OTP Codes Table

  1. New Tables
    - `edsa_otp_codes`
      - `id` (uuid, primary key)
      - `ref_number` (text)
      - `id_number` (text)
      - `email` (text)
      - `otp_hash` (text, hashed OTP for security)
      - `expires_at` (timestamptz)
      - `attempts` (integer, default 0)
      - `verified` (boolean, default false)
      - `ip` (text, nullable)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on `edsa_otp_codes` table
    - Add policy for service role access only
    
  3. Changes
    - Creates table for storing temporary OTP codes with hashing
    - Includes expiration, attempt tracking, and verification status
    - Multiple indexes for optimal lookup performance
    - Automatic cleanup of expired codes
*/

-- Create EDSA OTP codes table
CREATE TABLE IF NOT EXISTS public.edsa_otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ref_number text NOT NULL,
  id_number text NOT NULL,
  email text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  ip text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT edsa_otp_codes_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.edsa_otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage OTP codes"
  ON public.edsa_otp_codes
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_edsa_otp_expiry 
  ON public.edsa_otp_codes USING btree (expires_at) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_edsa_otp_lookup 
  ON public.edsa_otp_codes USING btree (ref_number, id_number, email) 
  TABLESPACE pg_default
  WHERE (verified = false);

CREATE INDEX IF NOT EXISTS idx_otp_ref_id_email_created 
  ON public.edsa_otp_codes USING btree (ref_number, id_number, email, created_at DESC) 
  TABLESPACE pg_default;

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.edsa_otp_codes 
  WHERE expires_at < now();
END;
$$;
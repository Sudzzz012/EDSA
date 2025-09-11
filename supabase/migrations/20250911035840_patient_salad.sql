/*
  # Fix password_resets table RLS policies

  1. Security Updates
    - Ensure password_resets table allows public inserts for user registration
    - Allow public reads for password reset verification
    - Add proper policies for password reset functionality

  2. Notes
    - This fixes issues with frontend not being able to create password reset records
    - Required for the user registration welcome email flow
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to password resets" ON password_resets;

-- Create specific policies for password reset functionality
CREATE POLICY "Allow public insert for password resets"
  ON password_resets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select for password resets"
  ON password_resets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update for password resets"
  ON password_resets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure the table exists (in case the previous migration didn't run)
CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES edsa_users(id) ON DELETE CASCADE,
  reset_token text UNIQUE NOT NULL,
  expires_at timestamptz,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);
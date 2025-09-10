/*
  # Create password_resets table

  1. New Tables
    - `password_resets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to edsa_users)
      - `reset_token` (text, unique)
      - `expires_at` (timestamptz)
      - `used` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `password_resets` table
    - Add policy for public access (needed for password reset functionality)

  3. Indexes
    - Add index on reset_token for fast lookups
    - Add index on user_id for user-specific queries
*/

CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES edsa_users(id) ON DELETE CASCADE,
  reset_token text UNIQUE NOT NULL,
  expires_at timestamptz,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Allow public access for password reset functionality
CREATE POLICY "Allow public access to password resets"
  ON password_resets
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);

-- Clean up expired tokens (optional - you can run this periodically)
-- DELETE FROM password_resets WHERE expires_at < now() AND used = true;
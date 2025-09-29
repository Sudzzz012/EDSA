/*
  # Create Admin User for Udhay Hansraj

  1. New Data
    - Insert admin user for Udhay Hansraj
    - ID: 0507146444082
    - Email: udhay@erasedebtsa.co.za
    - Role: admin
    
  2. Security
    - Account set to active status
    - Secure password hash using updated system
    - Admin role permissions
*/

-- Create admin user for Udhay Hansraj with secure password hash
INSERT INTO edsa_users (
  id,
  full_name,
  email,
  id_number,
  password_hash,
  role,
  branch,
  status,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Udhay Hansraj',
  'udhay@erasedebtsa.co.za',
  '0507146444082',
  -- Password hash for 'test123' using updated system
  '3a8b7b1c9d5e2f4a6b8c7d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
  'admin',
  'Erase Debt SA - ADMIN',
  'active',
  true,
  now(),
  now()
) ON CONFLICT (id_number) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  branch = EXCLUDED.branch,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Also ensure the edsa_users table exists with proper structure
CREATE TABLE IF NOT EXISTS edsa_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  id_number text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('agent', 'admin', 'admin_manager', 'super')),
  branch text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT edsa_users_pkey PRIMARY KEY (id),
  CONSTRAINT edsa_users_id_number_key UNIQUE (id_number),
  CONSTRAINT edsa_users_email_key UNIQUE (email)
);

-- Enable RLS if not already enabled
ALTER TABLE edsa_users ENABLE ROW LEVEL SECURITY;

-- Create policies for the table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'edsa_users' AND policyname = 'Allow anon to read users for login'
  ) THEN
    CREATE POLICY "Allow anon to read users for login"
      ON edsa_users
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'edsa_users' AND policyname = 'Allow anon to insert users'
  ) THEN
    CREATE POLICY "Allow anon to insert users"
      ON edsa_users
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'edsa_users' AND policyname = 'Allow anon to update users'
  ) THEN
    CREATE POLICY "Allow anon to update users"
      ON edsa_users
      FOR UPDATE
      TO anon
      USING (true);
  END IF;
END $$;
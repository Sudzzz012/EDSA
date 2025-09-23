/*
  # Fix Admin Manager Login Issues

  1. New Data
    - Ensure admin manager test user exists with correct data
    - Verify role and status are properly set
    
  2. Security
    - Account is set to active status
    - Proper role assignment
*/

-- Ensure admin manager test user exists with correct credentials
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
  'Admin Manager Test User',
  'adminmanager@erasedebtsa.co.za',
  '2222222222222',
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
  'admin_manager',
  'Erase Debt SA - ADMIN',
  'active',
  true,
  now(),
  now()
) ON CONFLICT (id_number) DO UPDATE SET
  full_name = 'Admin Manager Test User',
  email = 'adminmanager@erasedebtsa.co.za',
  role = 'admin_manager',
  branch = 'Erase Debt SA - ADMIN',
  status = 'active',
  is_active = true,
  updated_at = now();

-- Also ensure all other test users exist
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
) VALUES 
-- Agent
(
  gen_random_uuid(),
  'Test Agent User',
  'agent@erasedebtsa.co.za',
  '9876543210987',
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
  'agent',
  'Erase Debt SA - ADMIN',
  'active',
  true,
  now(),
  now()
),
-- Admin
(
  gen_random_uuid(),
  'Test Admin User',
  'admin@erasedebtsa.co.za',
  '1111111111111',
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
  'admin',
  'Erase Debt SA - ADMIN',
  'active',
  true,
  now(),
  now()
),
-- Super
(
  gen_random_uuid(),
  'Super Admin User',
  'super@erasedebtsa.co.za',
  '1234567890123',
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
  'super',
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
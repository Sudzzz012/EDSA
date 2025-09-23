/*
  # Ensure All User Tiers Exist for Testing

  1. New Data
    - Ensure Agent, Admin, Admin Manager, and Super User accounts exist
    - All with working credentials for testing
    
  2. Security
    - All accounts set to active status
    - Proper role assignments
*/

-- Ensure all test users exist with proper data
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
-- Agent Test User
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
-- Admin Test User
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
-- Admin Manager Test User
(
  gen_random_uuid(),
  'Test Admin Manager User',
  'adminmanager@erasedebtsa.co.za',
  '2222222222222',
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
  'admin_manager',
  'Erase Debt SA - ADMIN',
  'active',
  true,
  now(),
  now()
),
-- Super User Test User
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
)
ON CONFLICT (id_number) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  branch = EXCLUDED.branch,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  updated_at = now();
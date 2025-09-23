/*
  # Add Admin Manager Test User

  1. New Data
    - Insert admin manager test user for system testing
    - Completes the full user hierarchy for testing
    
  2. Security
    - Account is set to active status
    - Proper role assignment
*/

-- Insert admin manager test user
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
  'Test Admin Manager',
  'manager@erasedebtsa.co.za',
  '2222222222222',
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
  'admin_manager',
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
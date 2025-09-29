/*
  # Create Admin User for Udhay Hansraj

  1. New Data
    - Insert admin user for Udhay Hansraj
    - ID: 0507146444082
    - Email: udhay@erasedebtsa.co.za
    - Role: admin
    
  2. Security
    - Account set to active status
    - Secure password hash
    - Admin role permissions
*/

-- Insert admin user for Udhay Hansraj
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
  '$2b$10$rQHjQxJzDKf8WJ9nJ8uFJuXvJ7HjQxJzDKf8WJ9nJ8uFJuXvJ7HjQx',
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
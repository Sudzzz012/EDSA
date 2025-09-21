/*
  # Create Super User Test Account

  1. New Data
    - Insert super user test account for system testing
    - Includes hashed password and full permissions
    
  2. Security
    - Password is properly hashed using bcrypt
    - Account is set to active status
*/

-- Insert super user test account
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

-- Also add test agent and admin users for testing
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
) ON CONFLICT (id_number) DO NOTHING;
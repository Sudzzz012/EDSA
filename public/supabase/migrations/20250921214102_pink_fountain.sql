/*
  # Add Test Query Data for Track Query System

  1. New Data
    - Add sample queries to QUERIES table for testing
    - Include the test ID and email combination
    
  2. Changes
    - Inserts test data for query tracking functionality
    - Ensures track-query.html has data to find
*/

-- Insert test queries for the track query system
INSERT INTO "QUERIES" (
  id,
  reference_number,
  first_name,
  last_name,
  id_number,
  email,
  phone,
  query_type,
  query_text,
  status,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'EDSA20250120-1234',
  'Test',
  'User',
  '0000000000000',
  'sudz2024@gmail.com',
  '0123456789',
  'GENERAL',
  'This is a test query to check if the tracking system works properly.',
  'PENDING',
  now()
),
(
  gen_random_uuid(),
  'EDSA20250120-5678',
  'John',
  'Doe',
  '1234567890123',
  'john@test.com',
  '0987654321',
  'APPLICATION_STATUS',
  'I want to check the status of my debt review application.',
  'IN_PROGRESS',
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  'EDSA20250120-9999',
  'Test',
  'User',
  '0000000000000',
  'sudz2024@gmail.com',
  '0123456789',
  'FOLLOW_UP',
  'Following up on my previous query.',
  'RESOLVED',
  now() - interval '1 day'
) ON CONFLICT DO NOTHING;

-- Also add matching client data for application tracking
INSERT INTO "edsa_client_database" (
  id,
  client_id_number,
  first_name,
  last_name,
  email,
  phone,
  gender,
  province,
  branch_name,
  agent_name,
  sale_date,
  sale_reference,
  service_type,
  payment_plan_months,
  bank,
  account_type,
  salary_date,
  total_amount,
  monthly_payment,
  status,
  total_no_payments_made,
  total_no_missed_payments,
  created_at
) VALUES (
  gen_random_uuid(),
  '0000000000000',
  'Test',
  'User',
  'sudz2024@gmail.com',
  '0123456789',
  'Male',
  'KwaZulu-Natal',
  'Erase Debt SA - ADMIN',
  'Test Agent',
  '2025-01-15',
  'EDSA20250120-1234',
  'SERVICE 1 - DRR(C & D3) - NP',
  12,
  'Capitec',
  'Savings',
  '2025-02-01',
  24000.00,
  2000.00,
  'Active',
  3,
  0,
  now()
) ON CONFLICT DO NOTHING;
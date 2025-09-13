/*
  # Create Permanent Audit Log System

  1. New Tables
    - `audit_log` - Permanent audit trail for all system actions
      - `id` (uuid, primary key)
      - `client_reference` (text, sale reference)
      - `client_name` (text, full client name)
      - `action` (text, action performed)
      - `details` (jsonb, detailed information)
      - `timestamp` (timestamptz, when action occurred)
      - `ip_address` (text, user IP)
      - `user_agent` (text, browser/device info)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on audit_log table
    - Add policies for staff access to audit logs

  3. Indexes
    - Add indexes for efficient querying by client reference and timestamp

  4. Notes
    - This creates a permanent audit trail that stores forever
    - All document access, email sends, status changes are logged
    - Used for compliance and legal requirements
*/

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_reference text NOT NULL,
  client_name text NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow staff to view audit logs
CREATE POLICY "Staff can view audit logs"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_log
  FOR INSERT
  TO public
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_client_ref ON audit_log(client_reference);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Function to clean old audit logs (optional - only run manually if needed)
-- This ensures audit logs are kept forever unless manually cleaned
COMMENT ON TABLE audit_log IS 'Permanent audit trail - logs kept forever for compliance';
/*
  # Add service document token column

  1. Table Updates
    - Add `service_document_token` column to `edsa_client_database`
    - This stores secure tokens for accessing personalized service documents

  2. Notes
    - Column allows null values for existing records
    - New clients will have tokens generated during capture
*/

-- Add service document token column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'edsa_client_database' AND column_name = 'service_document_token'
  ) THEN
    ALTER TABLE edsa_client_database ADD COLUMN service_document_token text;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_client_service_token ON edsa_client_database(service_document_token);
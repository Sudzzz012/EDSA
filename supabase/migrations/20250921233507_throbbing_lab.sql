/*
  # Add updated_at column to edsa_users table

  1. Changes
    - Add updated_at column to edsa_users table
    - Set default value to now()
    - Add trigger to automatically update timestamp on row changes
    
  2. Security
    - Maintains existing RLS policies
    - No security changes needed
*/

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'edsa_users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.edsa_users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_edsa_users_updated_at ON public.edsa_users;

-- Create trigger to automatically update updated_at column
CREATE TRIGGER update_edsa_users_updated_at
  BEFORE UPDATE ON public.edsa_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing rows to have updated_at = created_at if created_at exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'edsa_users' AND column_name = 'created_at'
  ) THEN
    UPDATE public.edsa_users 
    SET updated_at = COALESCE(created_at, now())
    WHERE updated_at IS NULL;
  END IF;
END $$;
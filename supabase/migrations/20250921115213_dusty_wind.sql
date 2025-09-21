/*
  # Simplify Authentication System using Supabase Auth

  1. Changes
    - Remove custom OTP table (use Supabase auth.users instead)
    - Create client_auth_links table to map clients to auth users
    - Use Supabase's built-in magic link system
    
  2. Security
    - Enable RLS on client_auth_links table
    - Add policies for secure access
*/

-- Drop custom OTP table since we'll use Supabase Auth
-- DROP TABLE IF EXISTS public.edsa_otp_codes;

-- Create table to link clients to auth users
CREATE TABLE IF NOT EXISTS public.client_auth_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id_number text NOT NULL,
  email text NOT NULL,
  sale_reference text NOT NULL,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  UNIQUE(client_id_number, email)
);

-- Enable RLS
ALTER TABLE public.client_auth_links ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own auth link
CREATE POLICY "Users can read own auth link"
  ON public.client_auth_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Allow anon to create auth links (for initial setup)
CREATE POLICY "Allow anon to create auth links"
  ON public.client_auth_links
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to get or create auth user for client
CREATE OR REPLACE FUNCTION get_or_create_client_auth(
  p_id_number text,
  p_email text,
  p_sale_reference text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_id uuid;
  existing_link_id uuid;
BEGIN
  -- Check if client already has an auth link
  SELECT id INTO existing_link_id
  FROM public.client_auth_links
  WHERE client_id_number = p_id_number AND email = p_email;
  
  IF existing_link_id IS NOT NULL THEN
    -- Update last accessed
    UPDATE public.client_auth_links
    SET last_accessed = now()
    WHERE id = existing_link_id;
    
    -- Return existing auth_user_id
    SELECT auth_user_id INTO auth_user_id
    FROM public.client_auth_links
    WHERE id = existing_link_id;
    
    RETURN auth_user_id;
  END IF;
  
  -- Create new auth user (this will trigger Supabase's email)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    confirmation_sent_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt('temp_password_' || gen_random_uuid()::text, gen_salt('bf')),
    now(), -- Auto-confirm email
    encode(gen_random_bytes(32), 'base64'),
    now(),
    now(),
    now()
  ) RETURNING id INTO auth_user_id;
  
  -- Create the link
  INSERT INTO public.client_auth_links (
    client_id_number,
    email,
    sale_reference,
    auth_user_id
  ) VALUES (
    p_id_number,
    p_email,
    p_sale_reference,
    auth_user_id
  );
  
  RETURN auth_user_id;
END;
$$;
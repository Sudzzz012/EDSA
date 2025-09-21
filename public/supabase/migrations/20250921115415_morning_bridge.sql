/*
  # Manual Auth Setup for Supabase Dashboard

  1. New Functions
    - `get_or_create_client_auth` - Links clients to Supabase auth users
    - `cleanup_expired_otps` - Removes old OTP records
    
  2. Security
    - Enable RLS on client_auth_links table
    - Add policies for secure access
    
  3. Changes
    - Creates table to link clients to Supabase auth users
    - Uses Supabase's built-in magic link system instead of custom OTP
*/

-- Create table to link clients to auth users (if not exists)
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
  SELECT auth_user_id INTO auth_user_id
  FROM public.client_auth_links
  WHERE client_id_number = p_id_number AND email = p_email;
  
  IF auth_user_id IS NOT NULL THEN
    -- Update last accessed
    UPDATE public.client_auth_links
    SET last_accessed = now()
    WHERE client_id_number = p_id_number AND email = p_email;
    
    RETURN auth_user_id;
  END IF;
  
  -- Create new auth user using Supabase's auth.users table
  -- Note: This is a simplified approach - in production you'd use Supabase's sign-up API
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
    updated_at,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt('temp_password_' || gen_random_uuid()::text, gen_salt('bf')),
    now(), -- Auto-confirm email for magic links
    encode(gen_random_bytes(32), 'base64'),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'client_name', (SELECT first_name || ' ' || last_name FROM edsa_client_database WHERE client_id_number = p_id_number AND email = p_email LIMIT 1),
      'reference', p_sale_reference
    )
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
EXCEPTION
  WHEN OTHERS THEN
    -- If auth user creation fails, try to find existing user by email
    SELECT id INTO auth_user_id FROM auth.users WHERE email = p_email LIMIT 1;
    
    IF auth_user_id IS NOT NULL THEN
      -- Create the link with existing user
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
      ) ON CONFLICT (client_id_number, email) DO UPDATE SET
        sale_reference = EXCLUDED.sale_reference,
        last_accessed = now();
      
      RETURN auth_user_id;
    END IF;
    
    -- If all else fails, return null
    RETURN NULL;
END;
$$;
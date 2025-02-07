/*
  # Fix Authentication Issues

  1. Changes
    - Simplify JWT claims handler to prevent schema errors
    - Add proper error handling
    - Ensure consistent claims structure
    - Update user creation trigger
  
  2. Security
    - Maintain RLS policies
    - Add proper grants
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_jwt_claims(jsonb);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create a simplified JWT claims handler
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
BEGIN
  -- Return minimal valid claims structure
  RETURN jwt || jsonb_build_object(
    'role', 'authenticated',
    'iss', 'supabase',
    'aud', 'authenticated'
  );
EXCEPTION WHEN OTHERS THEN
  -- Fallback claims
  RETURN jsonb_build_object(
    'role', 'authenticated',
    'iss', 'supabase',
    'aud', 'authenticated',
    'sub', jwt->>'sub',
    'email', jwt->>'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user profile handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, readings_count, is_premium)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    0,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, users.display_name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
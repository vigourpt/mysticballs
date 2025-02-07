/*
  # Fix JWT Claims Handler

  1. Changes
    - Simplify JWT claims structure
    - Add proper error handling
    - Ensure consistent return type
    - Add default role handling
    - Add proper user metadata handling

  2. Security
    - Enable RLS
    - Update policies
    - Add proper permissions
*/

-- Drop and recreate the JWT claims handler with simplified structure
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'aud', COALESCE(jwt->>'aud', 'authenticated'),
    'role', COALESCE(jwt->>'role', 'authenticated'),
    'email', COALESCE(jwt->>'email', ''),
    'app_metadata', COALESCE(jwt->'app_metadata', '{}'::jsonb),
    'user_metadata', COALESCE(jwt->'user_metadata', '{}'::jsonb)
  );
EXCEPTION WHEN OTHERS THEN
  -- Return basic claims on error
  RETURN jsonb_build_object(
    'aud', 'authenticated',
    'role', 'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO service_role;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies with simplified conditions
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

-- Add insert policy for user creation
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
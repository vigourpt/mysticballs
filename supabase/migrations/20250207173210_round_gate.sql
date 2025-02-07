-- Drop existing JWT claims handler
DROP FUNCTION IF EXISTS public.handle_jwt_claims(jsonb);

-- Create a simplified and robust JWT claims handler
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
BEGIN
  -- Always return a valid claims structure with required fields
  RETURN jsonb_build_object(
    'aud', COALESCE(jwt->>'aud', 'authenticated'),
    'role', 'authenticated',
    'sub', jwt->>'sub',
    'email', COALESCE(jwt->>'email', ''),
    'exp', COALESCE(
      (jwt->>'exp')::bigint,
      extract(epoch from now() + interval '1 hour')::bigint
    ),
    'iat', COALESCE(
      (jwt->>'iat')::bigint,
      extract(epoch from now())::bigint
    ),
    'user_metadata', COALESCE(jwt->'user_metadata', '{}'::jsonb)
  );
EXCEPTION WHEN OTHERS THEN
  -- Fallback claims to prevent auth failures
  RETURN jsonb_build_object(
    'aud', 'authenticated',
    'role', 'authenticated',
    'sub', jwt->>'sub',
    'exp', extract(epoch from now() + interval '1 hour')::bigint,
    'iat', extract(epoch from now())::bigint
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO service_role;

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
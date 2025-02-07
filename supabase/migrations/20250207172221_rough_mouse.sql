-- Drop and recreate the JWT claims handler with proper error handling
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
DECLARE
  user_data users;
  result jsonb;
BEGIN
  -- Get user data if exists
  SELECT * INTO user_data
  FROM users
  WHERE id = (jwt->>'sub')::uuid;

  -- Build the claims object
  result := jsonb_build_object(
    'role', COALESCE(jwt->>'role', 'authenticated'),
    'is_premium', COALESCE(user_data.is_premium, false),
    'readings_count', COALESCE(user_data.readings_count, 0),
    'email', COALESCE(jwt->>'email', ''),
    'app_metadata', jwt->'app_metadata',
    'user_metadata', jwt->'user_metadata'
  );

  -- Return the claims
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, return basic claims to prevent auth failures
  RETURN jsonb_build_object(
    'role', 'authenticated',
    'is_premium', false,
    'readings_count', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
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
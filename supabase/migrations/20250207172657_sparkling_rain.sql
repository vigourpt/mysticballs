-- Drop existing JWT claims handler
DROP FUNCTION IF EXISTS public.handle_jwt_claims(jsonb);

-- Create a more robust JWT claims handler
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
DECLARE
  user_data users;
  default_role text := 'authenticated';
BEGIN
  -- Get user data if exists
  BEGIN
    SELECT *
    INTO user_data
    FROM users
    WHERE id = (jwt->>'sub')::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error fetching user data: %', SQLERRM;
  END;

  -- Build base claims
  RETURN jsonb_build_object(
    'aud', COALESCE(jwt->>'aud', default_role),
    'role', default_role,
    'email', COALESCE(jwt->>'email', ''),
    'sub', jwt->>'sub',
    'exp', jwt->>'exp',
    'iat', jwt->>'iat',
    'user_metadata', COALESCE(jwt->'user_metadata', '{}'::jsonb)
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

-- Create trigger function for user creation
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
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
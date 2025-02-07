-- Create function for JWT claims
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
DECLARE
  user_data users;
BEGIN
  SELECT * INTO user_data
  FROM users
  WHERE id = (jwt->>'sub')::uuid;

  IF user_data.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'is_premium', user_data.is_premium,
      'readings_count', user_data.readings_count,
      'display_name', user_data.display_name
    );
  END IF;

  RETURN jsonb_build_object(
    'is_premium', false,
    'readings_count', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
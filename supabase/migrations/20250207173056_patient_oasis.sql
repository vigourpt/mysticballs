-- Drop existing JWT claims handler
DROP FUNCTION IF EXISTS public.handle_jwt_claims(jsonb);

-- Create a simplified JWT claims handler that always returns valid claims
CREATE OR REPLACE FUNCTION public.handle_jwt_claims(jwt jsonb)
RETURNS jsonb AS $$
BEGIN
  -- Return minimal valid claims structure
  RETURN jsonb_build_object(
    'aud', COALESCE(jwt->>'aud', 'authenticated'),
    'role', 'authenticated',
    'sub', jwt->>'sub',
    'email', COALESCE(jwt->>'email', ''),
    'exp', COALESCE((jwt->>'exp')::bigint, extract(epoch from now() + interval '1 hour')::bigint),
    'iat', COALESCE((jwt->>'iat')::bigint, extract(epoch from now())::bigint)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_jwt_claims(jsonb) TO service_role;
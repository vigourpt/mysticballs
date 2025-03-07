-- Create auth_code_verifiers table
CREATE TABLE IF NOT EXISTS public.auth_code_verifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.auth_code_verifiers ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can manage auth_code_verifiers"
  ON public.auth_code_verifiers
  USING (true)
  WITH CHECK (true);

-- Grant permissions to service role
GRANT ALL ON public.auth_code_verifiers TO service_role;

-- Add comment
COMMENT ON TABLE public.auth_code_verifiers IS 'Stores code verifiers for PKCE authentication flow';

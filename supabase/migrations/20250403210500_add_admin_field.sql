-- Add is_admin field to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set the admin user
UPDATE public.user_profiles 
SET is_admin = TRUE 
WHERE email = 'vigourpt@googlemail.com';

-- Create index for faster admin lookups
CREATE INDEX idx_user_profiles_is_admin ON public.user_profiles (is_admin);

-- Add comment to the column
COMMENT ON COLUMN public.user_profiles.is_admin IS 'Indicates if the user has admin privileges';

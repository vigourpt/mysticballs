/*
  # Add user management functions
  
  1. Functions
    - Add update_updated_at function for timestamp management
    - Add increment_reading_count function for tracking reading usage
  
  2. Triggers
    - Add update_users_updated_at trigger for automatic timestamp updates
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_reading_count(uuid) CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to increment reading count
CREATE OR REPLACE FUNCTION increment_reading_count(user_id uuid)
RETURNS users AS $$
DECLARE
  updated_user users;
BEGIN
  IF auth.uid() <> user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE users
  SET 
    readings_count = readings_count + 1,
    last_reading_date = now()
  WHERE id = user_id
  RETURNING * INTO updated_user;

  RETURN updated_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/*
  # Update users table and policies

  1. Changes
    - Add missing functions and triggers
    - Skip existing policies
  
  2. Security
    - Policies already exist, skipping recreation
  
  3. Functions
    - Add increment_reading_count function
*/

-- Create function to update updated_at timestamp if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    CREATE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Create function to increment reading count if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_reading_count') THEN
    CREATE FUNCTION increment_reading_count(user_id uuid)
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
  END IF;
END $$;
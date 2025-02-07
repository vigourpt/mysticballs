/*
  # Create Function for Incrementing Reading Count

  1. New Function
    - `increment_reading_count`: Safely increments a user's reading count
    - Updates last_reading_date automatically
    - Returns the updated user record

  2. Security
    - Function can only be called by authenticated users
    - Users can only increment their own reading count
*/

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
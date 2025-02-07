/*
  # Create users table and security policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique)
      - `display_name` (text, nullable)
      - `readings_count` (integer)
      - `is_premium` (boolean)
      - `last_reading_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to:
      - Read their own data
      - Update their own data
  
  3. Functions
    - Add trigger for updating updated_at timestamp
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  display_name text,
  readings_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  last_reading_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
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
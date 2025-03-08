/*
  # Add reading history table

  1. New Tables
    - `reading_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `reading_type` (text)
      - `user_input` (jsonb)
      - `reading_output` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on reading_history table
    - Add policies for authenticated users to:
      - Read their own reading history
    - Add policy for service role
*/

-- Create reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL,
    user_input JSONB NOT NULL,
    reading_output TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_reading_type ON reading_history(reading_type);
CREATE INDEX IF NOT EXISTS idx_reading_history_created_at ON reading_history(created_at);

-- Enable Row Level Security
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own reading history
CREATE POLICY "Users can read own reading history"
  ON reading_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for service role
CREATE POLICY "Service role can do anything with reading history"
  ON reading_history
  USING (auth.role() = 'service_role');

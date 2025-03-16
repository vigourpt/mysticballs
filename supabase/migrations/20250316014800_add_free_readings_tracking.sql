/*
  # Add Free Readings Tracking and Conversion Analytics

  1. Changes
    - Add anonymous_readings table to track free readings by device
    - Add conversion_events table to track user conversion events
    - Add sync_anonymous_readings function to sync localStorage readings when a user signs in
    - Add validate_reading_limit function to prevent bypassing reading limits
    - Add track_conversion_event function for analytics
*/

-- Create anonymous_readings table to track free readings by device
CREATE TABLE IF NOT EXISTS public.anonymous_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  readings_count INTEGER NOT NULL DEFAULT 0,
  last_reading_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_anonymous_readings_device_id ON public.anonymous_readings(device_id);

-- Enable Row Level Security
ALTER TABLE public.anonymous_readings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can manage anonymous_readings"
  ON public.anonymous_readings
  USING (true)
  WITH CHECK (true);

-- Grant permissions to service role
GRANT ALL ON public.anonymous_readings TO service_role;

-- Create conversion_events table for analytics
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  device_id TEXT,
  previous_readings_count INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON public.conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON public.conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON public.conversion_events(created_at);

-- Enable Row Level Security
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read conversion events
CREATE POLICY "Admin users can read conversion events"
  ON public.conversion_events
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create policy for service role
CREATE POLICY "Service role can manage conversion events"
  ON public.conversion_events
  USING (true)
  WITH CHECK (true);

-- Grant permissions to service role
GRANT ALL ON public.conversion_events TO service_role;

-- Create function to sync anonymous readings when a user signs in
CREATE OR REPLACE FUNCTION public.sync_anonymous_readings(
  p_user_id UUID,
  p_device_id TEXT,
  p_readings_count INTEGER
)
RETURNS void AS $$
DECLARE
  v_user_profile public.user_profiles;
  v_anonymous_readings public.anonymous_readings;
BEGIN
  -- Get user profile
  SELECT * INTO v_user_profile
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  IF v_user_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Get anonymous readings for device
  SELECT * INTO v_anonymous_readings
  FROM public.anonymous_readings
  WHERE device_id = p_device_id;
  
  -- If no anonymous readings record exists, create one
  IF v_anonymous_readings IS NULL THEN
    INSERT INTO public.anonymous_readings (device_id, readings_count, last_reading_date)
    VALUES (p_device_id, p_readings_count, NOW());
  ELSE
    -- Update anonymous readings count if provided count is higher
    IF p_readings_count > v_anonymous_readings.readings_count THEN
      UPDATE public.anonymous_readings
      SET 
        readings_count = p_readings_count,
        updated_at = NOW()
      WHERE device_id = p_device_id;
    END IF;
  END IF;
  
  -- Track conversion event
  INSERT INTO public.conversion_events (
    user_id,
    event_type,
    device_id,
    previous_readings_count,
    metadata
  )
  VALUES (
    p_user_id,
    'sign_in',
    p_device_id,
    p_readings_count,
    jsonb_build_object(
      'user_readings_count', v_user_profile.readings_count,
      'is_premium', v_user_profile.is_premium
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate reading limits
CREATE OR REPLACE FUNCTION public.validate_reading_limit(
  p_user_id UUID,
  p_device_id TEXT DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_user_profile public.user_profiles;
  v_subscription public.subscriptions;
  v_anonymous_readings public.anonymous_readings;
  v_free_limit INTEGER := 2;  -- Free readings limit for anonymous users
  v_basic_limit INTEGER := 50; -- Monthly limit for basic users
BEGIN
  -- For authenticated users
  IF p_user_id IS NOT NULL THEN
    -- Get user profile
    SELECT * INTO v_user_profile
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    IF v_user_profile IS NULL THEN
      -- New user with no profile yet, they get 3 free readings
      RETURN TRUE;
    END IF;
    
    -- Premium users have unlimited readings
    IF v_user_profile.is_premium THEN
      RETURN TRUE;
    END IF;
    
    -- Basic plan users have a monthly limit
    IF v_user_profile.plan_type = 'basic' THEN
      RETURN v_user_profile.readings_count < v_basic_limit;
    END IF;
    
    -- Free users have 3 additional readings when signed in
    RETURN v_user_profile.readings_count < 3;
  ELSE
    -- For anonymous users
    IF p_device_id IS NULL THEN
      RETURN FALSE;
    END IF;
    
    -- Get anonymous readings for device
    SELECT * INTO v_anonymous_readings
    FROM public.anonymous_readings
    WHERE device_id = p_device_id;
    
    -- If no record exists, they have all free readings available
    IF v_anonymous_readings IS NULL THEN
      RETURN TRUE;
    END IF;
    
    -- Check if they've used all free readings
    RETURN v_anonymous_readings.readings_count < v_free_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track conversion events
CREATE OR REPLACE FUNCTION public.track_conversion_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_device_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_profile public.user_profiles;
  v_anonymous_readings public.anonymous_readings;
  v_previous_readings_count INTEGER := 0;
BEGIN
  -- Get user profile if user_id is provided
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_user_profile
    FROM public.user_profiles
    WHERE id = p_user_id;
  END IF;
  
  -- Get anonymous readings if device_id is provided
  IF p_device_id IS NOT NULL THEN
    SELECT * INTO v_anonymous_readings
    FROM public.anonymous_readings
    WHERE device_id = p_device_id;
    
    IF v_anonymous_readings IS NOT NULL THEN
      v_previous_readings_count := v_anonymous_readings.readings_count;
    END IF;
  END IF;
  
  -- Insert conversion event
  INSERT INTO public.conversion_events (
    user_id,
    event_type,
    device_id,
    previous_readings_count,
    metadata
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_device_id,
    v_previous_readings_count,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment anonymous reading count
CREATE OR REPLACE FUNCTION public.increment_anonymous_reading_count(
  p_device_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_anonymous_readings public.anonymous_readings;
  v_updated_count INTEGER;
BEGIN
  -- Get anonymous readings for device
  SELECT * INTO v_anonymous_readings
  FROM public.anonymous_readings
  WHERE device_id = p_device_id;
  
  -- If no record exists, create one
  IF v_anonymous_readings IS NULL THEN
    INSERT INTO public.anonymous_readings (device_id, readings_count, last_reading_date)
    VALUES (p_device_id, 1, NOW())
    RETURNING readings_count INTO v_updated_count;
  ELSE
    -- Update existing record
    UPDATE public.anonymous_readings
    SET 
      readings_count = readings_count + 1,
      last_reading_date = NOW(),
      updated_at = NOW()
    WHERE device_id = p_device_id
    RETURNING readings_count INTO v_updated_count;
  END IF;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify the existing increment_reading_count function to use validate_reading_limit
CREATE OR REPLACE FUNCTION increment_reading_count(p_id uuid)
RETURNS void AS $$
DECLARE
  can_read BOOLEAN;
BEGIN
  -- Validate reading limit
  SELECT public.validate_reading_limit(p_id) INTO can_read;
  
  IF NOT can_read THEN
    RAISE EXCEPTION 'Reading limit exceeded';
  END IF;

  -- Increment reading count
  UPDATE public.user_profiles
  SET 
    readings_count = readings_count + 1,
    last_reading_date = now(),
    updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

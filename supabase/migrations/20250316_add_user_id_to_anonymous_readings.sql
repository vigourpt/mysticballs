-- Add user_id column to anonymous_readings table
ALTER TABLE public.anonymous_readings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_anonymous_readings_user_id ON public.anonymous_readings(user_id);

-- Update the sync_anonymous_readings function to properly handle user_id
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
    INSERT INTO public.anonymous_readings (device_id, readings_count, last_reading_date, user_id)
    VALUES (p_device_id, p_readings_count, NOW(), p_user_id);
  ELSE
    -- Update anonymous readings count if provided count is higher
    IF p_readings_count > v_anonymous_readings.readings_count THEN
      UPDATE public.anonymous_readings
      SET 
        readings_count = p_readings_count,
        updated_at = NOW(),
        user_id = p_user_id
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

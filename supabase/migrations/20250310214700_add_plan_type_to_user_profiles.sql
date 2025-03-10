-- Add plan_type column to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS plan_type TEXT;

-- Update existing premium users to have a default plan_type of 'premium'
UPDATE public.user_profiles SET plan_type = 'premium' WHERE is_premium = true AND plan_type IS NULL;

-- Create a function to update plan_type based on subscription plan_id
CREATE OR REPLACE FUNCTION update_plan_type_from_subscription() RETURNS TRIGGER AS $$
BEGIN
  -- Check if the subscription has a plan_id
  IF NEW.plan_id IS NOT NULL THEN
    -- Update the user's plan_type based on the plan_id
    IF NEW.plan_id LIKE '%premium%' THEN
      UPDATE public.user_profiles SET plan_type = 'premium' WHERE id = NEW.user_id;
    ELSIF NEW.plan_id LIKE '%basic%' THEN
      UPDATE public.user_profiles SET plan_type = 'basic' WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update plan_type when a subscription is created or updated
DROP TRIGGER IF EXISTS update_plan_type_trigger ON public.subscriptions;
CREATE TRIGGER update_plan_type_trigger
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_plan_type_from_subscription();

-- Update existing users' plan_type based on their subscription plan_id
DO $$
DECLARE
  sub RECORD;
BEGIN
  FOR sub IN SELECT * FROM public.subscriptions WHERE plan_id IS NOT NULL LOOP
    IF sub.plan_id LIKE '%premium%' THEN
      UPDATE public.user_profiles SET plan_type = 'premium' WHERE id = sub.user_id;
    ELSIF sub.plan_id LIKE '%basic%' THEN
      UPDATE public.user_profiles SET plan_type = 'basic' WHERE id = sub.user_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

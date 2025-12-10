-- Fix handle_new_user function to include business_name and address fields
-- These fields were lost when the function was updated for subscription fields

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    business_name,
    phone,
    address,
    subscription_status,
    subscription_plan
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'address', NULL),
    'inactive',  -- New users start without subscription
    NULL         -- No plan until they subscribe
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION handle_new_user() IS 
  'Creates a profile for new users with data from signup metadata (full_name, business_name, phone, address)';


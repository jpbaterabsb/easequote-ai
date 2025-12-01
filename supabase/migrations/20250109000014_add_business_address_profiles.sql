-- Add business_name and address fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.business_name IS 'Name of the user business/company';
COMMENT ON COLUMN profiles.address IS 'Business address in Google format';

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'address', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


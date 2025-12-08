-- Add beta agreement columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS beta_agreement_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS beta_agreement_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS beta_agreement_version TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.beta_agreement_accepted IS 'Whether user has accepted the beta agreement';
COMMENT ON COLUMN public.profiles.beta_agreement_date IS 'When the user accepted the beta agreement';
COMMENT ON COLUMN public.profiles.beta_agreement_version IS 'Version of the beta agreement accepted';


-- Add Stripe subscription columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN public.profiles.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Subscription status: active, inactive, past_due, cancelled, trialing';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Stripe price ID of the subscription plan';
COMMENT ON COLUMN public.profiles.subscription_end_date IS 'When the current subscription period ends';


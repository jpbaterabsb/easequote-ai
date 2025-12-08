-- Fix subscription column sizes to accommodate Stripe IDs
-- Stripe IDs can be up to 255 characters

ALTER TABLE public.profiles
ALTER COLUMN subscription_id TYPE TEXT,
ALTER COLUMN subscription_plan TYPE TEXT,
ALTER COLUMN stripe_customer_id TYPE TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.subscription_id IS 'Stripe subscription ID (e.g., sub_xxx)';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Stripe price ID of the subscription plan (e.g., price_xxx)';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID (e.g., cus_xxx)';


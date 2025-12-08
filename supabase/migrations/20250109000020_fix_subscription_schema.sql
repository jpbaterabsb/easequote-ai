-- Fix subscription schema for Stripe integration
-- This migration fixes all subscription-related issues

-- =====================================================
-- 1. REMOVE OLD CONSTRAINTS
-- =====================================================
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;

-- =====================================================
-- 2. FIX COLUMN TYPES AND DEFAULTS
-- =====================================================

-- subscription_status: default should be 'inactive' for new users
ALTER TABLE public.profiles
ALTER COLUMN subscription_status TYPE TEXT,
ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- subscription_plan: remove default, allow any value
ALTER TABLE public.profiles
ALTER COLUMN subscription_plan TYPE TEXT,
ALTER COLUMN subscription_plan DROP DEFAULT;

-- Add stripe_price_id column to store the actual Stripe price ID
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- =====================================================
-- 3. UPDATE EXISTING USERS WITHOUT SUBSCRIPTION
-- =====================================================
-- Set users without subscription_id to 'inactive'
UPDATE public.profiles
SET subscription_status = 'inactive'
WHERE subscription_id IS NULL 
  AND subscription_status != 'inactive';

-- Clear subscription_plan for users without subscription
UPDATE public.profiles
SET subscription_plan = NULL
WHERE subscription_id IS NULL;

-- =====================================================
-- 4. UPDATE handle_new_user FUNCTION
-- =====================================================
-- New users should start with 'inactive' subscription status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone,
    subscription_status,
    subscription_plan
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'inactive',  -- New users start without subscription
    NULL         -- No plan until they subscribe
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ADD INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date 
ON public.profiles(subscription_end_date);

-- =====================================================
-- 6. UPDATE COMMENTS
-- =====================================================
COMMENT ON COLUMN public.profiles.subscription_status IS 
  'Subscription status: inactive (default for new users), active, past_due, canceled, trialing, incomplete';

COMMENT ON COLUMN public.profiles.subscription_plan IS 
  'Subscription plan name: pro, gold, etc. NULL if no active subscription';

COMMENT ON COLUMN public.profiles.stripe_price_id IS 
  'Stripe price ID (e.g., price_xxx) for the current subscription';


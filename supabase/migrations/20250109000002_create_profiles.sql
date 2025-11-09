-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  company_logo_url TEXT,
  language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'es', 'pt')),
  subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro')),
  subscription_status VARCHAR(20) DEFAULT 'active',
  monthly_quote_limit INT DEFAULT 30,
  quotes_used_this_month INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


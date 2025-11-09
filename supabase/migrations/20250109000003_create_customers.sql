-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email) -- Prevent duplicate customers per user
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_name ON customers(user_id, name); -- For autocomplete

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own customers"
  ON customers
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


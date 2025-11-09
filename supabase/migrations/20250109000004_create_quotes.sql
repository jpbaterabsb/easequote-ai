-- Create quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(20) UNIQUE NOT NULL, -- QT-YYYYMMDD-XXXX (will be set by trigger)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Customer info (denormalized for historical accuracy)
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_state VARCHAR(50),
  customer_zip VARCHAR(20),
  customer_lat DECIMAL(10, 8),
  customer_lng DECIMAL(11, 8),
  
  -- Quote details
  status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'sent', 'accepted', 'rejected', 'in_progress', 'completed')),
  notes TEXT,
  customer_provides_materials BOOLEAN DEFAULT FALSE,
  material_cost DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  CONSTRAINT positive_amounts CHECK (subtotal >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(user_id, status);
CREATE INDEX idx_quotes_created_at ON quotes(user_id, created_at DESC);
CREATE INDEX idx_quotes_deleted_at ON quotes(deleted_at); -- For soft delete queries

-- RLS Policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own quotes"
  ON quotes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


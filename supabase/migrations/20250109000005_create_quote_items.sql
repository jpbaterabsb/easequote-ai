-- Create quote_items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Item details
  item_name VARCHAR(200) NOT NULL,
  area DECIMAL(10, 2) NOT NULL, -- Square feet
  price_per_sqft DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  
  -- Optional fields
  start_date DATE,
  end_date DATE,
  payment_method VARCHAR(50), -- 'credit_card', 'debit_card', 'cash', 'check', 'zelle'
  
  -- Add-ons stored as JSONB for flexibility
  addons JSONB DEFAULT '[]', 
  -- Example: [{"name": "Vinyl - Plank - 122x18cm", "price": 150.00}, {...}]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_values CHECK (area > 0 AND price_per_sqft >= 0 AND line_total >= 0)
);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- RLS Policies
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access items of own quotes"
  ON quote_items
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );


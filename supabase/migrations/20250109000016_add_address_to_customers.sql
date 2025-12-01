-- Add address fields to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip VARCHAR(20),
ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);

-- Add comment for documentation
COMMENT ON COLUMN customers.address IS 'Customer street address';
COMMENT ON COLUMN customers.city IS 'Customer city';
COMMENT ON COLUMN customers.state IS 'Customer state/province';
COMMENT ON COLUMN customers.zip IS 'Customer ZIP/postal code';
COMMENT ON COLUMN customers.lat IS 'Latitude for address';
COMMENT ON COLUMN customers.lng IS 'Longitude for address';


-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  date_prefix TEXT;
  seq_num INT;
BEGIN
  date_prefix := 'QT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 16) AS INT)), 0) + 1
  INTO seq_num
  FROM quotes
  WHERE quote_number LIKE date_prefix || '%';
  
  NEW.quote_number := date_prefix || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset monthly quote counters
CREATE OR REPLACE FUNCTION reset_monthly_quote_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET quotes_used_this_month = 0
  WHERE DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', updated_at);
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


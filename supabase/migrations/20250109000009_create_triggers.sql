-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create trigger for quote number generation
CREATE TRIGGER set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW 
  WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
  EXECUTE FUNCTION generate_quote_number();

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


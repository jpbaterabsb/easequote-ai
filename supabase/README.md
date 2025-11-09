# Supabase Database Migrations

This directory contains all database migrations for the EaseQuote AI project.

## Migration Files

1. `20250109000001_enable_extensions.sql` - Enable UUID extension
2. `20250109000002_create_profiles.sql` - Create profiles table with RLS
3. `20250109000003_create_customers.sql` - Create customers table with RLS
4. `20250109000004_create_quotes.sql` - Create quotes table with RLS
5. `20250109000005_create_quote_items.sql` - Create quote_items table with RLS
6. `20250109000006_create_quote_emails.sql` - Create quote_emails table with RLS
7. `20250109000007_create_audit_log.sql` - Create audit_log table with RLS
8. `20250109000008_create_functions.sql` - Create database functions
9. `20250109000009_create_triggers.sql` - Create database triggers
10. `20250109000010_create_storage_buckets.sql` - Storage bucket documentation
11. `20250109000011_create_storage_policies.sql` - Storage RLS policies

## Applying Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref njkizbytxifukrhnogxh

# Apply all migrations
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (00001 through 00011)
4. Copy and paste the SQL content and execute

### Option 3: Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.njkizbytxifukrhnogxh.supabase.co:5432/postgres"

# Run migrations in order
\i supabase/migrations/20250109000001_enable_extensions.sql
\i supabase/migrations/20250109000002_create_profiles.sql
# ... continue for all files
```

## Storage Buckets Setup

Storage buckets must be created manually via Supabase Dashboard before running migration 00011:

1. Go to **Storage** in Supabase Dashboard
2. Create three buckets:

   **avatars** (Public)
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 2MB
   - Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`

   **logos** (Public)
   - Name: `logos`
   - Public: ✅ Yes
   - File size limit: 2MB
   - Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`

   **pdfs** (Private)
   - Name: `pdfs`
   - Public: ❌ No
   - File size limit: 10MB
   - Allowed MIME types: `application/pdf`

3. After creating buckets, run migration `20250109000011_create_storage_policies.sql` to set up RLS policies

## Verification

After applying migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## Rollback

To rollback migrations, you can drop tables in reverse order:

```sql
-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_quote_number ON quotes;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS reset_monthly_quote_counters();
DROP FUNCTION IF EXISTS generate_quote_number();
DROP FUNCTION IF EXISTS update_updated_at();

-- Drop tables (in reverse order)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS quote_emails CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

## Notes

- All migrations include Row Level Security (RLS) policies
- The `handle_new_user()` function automatically creates a profile when a user signs up
- Quote numbers are auto-generated via trigger in format: `QT-YYYYMMDD-XXXX`
- Storage buckets must be created manually before applying storage policies
- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling


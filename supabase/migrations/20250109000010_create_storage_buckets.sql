-- Create Storage buckets
-- Note: Storage buckets are created via Supabase Dashboard or API
-- This SQL file documents the bucket configuration

-- Bucket: avatars (public)
-- Created via: Supabase Dashboard > Storage > New Bucket
-- Settings:
--   - Name: avatars
--   - Public: true
--   - File size limit: 2MB
--   - Allowed MIME types: image/jpeg, image/jpg, image/png

-- Bucket: logos (public)
-- Created via: Supabase Dashboard > Storage > New Bucket
-- Settings:
--   - Name: logos
--   - Public: true
--   - File size limit: 2MB
--   - Allowed MIME types: image/jpeg, image/jpg, image/png

-- Bucket: pdfs (private)
-- Created via: Supabase Dashboard > Storage > New Bucket
-- Settings:
--   - Name: pdfs
--   - Public: false
--   - File size limit: 10MB
--   - Allowed MIME types: application/pdf

-- Storage RLS Policies will be created in the next migration file


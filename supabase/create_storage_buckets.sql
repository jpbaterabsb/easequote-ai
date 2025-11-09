-- Script to create storage buckets via Supabase SQL
-- Note: Storage buckets are typically created via Dashboard or API
-- This is a reference script

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create logos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create pdfs bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;


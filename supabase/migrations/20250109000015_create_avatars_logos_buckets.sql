-- Create storage buckets for avatars and logos
-- This migration ensures the buckets exist

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create logos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own logo" ON storage.objects;
DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own logo" ON storage.objects;

-- Policy: Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Avatars are publicly accessible
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Users can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Users can upload own logo
CREATE POLICY "Users can upload own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Logos are publicly accessible
CREATE POLICY "Logos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Policy: Users can update own logo
CREATE POLICY "Users can update own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete own logo
CREATE POLICY "Users can delete own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

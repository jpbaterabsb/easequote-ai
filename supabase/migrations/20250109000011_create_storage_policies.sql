-- Storage RLS Policies
-- Note: These policies assume buckets are already created
-- Run this after creating buckets via Supabase Dashboard

-- Policy: Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Avatars are publicly accessible
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Users can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can upload own logo
CREATE POLICY "Users can upload own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Logos are publicly accessible
CREATE POLICY "Logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Policy: Users can update own logo
CREATE POLICY "Users can update own logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete own logo
CREATE POLICY "Users can delete own logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: PDFs accessible by owner only
CREATE POLICY "PDFs accessible by owner only"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can upload PDFs for own quotes
CREATE POLICY "Users can upload own PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete own PDFs
CREATE POLICY "Users can delete own PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);


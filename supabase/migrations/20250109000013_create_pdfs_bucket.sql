-- Create pdfs storage bucket
-- This bucket stores generated PDF quotes (private)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS policies for this bucket are already created in migration 20250109000011_create_storage_policies.sql


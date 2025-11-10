-- Create translation_cache table for caching translations
CREATE TABLE translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_language VARCHAR(2) NOT NULL CHECK (source_language IN ('en', 'es', 'pt')),
  target_language VARCHAR(2) NOT NULL CHECK (target_language IN ('en', 'es', 'pt')),
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique translations
  UNIQUE(source_language, target_language, source_text)
);

CREATE INDEX idx_translation_cache_lookup ON translation_cache(source_language, target_language, source_text);

-- RLS Policies
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read translations (public cache)
CREATE POLICY "Anyone can read translations"
  ON translation_cache FOR SELECT
  USING (true);

-- Only service role can insert/update translations (via Edge Functions)
-- This will be handled by Edge Functions with service role key


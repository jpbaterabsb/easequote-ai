# Supabase Edge Functions

This directory contains Supabase Edge Functions for the EaseQuote AI application.

## Functions

### 1. `generate-pdf`

Generates a professional PDF quote document in multiple languages.

**Endpoint:** `POST /functions/v1/generate-pdf`

**Request Body:**
```json
{
  "quote_id": "uuid",
  "language": "en" | "es" | "pt"
}
```

**Response:**
```json
{
  "pdf_url": "https://signed-url-to-pdf",
  "file_name": "quotes/user-id/quote-id-timestamp.pdf"
}
```

**Features:**
- Generates PDF with company logo, customer info, line items, and summary
- Supports English, Spanish, and Portuguese
- Automatically translates content using Gemini API
- Uploads PDF to Supabase Storage
- Returns signed URL valid for 1 hour

**Environment Variables Required:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `GEMINI_API_KEY` - Google Gemini API key for translations

---

### 2. `translate-quote`

Translates quote content (item names, add-ons, notes) using Google Gemini API.

**Endpoint:** `POST /functions/v1/translate-quote`

**Request Body:**
```json
{
  "quote_id": "uuid",
  "target_language": "en" | "es" | "pt",
  "items": [
    {
      "item_name": "string",
      "addons": [{"name": "string"}]
    }
  ],
  "notes": "string | null"
}
```

**Response:**
```json
{
  "items": [
    {
      "item_name": "translated string",
      "addons": [{"name": "translated string"}]
    }
  ],
  "notes": "translated string | null",
  "translations": {
    "source_text": "translated_text"
  }
}
```

**Features:**
- Translates item names, add-on names, and notes
- Caches translations in database to reduce API calls
- Preserves numbers, currency symbols, and proper nouns
- Falls back to original text if translation fails

**Environment Variables Required:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `GEMINI_API_KEY` - Google Gemini API key

---

## Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Set environment secrets:
   ```bash
   supabase secrets set GEMINI_API_KEY=your-gemini-api-key
   ```

4. Deploy functions:
   ```bash
   supabase functions deploy generate-pdf
   supabase functions deploy translate-quote
   ```

## Local Development

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. Serve functions locally:
   ```bash
   supabase functions serve generate-pdf --env-file .env.local
   supabase functions serve translate-quote --env-file .env.local
   ```

## Database Requirements

- `translation_cache` table must exist (see migration `20250109000012_create_translation_cache.sql`)
- `pdfs` storage bucket must exist and be configured
- RLS policies must allow service role to insert into `translation_cache`


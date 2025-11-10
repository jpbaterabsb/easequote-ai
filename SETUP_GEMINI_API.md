# 🔑 Setting Up Gemini API Key

Your Google Gemini API key has been provided. Here's how to set it up securely:

## ✅ Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed and your project linked:

```bash
# Link your project (if not already linked)
supabase link --project-ref njkizbytxifukrhnogxh

# Set the Gemini API key as a secret
supabase secrets set GEMINI_API_KEY=AIzaSyClwF0K8LlimVU2DgZff5kagX9kimcOdso
```

## ✅ Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com/project/njkizbytxifukrhnogxh
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add Secret**
4. Set:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyClwF0K8LlimVU2DgZff5kagX9kimcOdso`
5. Click **Save**

## ✅ Option 3: Using Supabase CLI (Alternative Method)

If you prefer to set it via environment variable:

```bash
export GEMINI_API_KEY=AIzaSyClwF0K8LlimVU2DgZff5kagX9kimcOdso
supabase secrets set GEMINI_API_KEY
```

## 🔒 Security Notes

⚠️ **IMPORTANT:** 
- Never commit API keys to version control
- Never share API keys publicly
- Keep this key secure and rotate it if compromised
- The key is stored securely in Supabase and only accessible to Edge Functions

## ✅ Verify Setup

After setting the secret, verify it's configured:

```bash
# List all secrets (will show secret names, not values)
supabase secrets list
```

Or check in the Supabase Dashboard under **Project Settings** → **Edge Functions** → **Secrets**

## 🚀 Next Steps

1. ✅ Set the API key (using one of the methods above)
2. ✅ Deploy the Edge Functions:
   ```bash
   supabase functions deploy generate-pdf
   supabase functions deploy translate-quote
   ```
3. ✅ Test PDF generation from the quote detail page

## 🧪 Testing

Once set up, you can test the translation by:
1. Navigate to any quote detail page
2. Click "Download PDF"
3. Select a language (Spanish or Portuguese)
4. The PDF should be generated with translated content

---

**Your API Key:** `AIzaSyClwF0K8LlimVU2DgZff5kagX9kimcOdso`  
**Project:** `njkizbytxifukrhnogxh`


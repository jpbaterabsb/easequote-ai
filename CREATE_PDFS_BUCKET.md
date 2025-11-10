# ✅ PDFs Storage Bucket Created

The `pdfs` storage bucket has been created successfully via migration `20250109000013_create_pdfs_bucket.sql`.

## Bucket Configuration

- **Name:** `pdfs`
- **Public:** No (Private bucket)
- **File size limit:** 10MB
- **Allowed MIME types:** `application/pdf`

## Storage Policies

The RLS policies for the `pdfs` bucket are already configured in migration `20250109000011_create_storage_policies.sql`:

1. **Users can upload own PDFs** - Users can upload PDFs to their own folder (`quotes/{user_id}/...`)
2. **PDFs accessible by owner only** - Users can only access PDFs in their own folder
3. **Users can delete own PDFs** - Users can delete their own PDFs

## Edge Function Access

Edge Functions use the service role key, which bypasses RLS policies. This means:
- ✅ Edge Functions can upload PDFs to any user's folder
- ✅ Edge Functions can generate signed URLs for any PDF
- ✅ The function validates that the user owns the quote before generating the PDF

## File Structure

PDFs are stored with this structure:
```
pdfs/
  └── quotes/
      └── {user_id}/
          └── {quote_id}-{timestamp}.pdf
```

Example:
```
pdfs/quotes/987b02e9-24c8-4c7d-866e-ab7b5b9401e2/789e4b98-4322-40d2-99c9-396024f492be-1762670966270.pdf
```

## Verification

To verify the bucket was created:

1. **Via Supabase Dashboard:**
   - Go to Storage → Buckets
   - You should see the `pdfs` bucket listed

2. **Via SQL:**
   ```sql
   SELECT id, name, public, file_size_limit, allowed_mime_types 
   FROM storage.buckets 
   WHERE id = 'pdfs';
   ```

## Next Steps

The PDF generation should now work! Try generating a PDF again:
1. Go to a quote detail page
2. Click "Download PDF"
3. Select a language
4. The PDF should be generated and downloaded successfully

If you still encounter issues, check the Edge Function logs for more details.


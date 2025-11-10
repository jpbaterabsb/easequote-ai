import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranslationRequest {
  quote_id: string
  target_language: 'en' | 'es' | 'pt'
  items: Array<{
    item_name: string
    addons: Array<{ name: string }>
  }>
  notes?: string | null
}

serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  console.log(`[${requestId}] translate-quote: Request started`, {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] translate-quote: CORS preflight request`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error(`[${requestId}] translate-quote: Missing authorization header`)
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error(`[${requestId}] translate-quote: GEMINI_API_KEY not configured`)
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { quote_id, target_language, items, notes }: TranslationRequest = await req.json()
    
    console.log(`[${requestId}] translate-quote: Processing request`, {
      quote_id,
      target_language,
      items_count: items.length,
      has_notes: !!notes,
      total_texts: items.reduce((sum, item) => sum + 1 + item.addons.length, notes ? 1 : 0),
    })

    // Check cache first
    const translations: Record<string, string> = {}
    const textsToTranslate: string[] = []

    // Collect all texts that need translation
    for (const item of items) {
      textsToTranslate.push(item.item_name)
      for (const addon of item.addons) {
        textsToTranslate.push(addon.name)
      }
    }
    if (notes) {
      textsToTranslate.push(notes)
    }

    // Check cache for each text
    const cacheStartTime = Date.now()
    let cacheHits = 0
    let cacheMisses = 0
    
    for (const text of textsToTranslate) {
      const { data: cached, error: cacheError } = await supabase
        .from('translation_cache')
        .select('translated_text')
        .eq('source_language', 'en')
        .eq('target_language', target_language)
        .eq('source_text', text)
        .single()

      if (cacheError && cacheError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected for cache misses
        console.warn(`[${requestId}] translate-quote: Cache lookup error`, {
          text: text.substring(0, 50),
          error: cacheError.message,
        })
      }

      if (cached) {
        translations[text] = cached.translated_text
        cacheHits++
      } else {
        cacheMisses++
      }
    }
    
    const cacheTime = Date.now() - cacheStartTime
    console.log(`[${requestId}] translate-quote: Cache check completed`, {
      cache_hits: cacheHits,
      cache_misses: cacheMisses,
      cache_time_ms: cacheTime,
    })

    // Translate texts not in cache
    const textsToFetch = textsToTranslate.filter((text) => !translations[text])
    if (textsToFetch.length > 0) {
      console.log(`[${requestId}] translate-quote: Translating ${textsToFetch.length} texts via Gemini API`)
      const geminiStartTime = Date.now()
      
      // Use Gemini API to translate
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`
      
      const prompt = `Translate the following quote content from English to ${target_language === 'es' ? 'Spanish' : target_language === 'pt' ? 'Portuguese' : 'English'}. 
Preserve all numbers, currency symbols ($), dates, proper nouns (customer names, addresses), and formatting.
Return ONLY a JSON array of translations in the same order as the input texts, with no additional text or explanation.

Input texts:
${JSON.stringify(textsToFetch, null, 2)}

Return format: ["translation1", "translation2", ...]`

      console.log(`[${requestId}] translate-quote: Calling Gemini API`, {
        texts_count: textsToFetch.length,
        prompt_length: prompt.length,
      })

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      const geminiTime = Date.now() - geminiStartTime

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error(`[${requestId}] translate-quote: Gemini API error`, {
          status: geminiResponse.status,
          statusText: geminiResponse.statusText,
          error: errorText.substring(0, 500),
          response_time_ms: geminiTime,
        })
        throw new Error(`Gemini API error: ${geminiResponse.status}`)
      }
      
      console.log(`[${requestId}] translate-quote: Gemini API response received`, {
        status: geminiResponse.status,
        response_time_ms: geminiTime,
      })

      const geminiData = await geminiResponse.json()
      let translatedTexts: string[]
      
      try {
        const responseText = geminiData.candidates[0].content.parts[0].text.trim()
        // Try to parse as JSON array
        if (responseText.startsWith('[') && responseText.endsWith(']')) {
          translatedTexts = JSON.parse(responseText)
        } else {
          // If not JSON, split by newlines or extract array from markdown code blocks
          const jsonMatch = responseText.match(/\[.*\]/s)
          if (jsonMatch) {
            translatedTexts = JSON.parse(jsonMatch[0])
          } else {
            // Fallback: split by lines
            translatedTexts = responseText.split('\n').filter(line => line.trim())
          }
        }
      } catch (parseError) {
        console.error(`[${requestId}] translate-quote: Failed to parse Gemini response`, {
          error: parseError.message,
          response_preview: geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 200),
        })
        // Fallback to original texts if parsing fails
        translatedTexts = textsToFetch
      }

      // Store translations in cache
      const cacheStoreStartTime = Date.now()
      let cacheStoreSuccess = 0
      let cacheStoreErrors = 0
      
      for (let i = 0; i < textsToFetch.length; i++) {
        const sourceText = textsToFetch[i]
        const translatedText = translatedTexts[i] || sourceText // Fallback to original if translation fails
        
        translations[sourceText] = translatedText

        // Cache the translation
        const { error: cacheStoreError } = await supabase.from('translation_cache').upsert({
          source_language: 'en',
          target_language: target_language,
          source_text: sourceText,
          translated_text: translatedText,
        })
        
        if (cacheStoreError) {
          console.warn(`[${requestId}] translate-quote: Failed to cache translation`, {
            text: sourceText.substring(0, 50),
            error: cacheStoreError.message,
          })
          cacheStoreErrors++
        } else {
          cacheStoreSuccess++
        }
      }
      
      const cacheStoreTime = Date.now() - cacheStoreStartTime
      console.log(`[${requestId}] translate-quote: Cache storage completed`, {
        stored: cacheStoreSuccess,
        errors: cacheStoreErrors,
        cache_store_time_ms: cacheStoreTime,
      })
    } else {
      console.log(`[${requestId}] translate-quote: All translations found in cache, skipping Gemini API call`)
    }

    // Build translated quote structure
    const translatedItems = items.map((item) => ({
      item_name: translations[item.item_name] || item.item_name,
      addons: item.addons.map((addon) => ({
        name: translations[addon.name] || addon.name,
      })),
    }))

    const translatedNotes = notes ? (translations[notes] || notes) : null

    const totalTime = Date.now() - startTime
    console.log(`[${requestId}] translate-quote: Request completed successfully`, {
      quote_id,
      target_language,
      total_time_ms: totalTime,
      translations_count: Object.keys(translations).length,
    })

    return new Response(
      JSON.stringify({
        items: translatedItems,
        notes: translatedNotes,
        translations,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] translate-quote: Request failed`, {
      error: error.message,
      stack: error.stack,
      total_time_ms: totalTime,
    })
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


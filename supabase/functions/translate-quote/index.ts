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

type ProviderName = 'gemini' | 'openai' | 'anthropic'

const TRANSLATION_PROVIDER = (Deno.env.get('TRANSLATION_PROVIDER') || 'gemini')
  .toLowerCase() as ProviderName

const PROVIDER_DEFAULT_MODELS: Record<ProviderName, string> = {
  gemini: Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash-exp',
  openai: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
  anthropic: Deno.env.get('ANTHROPIC_MODEL') || 'claude-3-haiku-20240307',
}

const SYSTEM_INSTRUCTION = `
You are a translation engine specialized in construction quotes.
- Translate from English to the requested language (Spanish or Portuguese) while preserving meaning.
- Keep numbers, currency symbols ($), measurement units (sq ft, ft, bags, etc.) untouched.
- Maintain capitalization of proper nouns, brand names, and customer names.
- Never add explanations or additional text. Output only a JSON array of strings in the same order as received.
`.trim()

const buildTranslationPrompt = (texts: string[], targetLanguage: 'en' | 'es' | 'pt') => {
  const languageLabel = targetLanguage === 'es' ? 'Spanish' : targetLanguage === 'pt' ? 'Portuguese' : 'English'
  return `
Translate the following array of texts from English to ${languageLabel}.
Return ONLY a valid JSON array in the same order. Do not change numbers, units, or punctuation such as $ or %.

Input:
${JSON.stringify(texts, null, 2)}
`.trim()
}

async function translateWithGemini(
  texts: string[],
  targetLanguage: 'en' | 'es' | 'pt',
  requestId: string
): Promise<string[]> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const model = PROVIDER_DEFAULT_MODELS.gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const prompt = buildTranslationPrompt(texts, targetLanguage)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${prompt}` }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[${requestId}] translate-quote: Gemini API error`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText.substring(0, 300),
    })
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const json = await response.json()
  const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text
  return parseTranslationArray(candidate, texts, requestId, 'gemini')
}

async function translateWithOpenAI(
  texts: string[],
  targetLanguage: 'en' | 'es' | 'pt',
  requestId: string
): Promise<string[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const model = PROVIDER_DEFAULT_MODELS.openai
  const prompt = buildTranslationPrompt(texts, targetLanguage)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[${requestId}] translate-quote: OpenAI API error`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText.substring(0, 300),
    })
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  return parseTranslationArray(content, texts, requestId, 'openai')
}

async function translateWithAnthropic(
  texts: string[],
  targetLanguage: 'en' | 'es' | 'pt',
  requestId: string
): Promise<string[]> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const model = PROVIDER_DEFAULT_MODELS.anthropic
  const prompt = buildTranslationPrompt(texts, targetLanguage)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0.2,
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[${requestId}] translate-quote: Anthropic API error`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText.substring(0, 300),
    })
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text
  return parseTranslationArray(text, texts, requestId, 'anthropic')
}

const parseTranslationArray = (
  rawResponse: string | undefined,
  fallback: string[],
  requestId: string,
  provider: ProviderName
): string[] => {
  if (!rawResponse) {
    console.warn(`[${requestId}] translate-quote: ${provider} empty response`)
    return fallback
  }

  try {
    let candidate = rawResponse.trim()
    if (!candidate.startsWith('[')) {
      const match = candidate.match(/\[[\s\S]*\]/)
      if (match) {
        candidate = match[0]
      }
    }
    const parsed = JSON.parse(candidate)
    if (Array.isArray(parsed)) {
      return parsed.map((text) => (typeof text === 'string' ? text : String(text)))
    }
  } catch (error) {
    console.error(`[${requestId}] translate-quote: Failed to parse ${provider} response`, {
      error: (error as Error).message,
      preview: rawResponse.substring(0, 200),
    })
  }
  return fallback
}

async function translateTextsViaProvider(
  provider: ProviderName,
  texts: string[],
  targetLanguage: 'en' | 'es' | 'pt',
  requestId: string
): Promise<string[]> {
  if (!texts.length) return []

  switch (provider) {
    case 'openai':
      return translateWithOpenAI(texts, targetLanguage, requestId)
    case 'anthropic':
      return translateWithAnthropic(texts, targetLanguage, requestId)
    case 'gemini':
    default:
      return translateWithGemini(texts, targetLanguage, requestId)
  }
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
      console.log(`[${requestId}] translate-quote: Translating ${textsToFetch.length} texts via ${TRANSLATION_PROVIDER}`)
      const translationStart = Date.now()
      let translatedTexts: string[] = []

      try {
        translatedTexts = await translateTextsViaProvider(
          TRANSLATION_PROVIDER,
          textsToFetch,
          target_language,
          requestId
        )
      } catch (providerError) {
        console.error(`[${requestId}] translate-quote: Provider translation failed`, {
          provider: TRANSLATION_PROVIDER,
          error: (providerError as Error).message,
        })
        translatedTexts = textsToFetch
      }

      const translationTime = Date.now() - translationStart
      console.log(`[${requestId}] translate-quote: Provider response received`, {
        provider: TRANSLATION_PROVIDER,
        response_time_ms: translationTime,
      })

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


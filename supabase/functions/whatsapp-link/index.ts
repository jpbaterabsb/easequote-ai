import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppRequest {
  quote_id: string
  phone: string
  language: 'en' | 'es' | 'pt'
  show_material_prices?: boolean
}

// WhatsApp message templates by language
const messageTemplates = {
  en: (customerName: string, quoteNumber: string, totalAmount: number, pdfUrl: string) =>
    `Hello ${customerName}!

Here's your quote #${quoteNumber}.
Total: $${totalAmount.toFixed(2)}

View your quote: ${pdfUrl}

Let me know if you have any questions!`,
  es: (customerName: string, quoteNumber: string, totalAmount: number, pdfUrl: string) =>
    `¡Hola ${customerName}!

Aquí está tu presupuesto #${quoteNumber}.
Total: $${totalAmount.toFixed(2)}

Ver tu presupuesto: ${pdfUrl}

¡Avísame si tienes alguna pregunta!`,
  pt: (customerName: string, quoteNumber: string, totalAmount: number, pdfUrl: string) =>
    `Olá ${customerName}!

Aqui está seu orçamento #${quoteNumber}.
Total: $${totalAmount.toFixed(2)}

Ver seu orçamento: ${pdfUrl}

Avise-me se tiver alguma dúvida!`,
}

// Format phone number for WhatsApp (remove non-digits, ensure country code)
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If phone doesn't start with country code, assume US (+1)
  // For international numbers, they should include country code
  if (digits.length === 10) {
    return `1${digits}` // US number without country code
  }
  
  return digits
}

serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log(`[${requestId}] whatsapp-link: Request started`, {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] whatsapp-link: CORS preflight request`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error(`[${requestId}] whatsapp-link: Missing authorization header`)
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const authStartTime = Date.now()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)
    const authTime = Date.now() - authStartTime

    if (userError || !user) {
      console.error(`[${requestId}] whatsapp-link: Authentication failed`, {
        error: userError?.message,
        auth_time_ms: authTime,
      })
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] whatsapp-link: User authenticated`, {
      user_id: user.id,
      email: user.email,
      auth_time_ms: authTime,
    })

    const { quote_id, phone, language, show_material_prices = false }: WhatsAppRequest = await req.json()

    console.log(`[${requestId}] whatsapp-link: Processing request`, {
      quote_id,
      phone,
      language,
      user_id: user.id,
    })

    // Fetch quote data
    const quoteFetchStartTime = Date.now()
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quote_id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()
    const quoteFetchTime = Date.now() - quoteFetchStartTime

    if (quoteError || !quote) {
      console.error(`[${requestId}] whatsapp-link: Quote not found`, {
        quote_id,
        error: quoteError?.message,
        fetch_time_ms: quoteFetchTime,
      })
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] whatsapp-link: Quote fetched`, {
      quote_number: quote.quote_number,
      customer_name: quote.customer_name,
      total_amount: quote.total_amount,
      fetch_time_ms: quoteFetchTime,
    })

    // Generate PDF to get signed URL
    console.log(`[${requestId}] whatsapp-link: Generating PDF`)
    const pdfGenStartTime = Date.now()
    const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader, // Use user token
      },
      body: JSON.stringify({
        quote_id,
        language,
        show_material_prices,
      }),
    })
    const pdfGenTime = Date.now() - pdfGenStartTime

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text()
      console.error(`[${requestId}] whatsapp-link: PDF generation failed`, {
        status: pdfResponse.status,
        error: errorText.substring(0, 500),
        pdf_gen_time_ms: pdfGenTime,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to generate PDF', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pdfData = await pdfResponse.json()
    console.log(`[${requestId}] whatsapp-link: PDF generated`, {
      pdf_url: pdfData.pdf_url,
      pdf_gen_time_ms: pdfGenTime,
    })

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone)
    console.log(`[${requestId}] whatsapp-link: Phone formatted`, {
      original: phone,
      formatted: formattedPhone,
    })

    // Get message template
    const template = messageTemplates[language] || messageTemplates.en
    const message = template(
      quote.customer_name,
      quote.quote_number,
      quote.total_amount,
      pdfData.pdf_url
    )

    // Generate WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`

    const totalTime = Date.now() - startTime
    console.log(`[${requestId}] whatsapp-link: Request completed successfully`, {
      quote_id,
      quote_number: quote.quote_number,
      phone: formattedPhone,
      language,
      whatsapp_url: whatsappUrl,
      total_time_ms: totalTime,
      breakdown: {
        auth_ms: authTime,
        quote_fetch_ms: quoteFetchTime,
        pdf_gen_ms: pdfGenTime,
      },
    })

    return new Response(
      JSON.stringify({
        whatsapp_url: whatsappUrl,
        phone: formattedPhone,
        message: message,
        pdf_url: pdfData.pdf_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] whatsapp-link: Request failed`, {
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


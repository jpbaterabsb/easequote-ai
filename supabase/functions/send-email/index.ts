import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  quote_id: string
  recipient_email: string
  subject?: string
  body?: string
  language: 'en' | 'es' | 'pt'
  show_material_prices?: boolean
}

// Email templates by language
const emailTemplates = {
  en: {
    subject: (quoteNumber: string, businessName: string) =>
      `Quote #${quoteNumber} from ${businessName}`,
    body: (customerName: string, businessName: string, userPhone?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hello ${customerName},</h2>
        <p>Thank you for your interest! Please find attached your quote.</p>
        <p>If you have any questions, feel free to reach out.</p>
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>${businessName}</strong>${userPhone ? `<br>${userPhone}` : ''}
        </p>
      </div>
    `,
  },
  es: {
    subject: (quoteNumber: string, businessName: string) =>
      `Presupuesto #${quoteNumber} de ${businessName}`,
    body: (customerName: string, businessName: string, userPhone?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hola ${customerName},</h2>
        <p>¡Gracias por tu interés! Adjunto encontrarás tu presupuesto.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p style="margin-top: 30px;">
          Saludos cordiales,<br>
          <strong>${businessName}</strong>${userPhone ? `<br>${userPhone}` : ''}
        </p>
      </div>
    `,
  },
  pt: {
    subject: (quoteNumber: string, businessName: string) =>
      `Orçamento #${quoteNumber} de ${businessName}`,
    body: (customerName: string, businessName: string, userPhone?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Olá ${customerName},</h2>
        <p>Obrigado pelo seu interesse! Segue em anexo seu orçamento.</p>
        <p>Se tiver alguma dúvida, sinta-se à vontade para entrar em contato.</p>
        <p style="margin-top: 30px;">
          Atenciosamente,<br>
          <strong>${businessName}</strong>${userPhone ? `<br>${userPhone}` : ''}
        </p>
      </div>
    `,
  },
}

serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log(`[${requestId}] send-email: Request started`, {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] send-email: CORS preflight request`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error(`[${requestId}] send-email: Missing authorization header`)
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error(`[${requestId}] send-email: RESEND_API_KEY not configured`)
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const authStartTime = Date.now()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)
    const authTime = Date.now() - authStartTime

    if (userError || !user) {
      console.error(`[${requestId}] send-email: Authentication failed`, {
        error: userError?.message,
        auth_time_ms: authTime,
      })
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] send-email: User authenticated`, {
      user_id: user.id,
      email: user.email,
      auth_time_ms: authTime,
    })

    const { quote_id, recipient_email, subject, body, language, show_material_prices = false }: EmailRequest =
      await req.json()

    console.log(`[${requestId}] send-email: Processing request`, {
      quote_id,
      recipient_email,
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
      console.error(`[${requestId}] send-email: Quote not found`, {
        quote_id,
        error: quoteError?.message,
        fetch_time_ms: quoteFetchTime,
      })
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] send-email: Quote fetched`, {
      quote_number: quote.quote_number,
      customer_name: quote.customer_name,
      fetch_time_ms: quoteFetchTime,
    })

    // Fetch user profile for business name and phone
    const profileFetchStartTime = Date.now()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()
    const profileFetchTime = Date.now() - profileFetchStartTime

    if (profileError) {
      console.warn(`[${requestId}] send-email: Failed to fetch profile, using defaults`, {
        error: profileError.message,
        fetch_time_ms: profileFetchTime,
      })
    }

    const businessName = profile?.full_name || user.email?.split('@')[0] || 'EaseQuote AI'
    const userPhone = profile?.phone

    // Generate PDF
    console.log(`[${requestId}] send-email: Generating PDF`)
    const pdfGenStartTime = Date.now()
    const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader, // Use the original user token, not service role key
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
      console.error(`[${requestId}] send-email: PDF generation failed`, {
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
    console.log(`[${requestId}] send-email: PDF generated`, {
      pdf_url: pdfData.pdf_url,
      pdf_gen_time_ms: pdfGenTime,
    })

    // Download PDF from signed URL
    const pdfDownloadStartTime = Date.now()
    const pdfDownloadResponse = await fetch(pdfData.pdf_url)
    if (!pdfDownloadResponse.ok) {
      throw new Error('Failed to download PDF from signed URL')
    }
    const pdfBuffer = await pdfDownloadResponse.arrayBuffer()
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))
    const pdfDownloadTime = Date.now() - pdfDownloadStartTime

    console.log(`[${requestId}] send-email: PDF downloaded`, {
      size_bytes: pdfBuffer.byteLength,
      pdf_download_time_ms: pdfDownloadTime,
    })

    // Get email template
    const template = emailTemplates[language] || emailTemplates.en
    const emailSubject = subject || template.subject(quote.quote_number, businessName)
    const emailBody = body || template.body(quote.customer_name, businessName, userPhone)

    // Create email record in database (pending status)
    const emailRecordStartTime = Date.now()
    const { data: emailRecord, error: emailRecordError } = await supabase
      .from('quote_emails')
      .insert({
        quote_id,
        recipient_email,
        subject: emailSubject,
        body: emailBody,
        language,
        status: 'pending',
      })
      .select()
      .single()
    const emailRecordTime = Date.now() - emailRecordStartTime

    if (emailRecordError) {
      console.warn(`[${requestId}] send-email: Failed to create email record`, {
        error: emailRecordError.message,
        email_record_time_ms: emailRecordTime,
      })
    }

    // Send email via Resend with retry logic
    let resendResponse: Response | null = null
    let resendError: Error | null = null
    const maxRetries = 3
    let retryCount = 0

    while (retryCount < maxRetries) {
      try {
        const resendStartTime = Date.now()
        console.log(`[${requestId}] send-email: Sending email via Resend (attempt ${retryCount + 1}/${maxRetries})`)

        resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'EaseQuote AI <no-reply@easequoteai.com>', // Update with your verified domain
            to: recipient_email,
            subject: emailSubject,
            html: emailBody,
            attachments: [
              {
                filename: `Quote-${quote.quote_number}-${quote.customer_name.replace(/\s+/g, '-')}.pdf`,
                content: pdfBase64,
              },
            ],
          }),
        })

        const resendTime = Date.now() - resendStartTime

        if (resendResponse.ok) {
          const resendData = await resendResponse.json()
          console.log(`[${requestId}] send-email: Email sent successfully`, {
            resend_id: resendData.id,
            resend_time_ms: resendTime,
            attempt: retryCount + 1,
          })

          // Update email record with success
          if (emailRecord) {
            await supabase
              .from('quote_emails')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', emailRecord.id)
          }

          const totalTime = Date.now() - startTime
          console.log(`[${requestId}] send-email: Request completed successfully`, {
            quote_id,
            recipient_email,
            resend_id: resendData.id,
            total_time_ms: totalTime,
            breakdown: {
              auth_ms: authTime,
              quote_fetch_ms: quoteFetchTime,
              profile_fetch_ms: profileFetchTime,
              pdf_gen_ms: pdfGenTime,
              pdf_download_ms: pdfDownloadTime,
              email_record_ms: emailRecordTime,
              resend_ms: resendTime,
            },
          })

          return new Response(
            JSON.stringify({
              success: true,
              email_id: emailRecord?.id,
              resend_id: resendData.id,
              message: 'Email sent successfully',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        } else {
          const errorText = await resendResponse.text()
          resendError = new Error(`Resend API error: ${resendResponse.status} - ${errorText}`)
          console.warn(`[${requestId}] send-email: Resend API error (attempt ${retryCount + 1})`, {
            status: resendResponse.status,
            error: errorText.substring(0, 500),
            resend_time_ms: resendTime,
          })

          // If it's a client error (4xx), don't retry
          if (resendResponse.status >= 400 && resendResponse.status < 500) {
            break
          }

          // Wait before retry (exponential backoff)
          if (retryCount < maxRetries - 1) {
            const waitTime = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
            console.log(`[${requestId}] send-email: Waiting ${waitTime}ms before retry`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          }
        }
      } catch (error) {
        resendError = error as Error
        console.error(`[${requestId}] send-email: Exception during email send (attempt ${retryCount + 1})`, {
          error: error.message,
        })

        if (retryCount < maxRetries - 1) {
          const waitTime = Math.pow(2, retryCount) * 1000
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }

      retryCount++
    }

    // All retries failed
    const errorMessage = resendError?.message || 'Failed to send email after retries'

    // Update email record with failure
    if (emailRecord) {
      await supabase
        .from('quote_emails')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', emailRecord.id)
    }

    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] send-email: Request failed after ${maxRetries} attempts`, {
      quote_id,
      recipient_email,
      error: errorMessage,
      total_time_ms: totalTime,
    })

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] send-email: Request failed with exception`, {
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


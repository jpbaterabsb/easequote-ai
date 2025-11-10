import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDFRequest {
  quote_id: string
  language: 'en' | 'es' | 'pt'
}

// Translation labels
const labels = {
  en: {
    quote: 'QUOTE',
    from: 'From',
    to: 'To',
    dateIssued: 'Date Issued',
    item: 'Item',
    area: 'Area',
    pricePerSqft: 'Price/sq ft',
    lineTotal: 'Line Total',
    addons: 'Add-ons',
    subtotal: 'Subtotal',
    materialCost: 'Material Cost',
    total: 'Total',
    paymentMethod: 'Payment Method',
    startDate: 'Start Date',
    endDate: 'End Date',
    notes: 'Notes',
    thankYou: 'Thank you for your business!',
    page: 'Page',
    of: 'of',
  },
  es: {
    quote: 'PRESUPUESTO',
    from: 'De',
    to: 'Para',
    dateIssued: 'Fecha de Emisión',
    item: 'Artículo',
    area: 'Área',
    pricePerSqft: 'Precio/pie²',
    lineTotal: 'Total de Línea',
    addons: 'Complementos',
    subtotal: 'Subtotal',
    materialCost: 'Costo de Materiales',
    total: 'Total',
    paymentMethod: 'Método de Pago',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Finalización',
    notes: 'Notas',
    thankYou: '¡Gracias por su negocio!',
    page: 'Página',
    of: 'de',
  },
  pt: {
    quote: 'ORÇAMENTO',
    from: 'De',
    to: 'Para',
    dateIssued: 'Data de Emissão',
    item: 'Item',
    area: 'Área',
    pricePerSqft: 'Preço/m²',
    lineTotal: 'Total da Linha',
    addons: 'Complementos',
    subtotal: 'Subtotal',
    materialCost: 'Custo de Materiais',
    total: 'Total',
    paymentMethod: 'Método de Pagamento',
    startDate: 'Data de Início',
    endDate: 'Data de Término',
    notes: 'Notas',
    thankYou: 'Obrigado pelo seu negócio!',
    page: 'Página',
    of: 'de',
  },
}

serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  console.log(`[${requestId}] generate-pdf: Request started`, {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] generate-pdf: CORS preflight request`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error(`[${requestId}] generate-pdf: Missing authorization header`)
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
      console.error(`[${requestId}] generate-pdf: Authentication failed`, {
        error: userError?.message,
        auth_time_ms: authTime,
      })
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] generate-pdf: User authenticated`, {
      user_id: user.id,
      email: user.email,
      auth_time_ms: authTime,
    })

    const { quote_id, language }: PDFRequest = await req.json()
    
    console.log(`[${requestId}] generate-pdf: Processing request`, {
      quote_id,
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
      console.error(`[${requestId}] generate-pdf: Quote not found`, {
        quote_id,
        error: quoteError?.message,
        fetch_time_ms: quoteFetchTime,
      })
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] generate-pdf: Quote fetched`, {
      quote_number: quote.quote_number,
      customer_name: quote.customer_name,
      total_amount: quote.total_amount,
      fetch_time_ms: quoteFetchTime,
    })

    // Fetch quote items
    const itemsFetchStartTime = Date.now()
    const { data: items, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote_id)
      .order('created_at', { ascending: true })
    const itemsFetchTime = Date.now() - itemsFetchStartTime

    if (itemsError) {
      console.error(`[${requestId}] generate-pdf: Failed to fetch quote items`, {
        quote_id,
        error: itemsError.message,
        fetch_time_ms: itemsFetchTime,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to fetch quote items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] generate-pdf: Quote items fetched`, {
      items_count: items?.length || 0,
      fetch_time_ms: itemsFetchTime,
    })

    // Fetch user profile
    const profileFetchStartTime = Date.now()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, company_logo_url')
      .eq('id', user.id)
      .single()
    const profileFetchTime = Date.now() - profileFetchStartTime

    if (profileError) {
      console.error(`[${requestId}] generate-pdf: Failed to fetch profile`, {
        user_id: user.id,
        error: profileError.message,
        fetch_time_ms: profileFetchTime,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] generate-pdf: Profile fetched`, {
      full_name: profile?.full_name,
      has_logo: !!profile?.company_logo_url,
      fetch_time_ms: profileFetchTime,
    })

    // Translate content if needed
    let translatedItems = items || []
    let translatedNotes = quote.notes

    if (language !== 'en') {
      console.log(`[${requestId}] generate-pdf: Translation required for language: ${language}`)
      const translateStartTime = Date.now()
      
      // Call translate-quote function
      const translateResponse = await fetch(
        `${supabaseUrl}/functions/v1/translate-quote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            quote_id,
            target_language: language,
            items: items.map((item) => ({
              item_name: item.item_name,
              addons: (item.addons as any[]) || [],
            })),
            notes: quote.notes,
          }),
        }
      )
      const translateTime = Date.now() - translateStartTime

      if (translateResponse.ok) {
        const translationData = await translateResponse.json()
        translatedItems = items.map((item, index) => ({
          ...item,
          item_name: translationData.items[index]?.item_name || item.item_name,
          addons: (item.addons as any[]).map((addon, addonIndex) => ({
            ...addon,
            name:
              translationData.items[index]?.addons[addonIndex]?.name || addon.name,
          })),
        }))
        translatedNotes = translationData.notes
        
        console.log(`[${requestId}] generate-pdf: Translation completed`, {
          language,
          items_translated: translatedItems.length,
          translation_time_ms: translateTime,
        })
      } else {
        const errorText = await translateResponse.text()
        console.warn(`[${requestId}] generate-pdf: Translation failed, using original text`, {
          language,
          status: translateResponse.status,
          error: errorText.substring(0, 200),
          translation_time_ms: translateTime,
        })
      }
    } else {
      console.log(`[${requestId}] generate-pdf: No translation needed (English)`)
    }

    // Generate PDF
    console.log(`[${requestId}] generate-pdf: Starting PDF generation`)
    const pdfGenStartTime = Date.now()
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    const t = labels[language]

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        doc.addPage()
        yPos = margin
        return true
      }
      return false
    }

    // Header
    yPos = margin
    if (profile?.company_logo_url) {
      try {
        // Try to load logo (may fail if URL is not accessible from Edge Function)
        // For production, you might need to download and embed the image
        // For now, we'll skip logo embedding in Edge Function
      } catch (e) {
        // Logo loading failed, continue without it
      }
    }

    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(t.quote, margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${t.dateIssued}: ${new Date(quote.created_at).toLocaleDateString()}`, margin, yPos)
    doc.text(`Quote #: ${quote.quote_number}`, pageWidth - margin, yPos, {
      align: 'right',
    })
    yPos += 15

    // From section
    doc.setFont('helvetica', 'bold')
    doc.text(t.from + ':', margin, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.text(profile?.full_name || '', margin, yPos)
    yPos += 5
    if (profile?.phone) {
      doc.text(`Phone: ${profile.phone}`, margin, yPos)
      yPos += 5
    }
    if (user.email) {
      doc.text(`Email: ${user.email}`, margin, yPos)
      yPos += 5
    }
    yPos += 5

    // To section
    doc.setFont('helvetica', 'bold')
    doc.text(t.to + ':', margin, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.text(quote.customer_name, margin, yPos)
    yPos += 5
    if (quote.customer_phone) {
      doc.text(`Phone: ${quote.customer_phone}`, margin, yPos)
      yPos += 5
    }
    if (quote.customer_email) {
      doc.text(`Email: ${quote.customer_email}`, margin, yPos)
      yPos += 5
    }
    if (quote.customer_address) {
      const addressParts = [
        quote.customer_address,
        quote.customer_city,
        quote.customer_state,
        quote.customer_zip,
      ].filter(Boolean)
      doc.text(addressParts.join(', '), margin, yPos)
      yPos += 5
    }
    yPos += 10

    // Line items table
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(t.item, margin, yPos)
    doc.text(t.area, margin + 40, yPos)
    doc.text(t.pricePerSqft, margin + 70, yPos)
    doc.text(t.lineTotal, pageWidth - margin, yPos, { align: 'right' })
    yPos += 8

    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    for (const item of translatedItems) {
      checkPageBreak(20)

      // Item name
      const itemNameLines = doc.splitTextToSize(item.item_name, contentWidth - 100)
      doc.text(itemNameLines[0], margin, yPos)
      let itemYPos = yPos + (itemNameLines.length > 1 ? 5 : 0)

      // Area
      doc.text(`${item.area.toFixed(2)} sq ft`, margin + 40, yPos)

      // Price per sqft
      doc.text(`$${item.price_per_sqft.toFixed(2)}`, margin + 70, yPos)

      // Line total
      doc.text(`$${item.line_total.toFixed(2)}`, pageWidth - margin, yPos, {
        align: 'right',
      })

      yPos += 6

      // Add-ons
      if (item.addons && Array.isArray(item.addons) && item.addons.length > 0) {
        doc.setFontSize(9)
        for (const addon of item.addons) {
          checkPageBreak(10)
          const addonText = `  • ${addon.name || (addon as any).name} - $${((addon as any).price || 0).toFixed(2)}`
          doc.text(addonText, margin + 5, yPos)
          yPos += 5
        }
        doc.setFontSize(10)
      }

      // Dates
      if (item.start_date || item.end_date) {
        checkPageBreak(10)
        const dateText = [
          item.start_date && `${t.startDate}: ${new Date(item.start_date).toLocaleDateString()}`,
          item.end_date && `${t.endDate}: ${new Date(item.end_date).toLocaleDateString()}`,
        ]
          .filter(Boolean)
          .join(' • ')
        doc.setFontSize(8)
        doc.text(dateText, margin + 5, yPos)
        yPos += 5
        doc.setFontSize(10)
      }

      yPos += 3
    }

    yPos += 5

    // Summary
    checkPageBreak(40)
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    doc.setFont('helvetica', 'normal')
    doc.text(`${t.subtotal}:`, margin, yPos)
    doc.text(`$${quote.subtotal.toFixed(2)}`, pageWidth - margin, yPos, {
      align: 'right',
    })
    yPos += 6

    if (!quote.customer_provides_materials && quote.material_cost > 0) {
      doc.text(`${t.materialCost}:`, margin, yPos)
      doc.text(`$${quote.material_cost.toFixed(2)}`, pageWidth - margin, yPos, {
        align: 'right',
      })
      yPos += 6
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`${t.total}:`, margin, yPos)
    doc.text(`$${quote.total_amount.toFixed(2)}`, pageWidth - margin, yPos, {
      align: 'right',
    })
    yPos += 10

    // Payment method (from first item if available)
    const firstItemWithPayment = items.find((item) => item.payment_method)
    if (firstItemWithPayment?.payment_method) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `${t.paymentMethod}: ${firstItemWithPayment.payment_method
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')}`,
        margin,
        yPos
      )
      yPos += 8
    }

    // Notes
    if (translatedNotes) {
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.text(`${t.notes}:`, margin, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      const notesLines = doc.splitTextToSize(translatedNotes, contentWidth)
      doc.text(notesLines, margin, yPos)
      yPos += notesLines.length * 5 + 5
    }

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(t.thankYou, margin, pageHeight - 15)
      doc.text(
        `${t.page} ${i} ${t.of} ${totalPages}`,
        pageWidth - margin,
        pageHeight - 15,
        { align: 'right' }
      )
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')
    const pdfGenTime = Date.now() - pdfGenStartTime
    const pdfSize = pdfBuffer.byteLength
    
    console.log(`[${requestId}] generate-pdf: PDF generated`, {
      pages: doc.getNumberOfPages(),
      size_bytes: pdfSize,
      size_kb: (pdfSize / 1024).toFixed(2),
      generation_time_ms: pdfGenTime,
    })

    // Upload to Storage
    const fileName = `quotes/${user.id}/${quote_id}-${Date.now()}.pdf`
    console.log(`[${requestId}] generate-pdf: Uploading PDF to storage`, {
      file_name: fileName,
      size_bytes: pdfSize,
    })
    
    const uploadStartTime = Date.now()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })
    const uploadTime = Date.now() - uploadStartTime

    if (uploadError) {
      console.error(`[${requestId}] generate-pdf: Failed to upload PDF`, {
        file_name: fileName,
        error: uploadError.message,
        upload_time_ms: uploadTime,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] generate-pdf: PDF uploaded successfully`, {
      file_name: fileName,
      upload_time_ms: uploadTime,
    })

    // Generate signed URL (valid for 1 hour)
    const urlGenStartTime = Date.now()
    const { data: urlData, error: urlError } = await supabase.storage
      .from('pdfs')
      .createSignedUrl(fileName, 3600)
    const urlGenTime = Date.now() - urlGenStartTime

    if (urlError) {
      console.error(`[${requestId}] generate-pdf: Failed to generate signed URL`, {
        file_name: fileName,
        error: urlError.message,
        url_gen_time_ms: urlGenTime,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to generate signed URL', details: urlError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalTime = Date.now() - startTime
    console.log(`[${requestId}] generate-pdf: Request completed successfully`, {
      quote_id,
      quote_number: quote.quote_number,
      language,
      file_name: fileName,
      pdf_size_kb: (pdfSize / 1024).toFixed(2),
      total_time_ms: totalTime,
      breakdown: {
        auth_ms: authTime,
        quote_fetch_ms: quoteFetchTime,
        items_fetch_ms: itemsFetchTime,
        profile_fetch_ms: profileFetchTime,
        pdf_generation_ms: pdfGenTime,
        upload_ms: uploadTime,
        url_generation_ms: urlGenTime,
      },
    })

    return new Response(
      JSON.stringify({
        pdf_url: urlData.signedUrl,
        file_name: fileName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] generate-pdf: Request failed`, {
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


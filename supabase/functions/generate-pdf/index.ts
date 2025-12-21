import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1'
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDFRequest {
  quote_id: string
  language: 'en' | 'es' | 'pt'
  show_material_prices?: boolean
}

// Translation labels
const labels = {
  en: {
    quote: 'QUOTE',
    from: 'From',
    installerCompany: 'Installer / Company',
    installer: 'Installer',
    company: 'Company',
    to: 'To',
    client: 'Client',
    name: 'Name',
    dateIssued: 'Date Issued',
    validUntil: 'Valid Until',
    item: 'Item',
    projectItems: 'Project Items',
    category: 'Category',
    area: 'Area',
    pricePerSqft: 'Price/sq ft',
    lineTotal: 'Line Total',
    addons: 'Add-ons',
    projectAddons: 'Project Add-ons',
    addonName: 'Add-on Name',
    itemName: 'Item Name',
    price: 'Price',
    subtotal: 'Subtotal',
    materialCost: 'Material Cost',
    total: 'Total',
    paymentMethod: 'Payment Method',
    startDate: 'Start Date',
    endDate: 'End Date',
    notes: 'Notes',
    materials: 'Materials',
    materialName: 'Material Name',
    quantity: 'Quantity',
    unit: 'Unit',
    thankYou: 'Thank you for your business!',
    page: 'Page',
    of: 'of',
  },
  es: {
    quote: 'PRESUPUESTO',
    from: 'De',
    installerCompany: 'Instalador / Empresa',
    installer: 'Instalador',
    company: 'Empresa',
    to: 'Para',
    client: 'Cliente',
    name: 'Nombre',
    dateIssued: 'Fecha de Emisión',
    validUntil: 'Válido Hasta',
    item: 'Artículo',
    projectItems: 'Artículos del Proyecto',
    category: 'Categoría',
    area: 'Área',
    pricePerSqft: 'Precio/pie²',
    lineTotal: 'Total de Línea',
    addons: 'Complementos',
    projectAddons: 'Complementos del Proyecto',
    addonName: 'Nombre del Complemento',
    itemName: 'Nombre del Artículo',
    price: 'Precio',
    subtotal: 'Subtotal',
    materialCost: 'Costo de Materiales',
    total: 'Total',
    paymentMethod: 'Método de Pago',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Finalización',
    notes: 'Notas',
    materials: 'Materiales',
    materialName: 'Nombre del Material',
    quantity: 'Cantidad',
    unit: 'Unidad',
    thankYou: '¡Gracias por su negocio!',
    page: 'Página',
    of: 'de',
  },
  pt: {
    quote: 'ORÇAMENTO',
    from: 'De',
    installerCompany: 'Instalador / Empresa',
    installer: 'Instalador',
    company: 'Empresa',
    to: 'Para',
    client: 'Cliente',
    name: 'Nome',
    dateIssued: 'Data de Emissão',
    validUntil: 'Válido Até',
    item: 'Item',
    projectItems: 'Itens do Projeto',
    category: 'Categoria',
    area: 'Área',
    pricePerSqft: 'Preço/m²',
    lineTotal: 'Total da Linha',
    addons: 'Complementos',
    projectAddons: 'Complementos do Projeto',
    addonName: 'Nome do Complemento',
    itemName: 'Nome do Item',
    price: 'Preço',
    subtotal: 'Subtotal',
    materialCost: 'Custo de Materiais',
    total: 'Total',
    paymentMethod: 'Método de Pagamento',
    startDate: 'Data de Início',
    endDate: 'Data de Término',
    notes: 'Notas',
    materials: 'Materiais',
    materialName: 'Nome do Material',
    quantity: 'Quantidade',
    unit: 'Unidade',
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

    const { quote_id, language, show_material_prices = false }: PDFRequest = await req.json()
    
    console.log(`[${requestId}] generate-pdf: Processing request`, {
      quote_id,
      language,
      show_material_prices,
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
      .select('full_name, phone, company_logo_url, business_name, address')
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
      business_name: profile?.business_name,
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
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    const t = labels[language]

    // Color scheme (RGB values 0-255)
    const colors = {
      primary: [37, 99, 235],       // Primary blue #2563EB
      secondary: [40, 53, 147],     // Secondary blue #283593
      accent: [46, 204, 113],       // Green accent
      lightGray: [236, 240, 241],   // Light gray background
      border: [189, 195, 199],      // Border gray
      text: [44, 62, 80],           // Dark text
    }

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - margin - 20) {
        doc.addPage()
        yPos = margin
        return true
      }
      return false
    }

    // Helper function to draw a filled rectangle
    const drawRect = (x: number, y: number, w: number, h: number, color: number[]) => {
      doc.setFillColor(color[0], color[1], color[2])
      doc.rect(x, y, w, h, 'F')
    }

    // Header section with logo and company/installer info
    yPos = margin
    const headerHeight = 25
    const logoSize = 20
    const logoMargin = 5
    
    // Logo area (top left) - always draw square, fill with logo if available
    const logoX = margin + logoMargin
    const logoY = yPos + logoMargin
    
    // Draw logo placeholder square (always visible)
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
    doc.setLineWidth(0.5)
    doc.rect(logoX, logoY, logoSize, logoSize)
    
    // Try to load and embed logo if available
    if (profile?.company_logo_url) {
      try {
        const logoResponse = await fetch(profile.company_logo_url)
        if (logoResponse.ok) {
          const logoArrayBuffer = await logoResponse.arrayBuffer()
          const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoArrayBuffer)))
          
          // Determine image format
          const contentType = logoResponse.headers.get('content-type') || ''
          let imageFormat = 'PNG'
          if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            imageFormat = 'JPEG'
          } else if (contentType.includes('png')) {
            imageFormat = 'PNG'
          }
          
          // Add image to PDF
          doc.addImage(
            `data:image/${imageFormat.toLowerCase()};base64,${logoBase64}`,
            imageFormat,
            logoX + 1,
            logoY + 1,
            logoSize - 2,
            logoSize - 2
          )
        }
      } catch (e) {
        console.log(`[${requestId}] generate-pdf: Failed to load logo`, {
          error: e?.message || String(e),
          logo_url: profile.company_logo_url,
        })
        // Logo loading failed, square placeholder will remain visible
      }
    }
    
    // Installer/Company info (to the right of logo, same level)
    const infoStartX = logoX + logoSize + logoMargin * 2
    const infoWidth = contentWidth * 0.4
    let infoY = yPos + 2
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(t.installerCompany + ':', infoStartX, infoY)
    infoY += 5
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // Company name (from profile)
    const companyName = profile?.business_name || ''
    if (companyName) {
      doc.setFont('helvetica', 'bold')
      doc.text(`${t.company}: ${companyName}`, infoStartX, infoY)
      infoY += 5
    }
    
    // Installer name (from profile)
    const installerName = profile?.full_name || ''
    if (installerName) {
      doc.setFont('helvetica', 'normal')
      doc.text(`${t.installer}: ${installerName}`, infoStartX, infoY)
      infoY += 4
    }
    
    // Phone (from profile)
    const phone = profile?.phone || ''
    if (phone) {
      doc.text(`Phone: ${phone}`, infoStartX, infoY)
      infoY += 4
    }
    
    // Email (from user)
    const email = user.email || ''
    if (email) {
      doc.text(`Email: ${email}`, infoStartX, infoY)
      infoY += 4
    }
    
    // Address (from profile)
    const businessAddress = profile?.address || ''
    if (businessAddress) {
      const addressLines = doc.splitTextToSize(`Address: ${businessAddress}`, infoWidth - 5)
      doc.text(addressLines, infoStartX, infoY)
      infoY += addressLines.length * 4 + 5
    } else {
      infoY += 5
    }
    
    // QUOTE section (to the right of installer/company info)
    const quoteStartX = infoStartX + infoWidth + 10
    let quoteY = yPos + 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    
    // QUOTE title
    doc.setFont('helvetica', 'bold')
    doc.text(t.quote, quoteStartX, quoteY)
    quoteY += 5
    
    // Date Issued
    doc.setFont('helvetica', 'normal')
    const issuedDate = new Date(quote.created_at).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
    doc.text(`${t.dateIssued}: ${issuedDate}`, quoteStartX, quoteY)
    quoteY += 5
    
    // Quote #
    doc.text(`Quote #:`, quoteStartX, quoteY)
    quoteY += 4
    doc.text(quote.quote_number, quoteStartX, quoteY)
    quoteY += 5
    
    // Valid Until (15 days from issue date)
    const validUntilDate = new Date(quote.created_at)
    validUntilDate.setDate(validUntilDate.getDate() + 15)
    const validUntilDateStr = validUntilDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
    doc.text(`${t.validUntil}: ${validUntilDateStr}`, quoteStartX, quoteY)
    
    yPos = Math.max(infoY, quoteY) + 10

    // Client section (below logo, installer and quote)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(t.client, margin, yPos)
    yPos += 6
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Name
    doc.text(`${t.name}: ${quote.customer_name}`, margin, yPos)
    yPos += 5
    
    // Phone
    if (quote.customer_phone) {
      doc.text(`Phone: ${quote.customer_phone}`, margin, yPos)
      yPos += 5
    }
    
    // Email
    if (quote.customer_email) {
      doc.text(`Email: ${quote.customer_email}`, margin, yPos)
      yPos += 5
    }
    
    // Address
    if (quote.customer_address) {
      const addressParts = [
        quote.customer_address,
        quote.customer_city,
        quote.customer_state,
        quote.customer_zip,
      ].filter(Boolean)
      const addressText = addressParts.join(', ')
      const addressLines = doc.splitTextToSize(`Address: ${addressText}`, contentWidth * 0.7)
      doc.text(addressLines, margin, yPos)
      yPos += addressLines.length * 5
    }

    yPos += 10

    // Category ID to name mapping
    const categoryMap: Record<string, string> = {
      'flooring': 'Flooring',
      'bathroom': 'Bathroom',
      'kitchen': 'Kitchen',
      'kitchens': 'Kitchens',
      'exterior': 'Exterior',
      'painting': 'Painting',
      'drywall': 'Drywall',
    }

    // Helper function to get category name from item
    const getCategoryName = (item: any): string => {
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          if (addon._metadata || addon.id === '_metadata' || addon.name === '_metadata') {
            const categoryId = addon.category_id || (addon as any).category_id
            if (categoryId && categoryMap[categoryId]) {
              return categoryMap[categoryId]
            }
          }
        }
      }
      const firstWord = item.item_name.split(/\s+/)[0].toLowerCase()
      if (categoryMap[firstWord]) {
        return categoryMap[firstWord]
      }
      return ''
    }

    // Collect all materials from all items (for separate materials section)
    const materialsMap = new Map<string, { name: string; quantity?: number; unit?: string }>()
    for (const item of translatedItems) {
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          if (addon._metadata || addon.name === '_metadata' || addon.id === '_metadata') {
            continue
          }
          if (addon.addonType === 'material' || addon.addon_type === 'material') {
            const materialName = addon.name || (addon as any).name
            if (!materialName || materialName.trim() === '') {
              continue
            }
            const materialUnit = addon.unit
            const materialQuantity = addon.quantity
            const materialKey = `${materialName.trim()}_${materialUnit || 'none'}`
            const existingMaterial = materialsMap.get(materialKey)
            if (existingMaterial) {
              if (materialQuantity && existingMaterial.quantity && existingMaterial.unit === materialUnit) {
                existingMaterial.quantity = existingMaterial.quantity + materialQuantity
              }
            } else {
              materialsMap.set(materialKey, {
                name: materialName.trim(),
                quantity: materialQuantity,
                unit: materialUnit,
              })
            }
          }
        }
      }
    }
    const allMaterials = Array.from(materialsMap.values())

    // Collect all addons (excluding materials) from all items
    const allAddons: Array<{ addonName: string; itemName: string; price: number }> = []
    for (const item of translatedItems) {
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          if (addon._metadata || addon.name === '_metadata' || addon.id === '_metadata') {
            continue
          }
          if (addon.addonType === 'material' || addon.addon_type === 'material') {
            continue
          }
          const addonName = addon.name || (addon as any).name
          const addonPrice = (addon as any).price || 0
          if (!addonName || addonName.trim() === '') {
            continue
          }
          allAddons.push({
            addonName: addonName.trim(),
            itemName: item.item_name,
            price: addonPrice,
          })
        }
      }
    }

    // autoTable styles with bottom margin to avoid footer overlap
    const tableStyles = {
      headStyles: {
        fillColor: [40, 53, 147] as [number, number, number],  // Secondary #283593
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: 'bold' as const,
        fontSize: 10,
        halign: 'left' as const,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [44, 62, 80] as [number, number, number],
      },
      alternateRowStyles: {
        fillColor: [236, 240, 241] as [number, number, number],
      },
      styles: {
        lineColor: [189, 195, 199] as [number, number, number],
        lineWidth: 0.2,
        cellPadding: 3,
      },
      margin: { left: margin, right: margin, bottom: 30 },
    }

    // ========== PROJECT ITEMS TABLE ==========
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.text(t.projectItems, margin, yPos)
    yPos += 2

    const itemsTableData = translatedItems.map((item) => {
      const areaFormatted = item.area.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const priceFormatted = item.price_per_sqft.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const totalFormatted = item.line_total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return [
        item.item_name,
        getCategoryName(item),
        `${areaFormatted} sq ft`,
        `$${priceFormatted}`,
        `$${totalFormatted}`,
      ]
    })

    autoTable(doc, {
      startY: yPos,
      head: [[t.item, t.category, t.area, t.pricePerSqft, t.lineTotal]],
      body: itemsTableData,
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: contentWidth * 0.22 },
        1: { cellWidth: contentWidth * 0.30 },
        2: { cellWidth: contentWidth * 0.16, halign: 'center' },
        3: { cellWidth: contentWidth * 0.14, halign: 'right' },
        4: { cellWidth: contentWidth * 0.18, halign: 'right', fontStyle: 'bold' },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // ========== PROJECT ADD-ONS TABLE ==========
    if (allAddons.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(t.projectAddons, margin, yPos)
    yPos += 2

      const addonsTableData = allAddons.map((addon) => {
        const priceFormatted = addon.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return [addon.addonName, addon.itemName, `$${priceFormatted}`]
      })

      autoTable(doc, {
        startY: yPos,
        head: [[t.addonName, t.itemName, t.price]],
        body: addonsTableData,
        ...tableStyles,
        columnStyles: {
          0: { cellWidth: contentWidth * 0.45 },
          1: { cellWidth: contentWidth * 0.30 },
          2: { cellWidth: contentWidth * 0.25, halign: 'right' },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // ========== MATERIALS TABLE (only if show_material_prices is true) ==========
    if (show_material_prices && allMaterials.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(t.materials + ':', margin, yPos)
      yPos += 2

      const materialsTableData = allMaterials.map((material) => [
        material.name,
        material.quantity ? material.quantity.toString() : '',
        material.unit || '',
      ])

      autoTable(doc, {
        startY: yPos,
        head: [[t.materialName, t.quantity, t.unit]],
        body: materialsTableData,
        ...tableStyles,
        columnStyles: {
          0: { cellWidth: contentWidth * 0.50 },
          1: { cellWidth: contentWidth * 0.25, halign: 'center' },
          2: { cellWidth: contentWidth * 0.25, halign: 'center' },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // Summary section with styled box
    checkPageBreak(50)
    
    const summaryBoxY = yPos
    const summaryBoxHeight = 40
    const summaryBoxWidth = contentWidth * 0.5
    const summaryBoxX = pageWidth - margin - summaryBoxWidth

    // Draw summary box background
    drawRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, [250, 250, 250])
    
    // Draw summary box border
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
    doc.setLineWidth(0.5)
    doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight)

    let summaryY = summaryBoxY + 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    
    doc.text(`${t.subtotal}:`, summaryBoxX + 5, summaryY)
    doc.text(`$${quote.subtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, summaryY, {
      align: 'right',
    })
    summaryY += 8

    // Only show material cost if show_material_prices is true
    if (show_material_prices && !quote.customer_provides_materials && quote.material_cost > 0) {
      doc.text(`${t.materialCost}:`, summaryBoxX + 5, summaryY)
      doc.text(`$${quote.material_cost.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, summaryY, {
        align: 'right',
      })
      summaryY += 8
    }

    // Calculate total: if material prices are hidden, show subtotal as total
    const displayTotal = show_material_prices ? quote.total_amount : quote.subtotal

    // Total with emphasis
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.setLineWidth(0.5)
    doc.line(summaryBoxX + 5, summaryY - 2, summaryBoxX + summaryBoxWidth - 5, summaryY - 2)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.text(`${t.total}:`, summaryBoxX + 5, summaryY + 5)
    doc.text(`$${displayTotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, summaryY + 5, {
      align: 'right',
    })

    yPos = summaryBoxY + summaryBoxHeight + 15

    // Payment method (from first item if available)
    const firstItemWithPayment = items.find((item) => item.payment_method)
    if (firstItemWithPayment?.payment_method) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(
        `${t.paymentMethod}: ${firstItemWithPayment.payment_method
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')}`,
        margin,
        yPos
      )
      yPos += 10
    }

    // Notes section
    if (translatedNotes) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(`${t.notes}:`, margin, yPos)
      yPos += 8

      // Calculate notes box height based on actual text content
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const notesLines = doc.splitTextToSize(translatedNotes, contentWidth - 10)
      const lineHeight = 4.5 // Line height in mm for font size 10
      const textPadding = 10 // Top + bottom padding
      const notesBoxHeight = Math.max(15, notesLines.length * lineHeight + textPadding)
      
      // Check if we need a new page for the notes box
      checkPageBreak(notesBoxHeight + 10)

      // Draw notes box background
      drawRect(margin, yPos, contentWidth, notesBoxHeight, [252, 252, 252])
      
      // Draw notes box border
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      doc.setLineWidth(0.3)
      doc.rect(margin, yPos, contentWidth, notesBoxHeight)

      // Draw notes text
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(notesLines, margin + 5, yPos + 7)
      yPos += notesBoxHeight + 10
    }

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      
      // Footer line
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      doc.setLineWidth(0.3)
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
      doc.text(t.thankYou, margin, pageHeight - 12)
      doc.text(
        `${t.page} ${i} ${t.of} ${totalPages}`,
        pageWidth - margin,
        pageHeight - 12,
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


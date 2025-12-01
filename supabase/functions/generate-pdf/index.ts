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
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    const t = labels[language]

    // Color scheme (RGB values 0-255)
    const colors = {
      primary: [41, 128, 185],      // Blue header
      secondary: [52, 73, 94],      // Dark gray text
      accent: [46, 204, 113],        // Green accent
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

    // Helper function to draw a table cell without individual borders (borders drawn separately)
    const drawCell = (x: number, y: number, w: number, h: number, text: string, options: {
      align?: 'left' | 'center' | 'right'
      bold?: boolean
      fontSize?: number
      bgColor?: number[]
      textColor?: number[]
    } = {}) => {
      const {
        align = 'left',
        bold = false,
        fontSize = 10,
        bgColor,
        textColor = colors.text,
      } = options

      // Draw background if specified
      if (bgColor) {
        drawRect(x, y, w, h, bgColor)
      }

      // Draw text (no border here, borders drawn separately for the whole table)
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      
      // Split text if needed
      const textLines = doc.splitTextToSize(text, w - 4)
      const lineHeight = fontSize * 0.4
      const startY = y + (h / 2) - ((textLines.length - 1) * lineHeight / 2)
      
      textLines.forEach((line: string, index: number) => {
        const textY = startY + (index * lineHeight)
        const textX = align === 'right' 
          ? x + w - 2
          : align === 'center'
          ? x + w / 2
          : x + 2
        
        doc.text(line, textX, textY, {
          align: align === 'left' ? 'left' : align === 'right' ? 'right' : 'center',
        })
      })
    }

    // Helper function to draw table grid borders
    const drawTableBorders = (startX: number, startY: number, colWidths: Record<string, number>, rowHeights: number[], totalWidth: number) => {
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      doc.setLineWidth(0.2)
      
      let currentY = startY
      const colWidthsArray = Object.values(colWidths)
      const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0)
      
      // Draw outer border
      doc.rect(startX, startY, totalWidth, totalHeight)
      
      // Draw horizontal lines (between rows)
      for (let i = 1; i < rowHeights.length; i++) {
        currentY += rowHeights[i - 1]
        doc.line(startX, currentY, startX + totalWidth, currentY)
      }
      
      // Draw vertical lines (between columns)
      let currentX = startX
      for (let i = 0; i < colWidthsArray.length - 1; i++) {
        currentX += colWidthsArray[i]
        doc.line(currentX, startY, currentX, startY + totalHeight)
      }
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
    
    // Company name (use profile data or default)
    const companyName = 'Best Floors LLC' // Could be from profile.company_name if available
    doc.setFont('helvetica', 'bold')
    doc.text(`${t.company}: ${companyName}`, infoStartX, infoY)
    infoY += 5
    
    // Installer name (use profile data or default)
    const installerName = profile?.full_name || 'John Doe'
    doc.setFont('helvetica', 'normal')
    doc.text(`${t.installer}: ${installerName}`, infoStartX, infoY)
    infoY += 4
    
    // Phone
    const phone = profile?.phone || '(407) 555-1212'
    doc.text(`Phone: ${phone}`, infoStartX, infoY)
    infoY += 4
    
    // Email
    const email = user.email || 'info@bestfloors.com'
    doc.text(`Email: ${email}`, infoStartX, infoY)
    infoY += 4
    
    // Address
    const address = '221 Lake View Dr, Orlando, FL 32811' // Could be from profile.address if available
    const addressLines = doc.splitTextToSize(`Address: ${address}`, infoWidth - 5)
    doc.text(addressLines, infoStartX, infoY)
    infoY += addressLines.length * 4 + 5
    
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

    // Project Items table (below Client section)
    checkPageBreak(50)
    
    // Project Items title
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.text(t.projectItems, margin, yPos)
    yPos += 8
    
    const tableStartY = yPos
    const rowHeight = 8
    const headerRowHeight = 10

    // Column widths for Project Items table
    const colWidths = {
      item: contentWidth * 0.25,
      category: contentWidth * 0.35,
      area: contentWidth * 0.15,
      price: contentWidth * 0.12,
      total: contentWidth * 0.13,
    }

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
      // Try to get category_id from _metadata in addons
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
      // Fallback: try to infer from item_name (first word)
      const firstWord = item.item_name.split(/\s+/)[0].toLowerCase()
      if (categoryMap[firstWord]) {
        return categoryMap[firstWord]
      }
      // Default fallback
      return ''
    }

    // Calculate row heights first
    const rowHeights: number[] = [headerRowHeight]
    doc.setFontSize(10)
    for (const item of translatedItems) {
      const itemName = item.item_name
      const categoryName = getCategoryName(item)
      const itemNameLines = doc.splitTextToSize(itemName, colWidths.item - 4)
      const categoryLines = doc.splitTextToSize(categoryName, colWidths.category - 4)
      const maxLines = Math.max(itemNameLines.length, categoryLines.length)
      const itemRowHeight = Math.max(rowHeight, (maxLines * 5) + 4)
      rowHeights.push(itemRowHeight)
    }

    // Draw table borders as a grid (once, for the whole table)
    const totalTableWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0)
    const totalTableHeight = rowHeights.reduce((sum, h) => sum + h, 0)
    drawTableBorders(margin, tableStartY, colWidths, rowHeights, totalTableWidth)

    let currentX = margin

    // Table header cells (without individual borders)
    drawCell(currentX, tableStartY, colWidths.item, headerRowHeight, t.item, {
      bold: true,
      fontSize: 11,
      bgColor: colors.secondary,
      textColor: [255, 255, 255],
    })
    currentX += colWidths.item

    drawCell(currentX, tableStartY, colWidths.category, headerRowHeight, t.category, {
      bold: true,
      fontSize: 11,
      bgColor: colors.secondary,
      textColor: [255, 255, 255],
    })
    currentX += colWidths.category

    drawCell(currentX, tableStartY, colWidths.area, headerRowHeight, t.area, {
      bold: true,
      fontSize: 11,
      bgColor: colors.secondary,
      textColor: [255, 255, 255],
      align: 'center',
    })
    currentX += colWidths.area

    drawCell(currentX, tableStartY, colWidths.price, headerRowHeight, t.pricePerSqft, {
      bold: true,
      fontSize: 11,
      bgColor: colors.secondary,
      textColor: [255, 255, 255],
      align: 'right',
    })
    currentX += colWidths.price

    drawCell(currentX, tableStartY, colWidths.total, headerRowHeight, t.lineTotal, {
      bold: true,
      fontSize: 11,
      bgColor: colors.secondary,
      textColor: [255, 255, 255],
      align: 'right',
    })

    yPos = tableStartY + headerRowHeight

    // Collect all materials from all items (for separate materials section)
    const materialsMap = new Map<string, { name: string; quantity?: number; unit?: string }>()
    for (const item of translatedItems) {
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          // Skip _metadata fields
          if (addon._metadata || addon.name === '_metadata' || addon.id === '_metadata') {
            continue
          }
          // Collect material type addons
          if (addon.addonType === 'material' || addon.addon_type === 'material') {
            const materialName = addon.name || (addon as any).name
            const materialUnit = addon.unit
            const materialQuantity = addon.quantity
            
            // Group materials by name and unit, sum quantities if same unit
            const materialKey = `${materialName}_${materialUnit || 'none'}`
            const existingMaterial = materialsMap.get(materialKey)
            
            if (existingMaterial) {
              // Sum quantities if same unit
              if (materialQuantity && existingMaterial.quantity && existingMaterial.unit === materialUnit) {
                existingMaterial.quantity = existingMaterial.quantity + materialQuantity
              }
            } else {
              materialsMap.set(materialKey, {
                name: materialName,
                quantity: materialQuantity,
                unit: materialUnit,
              })
            }
          }
        }
      }
    }
    const allMaterials = Array.from(materialsMap.values())

    // Table rows
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])

    for (let i = 0; i < translatedItems.length; i++) {
      const item = translatedItems[i]
      const itemRowHeight = rowHeights[i + 1] // +1 because rowHeights[0] is header
      checkPageBreak(itemRowHeight)

      // Get category name from item metadata
      const categoryName = getCategoryName(item)
      // Use full item_name for Item column
      const itemName = item.item_name

      // Alternate row background (use total table width, not contentWidth)
      if (i % 2 === 0) {
        drawRect(margin, yPos, totalTableWidth, itemRowHeight, colors.lightGray)
      }

      currentX = margin

      // Item cell (full item_name)
      drawCell(currentX, yPos, colWidths.item, itemRowHeight, itemName, {
        align: 'left',
        fontSize: 10,
      })
      currentX += colWidths.item

      // Category cell (category name from metadata)
      drawCell(currentX, yPos, colWidths.category, itemRowHeight, categoryName, {
        align: 'left',
        fontSize: 10,
      })
      currentX += colWidths.category

      // Area cell
      const areaFormatted = item.area.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const areaText = `${areaFormatted} sq ft`
      drawCell(currentX, yPos, colWidths.area, itemRowHeight, areaText, {
        align: 'center',
        fontSize: 10,
      })
      currentX += colWidths.area

      // Price per sqft cell
      const priceFormatted = item.price_per_sqft.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const priceText = `$${priceFormatted}`
      drawCell(currentX, yPos, colWidths.price, itemRowHeight, priceText, {
        align: 'right',
        fontSize: 10,
      })
      currentX += colWidths.price

      // Line total cell
      const totalFormatted = item.line_total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const totalText = `$${totalFormatted}`
      drawCell(currentX, yPos, colWidths.total, itemRowHeight, totalText, {
        align: 'right',
        fontSize: 10,
        bold: true,
      })

      yPos += itemRowHeight

      // Dates (if available)
      if (item.start_date || item.end_date) {
        checkPageBreak(rowHeight)
        
        if (i % 2 === 0) {
          drawRect(margin, yPos, contentWidth, rowHeight, colors.lightGray)
        }

        const dateText = [
          item.start_date && `${t.startDate}: ${new Date(item.start_date).toLocaleDateString()}`,
          item.end_date && `${t.endDate}: ${new Date(item.end_date).toLocaleDateString()}`,
        ]
          .filter(Boolean)
          .join(' • ')

        drawCell(margin, yPos, contentWidth, rowHeight, dateText, {
          align: 'left',
          fontSize: 8,
        })

        yPos += rowHeight
      }

      yPos += 2 // Small spacing between items
    }

    yPos += 10

    // Collect all addons (excluding materials) from all items for separate addons table
    const allAddons: Array<{ addonName: string; itemName: string; price: number }> = []
    for (const item of translatedItems) {
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          // Skip _metadata fields
          if (addon._metadata || addon.name === '_metadata' || addon.id === '_metadata') {
            continue
          }
          // Skip material type addons
          if (addon.addonType === 'material' || addon.addon_type === 'material') {
            continue
          }
          
          const addonName = addon.name || (addon as any).name
          const addonPrice = (addon as any).price || 0
          
          // Use full item_name for display
          allAddons.push({
            addonName,
            itemName: item.item_name,
            price: addonPrice,
          })
        }
      }
    }

    // Project Add-ons table (if there are any addons)
    if (allAddons.length > 0) {
      checkPageBreak(40)
      
      // Project Add-ons title
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(t.projectAddons, margin, yPos)
      yPos += 8
      
      const addonsTableStartY = yPos
      const addonsRowHeight = 8
      const addonsHeaderRowHeight = 10

      // Column widths for Add-ons table
      const addonsColWidths = {
        addonName: contentWidth * 0.45,
        itemName: contentWidth * 0.30,
        price: contentWidth * 0.25,
      }

      // Calculate addons row heights first
      doc.setFontSize(10)
      const addonsRowHeights: number[] = [addonsHeaderRowHeight]
      for (const addon of allAddons) {
        const addonNameLines = doc.splitTextToSize(addon.addonName, addonsColWidths.addonName - 4)
        const addonRowHeight = Math.max(addonsRowHeight, (addonNameLines.length * 5) + 4)
        addonsRowHeights.push(addonRowHeight)
      }

      // Draw addons table borders as a grid
      const addonsTotalTableWidth = Object.values(addonsColWidths).reduce((sum, w) => sum + w, 0)
      const addonsTotalTableHeight = addonsRowHeights.reduce((sum, h) => sum + h, 0)
      drawTableBorders(margin, addonsTableStartY, addonsColWidths, addonsRowHeights, addonsTotalTableWidth)

      let addonsCurrentX = margin

      // Table header
      drawCell(addonsCurrentX, addonsTableStartY, addonsColWidths.addonName, addonsHeaderRowHeight, t.addonName, {
        bold: true,
        fontSize: 11,
        bgColor: colors.secondary,
        textColor: [255, 255, 255],
      })
      addonsCurrentX += addonsColWidths.addonName

      drawCell(addonsCurrentX, addonsTableStartY, addonsColWidths.itemName, addonsHeaderRowHeight, t.itemName, {
        bold: true,
        fontSize: 11,
        bgColor: colors.secondary,
        textColor: [255, 255, 255],
      })
      addonsCurrentX += addonsColWidths.itemName

      drawCell(addonsCurrentX, addonsTableStartY, addonsColWidths.price, addonsHeaderRowHeight, t.price, {
        bold: true,
        fontSize: 11,
        bgColor: colors.secondary,
        textColor: [255, 255, 255],
        align: 'right',
      })

      yPos = addonsTableStartY + addonsHeaderRowHeight

      // Add-ons table rows
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])

      for (let i = 0; i < allAddons.length; i++) {
        const addon = allAddons[i]
        const addonRowHeight = addonsRowHeights[i + 1] // +1 because rowHeights[0] is header
        checkPageBreak(addonRowHeight)

        // Alternate row background (use total table width)
        if (i % 2 === 0) {
          drawRect(margin, yPos, addonsTotalTableWidth, addonRowHeight, colors.lightGray)
        }

        addonsCurrentX = margin

        // Addon name cell
        drawCell(addonsCurrentX, yPos, addonsColWidths.addonName, addonRowHeight, addon.addonName, {
          align: 'left',
          fontSize: 10,
        })
        addonsCurrentX += addonsColWidths.addonName

        // Item name cell
        drawCell(addonsCurrentX, yPos, addonsColWidths.itemName, addonRowHeight, addon.itemName, {
          align: 'left',
          fontSize: 10,
        })
        addonsCurrentX += addonsColWidths.itemName

        // Price cell
        const priceFormatted = addon.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        const priceText = `$${priceFormatted}`
        drawCell(addonsCurrentX, yPos, addonsColWidths.price, addonRowHeight, priceText, {
          align: 'right',
          fontSize: 10,
        })

        yPos += addonRowHeight
      }

      yPos += 10
    }

    // Materials section (if there are any materials) - as a table
    if (allMaterials.length > 0) {
      const materialsRowHeight = 8
      const materialsHeaderRowHeight = 10

      // Column widths for Materials table
      const materialsColWidths = {
        name: contentWidth * 0.50,
        quantity: contentWidth * 0.25,
        unit: contentWidth * 0.25,
      }

      const materialsTotalTableWidth = Object.values(materialsColWidths).reduce((sum, w) => sum + w, 0)

      // Helper function to draw materials table header
      const drawMaterialsHeader = (startY: number) => {
        // Draw header row with borders
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
        doc.setLineWidth(0.2)
        doc.rect(margin, startY, materialsTotalTableWidth, materialsHeaderRowHeight)
        
        // Draw vertical lines for header
        let headerCurrentX = margin
        doc.line(headerCurrentX + materialsColWidths.name, startY, headerCurrentX + materialsColWidths.name, startY + materialsHeaderRowHeight)
        headerCurrentX += materialsColWidths.name
        doc.line(headerCurrentX + materialsColWidths.quantity, startY, headerCurrentX + materialsColWidths.quantity, startY + materialsHeaderRowHeight)

        let materialsCurrentX = margin

        // Table header cells
        drawCell(materialsCurrentX, startY, materialsColWidths.name, materialsHeaderRowHeight, t.materialName, {
          bold: true,
          fontSize: 11,
          bgColor: colors.secondary,
          textColor: [255, 255, 255],
        })
        materialsCurrentX += materialsColWidths.name

        drawCell(materialsCurrentX, startY, materialsColWidths.quantity, materialsHeaderRowHeight, t.quantity, {
          bold: true,
          fontSize: 11,
          bgColor: colors.secondary,
          textColor: [255, 255, 255],
          align: 'center',
        })
        materialsCurrentX += materialsColWidths.quantity

        drawCell(materialsCurrentX, startY, materialsColWidths.unit, materialsHeaderRowHeight, t.unit, {
          bold: true,
          fontSize: 11,
          bgColor: colors.secondary,
          textColor: [255, 255, 255],
          align: 'center',
        })
      }

      // Check if we need a new page for title + header
      checkPageBreak(materialsHeaderRowHeight + 20)
      
      // Materials section title
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(t.materials + ':', margin, yPos)
      yPos += 8
      
      const materialsTableStartY = yPos
      
      // Draw header
      drawMaterialsHeader(materialsTableStartY)
      yPos = materialsTableStartY + materialsHeaderRowHeight

      // Materials table rows - draw borders row by row to handle page breaks
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])

      for (let i = 0; i < allMaterials.length; i++) {
        const material = allMaterials[i]
        
        // Calculate row height
        doc.setFontSize(10)
        const materialNameLines = doc.splitTextToSize(material.name, materialsColWidths.name - 4)
        const materialRowHeight = Math.max(materialsRowHeight, (materialNameLines.length * 5) + 4)
        
        // Check page break BEFORE drawing (include header if needed)
        const needsHeader = yPos === margin // If we're at the top of a new page
        const requiredHeight = materialRowHeight + (needsHeader ? materialsHeaderRowHeight + 8 : 0)
        
        if (yPos + requiredHeight > pageHeight - margin - 20) {
          doc.addPage()
          yPos = margin
          
          // Redraw title and header on new page
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
          doc.text(t.materials + ':', margin, yPos)
          yPos += 8
          drawMaterialsHeader(yPos)
          yPos += materialsHeaderRowHeight
        }

        // Draw row border (top and sides)
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
        doc.setLineWidth(0.2)
        doc.line(margin, yPos, margin + materialsTotalTableWidth, yPos) // Top border
        doc.line(margin, yPos, margin, yPos + materialRowHeight) // Left border
        doc.line(margin + materialsTotalTableWidth, yPos, margin + materialsTotalTableWidth, yPos + materialRowHeight) // Right border
        
        // Draw vertical lines between columns
        let verticalX = margin
        doc.line(verticalX + materialsColWidths.name, yPos, verticalX + materialsColWidths.name, yPos + materialRowHeight)
        verticalX += materialsColWidths.name
        doc.line(verticalX + materialsColWidths.quantity, yPos, verticalX + materialsColWidths.quantity, yPos + materialRowHeight)

        // Alternate row background
        if (i % 2 === 0) {
          drawRect(margin, yPos, materialsTotalTableWidth, materialRowHeight, colors.lightGray)
        }

        let materialsCurrentX = margin

        // Material name cell
        drawCell(materialsCurrentX, yPos, materialsColWidths.name, materialRowHeight, material.name, {
          align: 'left',
          fontSize: 10,
        })
        materialsCurrentX += materialsColWidths.name

        // Quantity cell
        const quantityText = material.quantity ? material.quantity.toString() : ''
        drawCell(materialsCurrentX, yPos, materialsColWidths.quantity, materialRowHeight, quantityText, {
          align: 'center',
          fontSize: 10,
        })
        materialsCurrentX += materialsColWidths.quantity

        // Unit cell
        const unitText = material.unit || ''
        drawCell(materialsCurrentX, yPos, materialsColWidths.unit, materialRowHeight, unitText, {
          align: 'center',
          fontSize: 10,
        })

        yPos += materialRowHeight
        
        // Draw bottom border for this row
        doc.line(margin, yPos, margin + materialsTotalTableWidth, yPos)
      }

      yPos += 10
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

    if (!quote.customer_provides_materials && quote.material_cost > 0) {
      doc.text(`${t.materialCost}:`, summaryBoxX + 5, summaryY)
      doc.text(`$${quote.material_cost.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, summaryY, {
        align: 'right',
      })
      summaryY += 8
    }

    // Total with emphasis
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.setLineWidth(0.5)
    doc.line(summaryBoxX + 5, summaryY - 2, summaryBoxX + summaryBoxWidth - 5, summaryY - 2)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.text(`${t.total}:`, summaryBoxX + 5, summaryY + 5)
    doc.text(`$${quote.total_amount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, summaryY + 5, {
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
      checkPageBreak(30)
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.text(`${t.notes}:`, margin, yPos)
      yPos += 8

      // Notes box
      const notesBoxHeight = Math.min(40, (translatedNotes.length / 50) * 5 + 15)
      drawRect(margin, yPos, contentWidth, notesBoxHeight, [252, 252, 252])
      
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      doc.setLineWidth(0.3)
      doc.rect(margin, yPos, contentWidth, notesBoxHeight)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const notesLines = doc.splitTextToSize(translatedNotes, contentWidth - 10)
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


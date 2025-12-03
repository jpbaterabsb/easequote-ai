export interface QuoteItem {
  id: string
  item_name: string
  area: number
  price_per_sqft: number
  line_total: number
  addons: Addon[]
  category_id?: string // Optional: category ID for editing
  subcategory_id?: string // Optional: subcategory ID for editing
}

export type AddonType = 'material' | 'service' | 'complexity' | 'general'

export interface Addon {
  id: string
  name: string
  price: number
  addonType?: AddonType // Tipo do addon: material, service, complexity, ou general
  // Campos opcionais para materiais (para lista futura)
  quantity?: number
  unit?: string
  priceType?: 'sqft' | 'unit' | 'ft' | 'step' | 'percent'
  basePrice?: number
  // Metadata fields for storing category/subcategory info
  category_id?: string
  subcategory_id?: string
}

export interface CustomerInfo {
  customer_name: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
  customer_city?: string
  customer_state?: string
  customer_zip?: string
  customer_lat?: number
  customer_lng?: number
}

export interface QuoteFormData {
  customer: CustomerInfo
  items: QuoteItem[]
  customer_provides_materials: boolean
  material_cost: number
  payment_method?: 'credit_card' | 'debit_card' | 'cash' | 'check' | 'zelle'
  notes: string
  start_date?: string
  end_date?: string
}

export interface QuoteDraft {
  id: string
  data: QuoteFormData
  updated_at: string
}


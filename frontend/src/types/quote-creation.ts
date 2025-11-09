export interface QuoteItem {
  id: string
  item_name: string
  area: number
  price_per_sqft: number
  line_total: number
  start_date?: string
  end_date?: string
  addons: Addon[]
}

export interface Addon {
  id: string
  name: string
  price: number
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
}

export interface QuoteDraft {
  id: string
  data: QuoteFormData
  updated_at: string
}


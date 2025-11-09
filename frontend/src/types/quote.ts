export type QuoteStatus = 'created' | 'sent' | 'accepted' | 'rejected' | 'in_progress' | 'completed'

export interface Quote {
  id: string
  quote_number: string
  user_id: string
  customer_id: string | null
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  customer_address: string | null
  customer_city: string | null
  customer_state: string | null
  customer_zip: string | null
  customer_lat: number | null
  customer_lng: number | null
  status: QuoteStatus
  notes: string | null
  customer_provides_materials: boolean
  material_cost: number
  subtotal: number
  total_amount: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface QuoteFilters {
  search: string
  status: QuoteStatus[]
  dateFrom: string | null
  dateTo: string | null
  amountMin: number | null
  amountMax: number | null
  location: string | null
}

export type SortField = 'created_at' | 'customer_name' | 'total_amount' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  order: SortOrder
}


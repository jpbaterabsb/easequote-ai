import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Settings, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Quote, QuoteFilters, SortConfig } from '@/types/quote'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { QuoteFilters as QuoteFiltersComponent } from '@/components/dashboard/QuoteFilters'
import { Pagination } from '@/components/dashboard/Pagination'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'

const ITEMS_PER_PAGE = 20

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<QuoteFilters>({
    search: '',
    status: [],
    dateFrom: null,
    dateTo: null,
    amountMin: null,
    amountMax: null,
    location: null,
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    order: 'desc',
  })

  const debouncedSearch = useDebounce(filters.search, 300)

  useEffect(() => {
    fetchQuotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.amountMin,
    filters.amountMax,
    filters.location,
    sortConfig.field,
    sortConfig.order,
    currentPage,
  ])

  const fetchQuotes = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('quotes')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order(sortConfig.field, { ascending: sortConfig.order === 'asc' })

      // Apply search filter
      if (debouncedSearch) {
        query = query.or(
          `customer_name.ilike.%${debouncedSearch}%,quote_number.ilike.%${debouncedSearch}%,customer_address.ilike.%${debouncedSearch}%,customer_city.ilike.%${debouncedSearch}%`
        )
      }

      // Apply status filter
      if (filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      // Apply date filters
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      // Apply amount filters
      if (filters.amountMin !== null) {
        query = query.gte('total_amount', filters.amountMin)
      }
      if (filters.amountMax !== null) {
        query = query.lte('total_amount', filters.amountMax)
      }

      // Apply location filter
      if (filters.location) {
        query = query.or(
          `customer_city.ilike.%${filters.location}%,customer_state.ilike.%${filters.location}%`
        )
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      setQuotes(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load quotes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quoteId: string) => {
    try {
      // Get quote before deleting for audit log
      const { data: quoteData } = await supabase
        .from('quotes')
        .select('quote_number')
        .eq('id', quoteId)
        .single()

      const { error } = await supabase
        .from('quotes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', quoteId)

      if (error) throw error

      // Log audit event
      const { logAuditEvent } = await import('@/utils/audit')
      await logAuditEvent({
        entity_type: 'quote',
        entity_id: quoteId,
        action: 'deleted',
        old_values: quoteData ? { quote_number: quoteData.quote_number } : undefined,
      })

      toast({
        title: 'Success',
        description: 'Quote deleted successfully',
      })

      // Refresh quotes
      fetchQuotes()
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete quote. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSortChange = (field: string) => {
    if (field === sortConfig.field) {
      // Toggle order if same field
      setSortConfig({
        field: field as SortConfig['field'],
        order: sortConfig.order === 'asc' ? 'desc' : 'asc',
      })
    } else {
      // Set new field with default order
      setSortConfig({
        field: field as SortConfig['field'],
        order: field === 'created_at' ? 'desc' : 'asc',
      })
    }
    setCurrentPage(1) // Reset to first page on sort change
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between animate-slide-in-down">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            EaseQuote AI
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline animate-fade-in">
              {user?.email}
            </span>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-slide-in-up">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Quotes
            </h2>
            {!loading && (
              <p className="text-sm text-muted-foreground animate-fade-in stagger-1">
                {totalCount} {totalCount === 1 ? 'quote' : 'quotes'}
              </p>
            )}
          </div>
          <Link to="/quotes/new" className="w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-primary hover:opacity-90">
              <Plus className="h-5 w-5" />
              <span>Create Quote</span>
            </Button>
          </Link>
        </div>

        <div className="space-y-4 mb-6">
          <QuoteFiltersComponent filters={filters} onFiltersChange={setFilters} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="sort-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Sort by:
              </label>
              <Select
                value={`${sortConfig.field}-${sortConfig.order}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  handleSortChange(field)
                }}
              >
                <SelectTrigger id="sort-select" className="w-full sm:w-[220px] h-11 border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="customer_name-asc">Customer Name (A-Z)</SelectItem>
                  <SelectItem value="customer_name-desc">Customer Name (Z-A)</SelectItem>
                  <SelectItem value="total_amount-desc">Amount (High to Low)</SelectItem>
                  <SelectItem value="total_amount-asc">Amount (Low to High)</SelectItem>
                  <SelectItem value="status-asc">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading quotes..." />
        ) : quotes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {quotes.map((quote, index) => (
                <div
                  key={quote.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <QuoteCard
                    quote={quote}
                    onDelete={handleDelete}
                    onStatusChanged={fetchQuotes}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

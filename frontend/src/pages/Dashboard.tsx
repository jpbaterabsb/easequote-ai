import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Settings, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Quote, QuoteFilters, SortConfig } from '@/types/quote'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { QuoteFilters as QuoteFiltersComponent } from '@/components/dashboard/QuoteFilters'
import { Pagination } from '@/components/dashboard/Pagination'
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
  }, [debouncedSearch, filters, sortConfig, currentPage])

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
      const { error } = await supabase
        .from('quotes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', quoteId)

      if (error) throw error

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">EaseQuote AI</h1>
          <div className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Quotes</h2>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                {totalCount} {totalCount === 1 ? 'quote' : 'quotes'}
              </p>
            )}
          </div>
          <Link to="/quotes/new">
            <Button className="gap-2">
              <Plus className="h-5 w-5" />
              Create Quote
            </Button>
          </Link>
        </div>

        <div className="space-y-4 mb-6">
          <QuoteFiltersComponent filters={filters} onFiltersChange={setFilters} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={`${sortConfig.field}-${sortConfig.order}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  handleSortChange(field)
                }}
              >
                <SelectTrigger className="w-[200px]">
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
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : quotes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {quotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} onDelete={handleDelete} />
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

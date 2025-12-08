import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Quote, QuoteFilters, SortConfig } from '@/types/quote'
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
import { useTranslation } from '@/hooks/useTranslation'
import { MainLayout } from '@/components/layout/MainLayout'

const ITEMS_PER_PAGE = 20

export function Dashboard() {
  const { refreshSubscription } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
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

  // Handle payment success/cancelled URL params
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      toast({
        title: t('subscription.paymentSuccess') || 'Payment Successful!',
        description: t('subscription.paymentSuccessDescription') || 'Thank you for subscribing. Your account is now active.',
      })
      // Refresh subscription status
      refreshSubscription()
      // Remove the param from URL
      searchParams.delete('payment')
      setSearchParams(searchParams, { replace: true })
    } else if (payment === 'cancelled') {
      toast({
        title: t('subscription.paymentCancelled') || 'Payment Cancelled',
        description: t('subscription.paymentCancelledDescription') || 'Your payment was cancelled. You can try again anytime.',
        variant: 'destructive',
      })
      searchParams.delete('payment')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, toast, t, refreshSubscription])

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
        title: t('common.error'),
        description: t('quote.failedToLoad'),
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
        title: t('common.success'),
        description: t('quote.quoteDeleted'),
      })

      // Refresh quotes
      fetchQuotes()
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast({
        title: t('common.error'),
        description: t('quote.failedToDelete'),
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
    <MainLayout>
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-slide-in-up">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('dashboard.quotes')}
            </h2>
            {!loading && (
              <p className="text-sm text-muted-foreground animate-fade-in stagger-1">
                {totalCount} {totalCount === 1 ? t('dashboard.quote') : t('dashboard.quotes')}
              </p>
            )}
          </div>
          <Link to="/quotes/new" className="w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto font-semibold">
              <Plus className="h-5 w-5" />
              <span>{t('dashboard.createQuote')}</span>
            </Button>
          </Link>
        </div>

        <div className="space-y-4 mb-6">
          <QuoteFiltersComponent filters={filters} onFiltersChange={setFilters} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="sort-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {t('dashboard.sortBy')}
              </label>
              <Select
                value={`${sortConfig.field}-${sortConfig.order}`}
                onValueChange={(value) => {
                  const [field] = value.split('-')
                  handleSortChange(field)
                }}
              >
                <SelectTrigger id="sort-select" className="w-full sm:w-[220px] h-11 border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">{t('dashboard.newestFirst')}</SelectItem>
                  <SelectItem value="created_at-asc">{t('dashboard.oldestFirst')}</SelectItem>
                  <SelectItem value="customer_name-asc">{t('dashboard.customerNameAZ')}</SelectItem>
                  <SelectItem value="customer_name-desc">{t('dashboard.customerNameZA')}</SelectItem>
                  <SelectItem value="total_amount-desc">{t('dashboard.amountHighToLow')}</SelectItem>
                  <SelectItem value="total_amount-asc">{t('dashboard.amountLowToHigh')}</SelectItem>
                  <SelectItem value="status-asc">{t('dashboard.status')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text={t('dashboard.loadingQuotes')} />
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
    </MainLayout>
  )
}

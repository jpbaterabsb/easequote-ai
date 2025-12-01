import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QuoteFilters as QuoteFiltersType, QuoteStatus } from '@/types/quote'
import { X, Filter } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface QuoteFiltersProps {
  filters: QuoteFiltersType
  onFiltersChange: (filters: QuoteFiltersType) => void
}

const statusOptions: { value: QuoteStatus; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export function QuoteFilters({ filters, onFiltersChange }: QuoteFiltersProps) {
  const { t } = useTranslation()
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = <K extends keyof QuoteFiltersType>(
    key: K,
    value: QuoteFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
      location: null,
    })
  }

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin !== null ||
    filters.amountMax !== null ||
    filters.location !== null

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={t('dashboard.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 font-medium"
        >
          <Filter className="h-4 w-4" />
          {t('dashboard.filters')}
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary text-white px-1.5 py-0.5 text-xs font-semibold">
              {filters.status.length +
                (filters.dateFrom ? 1 : 0) +
                (filters.dateTo ? 1 : 0) +
                (filters.amountMin !== null ? 1 : 0) +
                (filters.amountMax !== null ? 1 : 0) +
                (filters.location ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-white shadow-lg shadow-gray-300/30 border border-gray-100">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filters.status.length > 0 ? filters.status[0] : 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  updateFilter('status', [])
                } else {
                  // For now, support single status selection
                  // Can be enhanced later to support multiple
                  updateFilter('status', [value as QuoteStatus])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value || null)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value || null)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Min Amount</label>
            <Input
              type="number"
              placeholder="$0.00"
              value={filters.amountMin || ''}
              onChange={(e) =>
                updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : null)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Amount</label>
            <Input
              type="number"
              placeholder="$0.00"
              value={filters.amountMax || ''}
              onChange={(e) =>
                updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : null)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Input
              placeholder="City or State"
              value={filters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value || null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}


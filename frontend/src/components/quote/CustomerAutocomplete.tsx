import { useState, useRef, useEffect, memo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete'
import { Loader2 } from 'lucide-react'

interface CustomerAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectCustomer?: (customer: { name: string; phone?: string; email?: string }) => void
  error?: string
  placeholder?: string
  id?: string
}

export const CustomerAutocomplete = memo(function CustomerAutocomplete({
  value,
  onChange,
  onSelectCustomer,
  error,
  placeholder = 'Start typing to search customers...',
  id = 'customer_name',
}: CustomerAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { customers, loading } = useCustomerAutocomplete(value)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(true)
  }

  const handleSelectCustomer = (customer: { name: string; phone?: string | null; email?: string | null }) => {
    onChange(customer.name)
    setShowSuggestions(false)

    if (onSelectCustomer) {
      onSelectCustomer({
        name: customer.name,
        phone: customer.phone || undefined,
        email: customer.email || undefined,
      })
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={error ? 'border-destructive' : ''}
        autoComplete="off"
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      {showSuggestions && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelectCustomer(customer)}
                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
              >
                <div className="font-medium">{customer.name}</div>
                {(customer.email || customer.phone) && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {[customer.email, customer.phone].filter(Boolean).join(' • ')}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              No customers found. Continue typing to create a new customer.
            </div>
          )}
        </div>
      )}
    </div>
  )
})


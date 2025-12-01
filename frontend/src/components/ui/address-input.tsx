import { useState, useEffect, useRef, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin } from 'lucide-react'
import { setKey, fromAddress } from 'react-geocode'

interface AddressInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  error?: string
}

// Initialize react-geocode
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
if (apiKey) {
  setKey(apiKey)
}

export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  ({ value = '', onChange, error, className, ...props }, ref) => {
    const [query, setQuery] = useState(value)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setQuery(value)
    }, [value])

    // Close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowSuggestions(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleGeocode = async (address: string) => {
      if (!address.trim() || !apiKey) {
        setSuggestions([])
        return
      }

      try {
        setLoading(true)
        const response = await fromAddress(address)
        
        if (response.results && response.results.length > 0) {
          const formatted = response.results.map((result: any) => ({
            formatted_address: result.formatted_address,
          }))
          setSuggestions(formatted)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const handleInputChange = (newQuery: string) => {
      setQuery(newQuery)
      onChange?.(newQuery)
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Debounce geocoding
      if (newQuery.length > 3 && apiKey) {
        timeoutRef.current = setTimeout(() => {
          handleGeocode(newQuery)
        }, 500)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const handleSelectSuggestion = (suggestion: any) => {
      const address = suggestion.formatted_address
      setQuery(address)
      onChange?.(address)
      setSuggestions([])
      setShowSuggestions(false)
    }

    return (
      <div ref={containerRef} className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`pl-9 ${className || ''}`}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            {...props}
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full border border-gray-200/50 rounded-lg bg-white/95 backdrop-blur-md shadow-lg max-h-60 overflow-auto mt-1">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-primary/5 focus:bg-primary/10 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="font-medium text-gray-900 text-sm">{suggestion.formatted_address}</div>
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    )
  }
)

AddressInput.displayName = 'AddressInput'


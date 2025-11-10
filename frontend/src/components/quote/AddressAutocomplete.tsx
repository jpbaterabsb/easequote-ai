import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { setKey, fromAddress } from 'react-geocode'
import type { CustomerInfo } from '@/types/quote-creation'

interface AddressAutocompleteProps {
  value: Partial<CustomerInfo>
  onChange: (address: Partial<CustomerInfo>) => void
  error?: string
}

// Initialize react-geocode
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
if (apiKey) {
  setKey(apiKey)
}

export function AddressAutocomplete({ value, onChange, error }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value.customer_address || '')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setQuery(value.customer_address || '')
  }, [value.customer_address])

  const handleGeocode = async (address: string) => {
    if (!address.trim() || !apiKey) {
      setSuggestions([])
      return
    }

    try {
      setLoading(true)
      const response = await fromAddress(address)
      
      if (response.results && response.results.length > 0) {
        const formatted = response.results.map((result: any) => {
          const components = result.address_components || []
          let city = ''
          let state = ''
          let zip = ''
          
          components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              city = component.long_name
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.short_name
            }
            if (component.types.includes('postal_code')) {
              zip = component.long_name
            }
          })

          const location = result.geometry?.location
          const lat = typeof location?.lat === 'function' ? location.lat() : location?.lat
          const lng = typeof location?.lng === 'function' ? location.lng() : location?.lng

          return {
            formatted_address: result.formatted_address,
            lat,
            lng,
            city,
            state,
            zip,
          }
        })
        setSuggestions(formatted)
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
    setUseManualEntry(false)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Update address immediately for manual entry
    onChange({
      ...value,
      customer_address: newQuery,
    })

    // Debounce geocoding
    if (newQuery.length > 3 && apiKey) {
      timeoutRef.current = setTimeout(() => {
        handleGeocode(newQuery)
      }, 500)
    } else {
      setSuggestions([])
    }
  }

  const handleSelectSuggestion = (suggestion: any) => {
    setQuery(suggestion.formatted_address)
    setSuggestions([])
    onChange({
      ...value,
      customer_address: suggestion.formatted_address,
      customer_city: suggestion.city,
      customer_state: suggestion.state,
      customer_zip: suggestion.zip,
      customer_lat: suggestion.lat,
      customer_lng: suggestion.lng,
    })
  }

  const handleManualEntry = () => {
    setUseManualEntry(true)
    setSuggestions([])
    // Keep the current address value, user can edit manually
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address">Job Address (Optional)</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="address"
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter job address..."
          className="pl-9"
          onBlur={() => {
            // Keep suggestions visible briefly on blur
            setTimeout(() => setSuggestions([]), 200)
          }}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {suggestions.length > 0 && !useManualEntry && (
        <div className="border border-gray-200/50 rounded-lg bg-white/95 backdrop-blur-md shadow-elegant-lg max-h-60 overflow-auto z-10 relative mt-2 animate-slide-in-down">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-primary/5 focus:bg-primary/10 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-lg"
            >
              <div className="font-medium text-gray-900">{suggestion.formatted_address}</div>
              {(suggestion.city || suggestion.state) && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {[suggestion.city, suggestion.state, suggestion.zip]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={handleManualEntry}
            className="w-full text-left px-4 py-3 hover:bg-primary/5 focus:bg-primary/10 focus:outline-none transition-colors duration-150 text-sm text-gray-600 border-t border-gray-100 rounded-b-lg"
          >
            Use address as entered
          </button>
        </div>
      )}

      {useManualEntry && (
        <div className="text-sm text-muted-foreground">
          Entering address manually. You can edit city, state, and zip below.
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            value={value.customer_city || ''}
            onChange={(e) =>
              onChange({ ...value, customer_city: e.target.value })
            }
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            value={value.customer_state || ''}
            onChange={(e) =>
              onChange({ ...value, customer_state: e.target.value })
            }
            placeholder="State"
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            type="text"
            value={value.customer_zip || ''}
            onChange={(e) =>
              onChange({ ...value, customer_zip: e.target.value })
            }
            placeholder="ZIP"
          />
        </div>
      </div>
    </div>
  )
}


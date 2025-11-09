import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/useDebounce'
import { addonOptions, type AddonOption } from '@/data/addons'
import type { Addon } from '@/types/quote-creation'

interface AddonSelectorProps {
  onSelect: (addon: Addon) => void
  onCancel: () => void
}

interface AddonSuggestion {
  option: AddonOption
  path: AddonOption[]
  fullName: string
}

export function AddonSelector({ onSelect, onCancel }: AddonSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddonSuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [customName, setCustomName] = useState('')
  const [price, setPrice] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(searchQuery, 200)

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

  // Flatten hierarchical structure into searchable suggestions
  const allSuggestions = useMemo(() => {
    const suggestions: AddonSuggestion[] = []

    const traverse = (option: AddonOption, path: AddonOption[] = []) => {
      const currentPath = [...path, option]
      
      // Only include leaf nodes (options without children) as selectable suggestions
      if (!option.children || option.children.length === 0) {
        const fullName = currentPath.map((p) => p.name).join(' - ')
        suggestions.push({
          option,
          path: currentPath,
          fullName,
        })
      }

      // Also include parent nodes for search, but they're not directly selectable
      if (option.children) {
        option.children.forEach((child) => traverse(child, currentPath))
      }
    }

    addonOptions.forEach((option) => traverse(option))
    return suggestions
  }, [])

  // Filter suggestions based on search query
  const filteredSuggestions = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return allSuggestions.slice(0, 10) // Show first 10 when no query
    }

    const query = debouncedQuery.toLowerCase()
    return allSuggestions
      .filter((suggestion) =>
        suggestion.fullName.toLowerCase().includes(query) ||
        suggestion.option.name.toLowerCase().includes(query) ||
        suggestion.path.some((p) => p.name.toLowerCase().includes(query))
      )
      .slice(0, 10) // Limit to 10 results
  }, [debouncedQuery, allSuggestions])

  const handleSelectSuggestion = (suggestion: AddonSuggestion) => {
    setSelectedSuggestion(suggestion)
    setSearchQuery(suggestion.fullName)
    setShowSuggestions(false)
    setUseCustom(false)
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(true)
    setSelectedSuggestion(null)
    setUseCustom(false)
  }

  const handleAdd = () => {
    const addonPrice = parseFloat(price)
    if (isNaN(addonPrice) || addonPrice < 0) {
      return
    }

    let addonName: string
    if (useCustom) {
      addonName = customName.trim()
    } else if (selectedSuggestion) {
      addonName = selectedSuggestion.fullName
    } else {
      // Allow using typed text as custom addon if no suggestion selected
      addonName = searchQuery.trim()
    }

    if (!addonName) {
      return
    }

    const addon: Addon = {
      id: crypto.randomUUID(),
      name: addonName,
      price: addonPrice,
    }

    onSelect(addon)
    // Reset form
    setSearchQuery('')
    setSelectedSuggestion(null)
    setCustomName('')
    setPrice('')
    setUseCustom(false)
  }

  const canAdd = () => {
    if (useCustom) {
      return customName.trim() && price && parseFloat(price) >= 0
    }
    // Can add if we have a selected suggestion or typed text, and valid price
    const hasName = selectedSuggestion !== null || searchQuery.trim()
    return hasName && price && parseFloat(price) >= 0
  }

  return (
    <div className="space-y-4">
      {!useCustom ? (
        <>
          <div className="relative" ref={containerRef}>
            <Label htmlFor="addon_search">
              Search Add-on <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addon_search"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Type to search (e.g., 'vinyl plank' or 'demolition')"
              autoComplete="off"
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={`${suggestion.option.id}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0 ${
                      selectedSuggestion?.option.id === suggestion.option.id
                        ? 'bg-primary/10 border-primary'
                        : ''
                    }`}
                  >
                    <div className="font-medium">{suggestion.fullName}</div>
                    {suggestion.path.length > 1 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {suggestion.path.slice(0, -1).map((p) => p.name).join(' > ')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && debouncedQuery.trim() && filteredSuggestions.length === 0 && (
              <div className="absolute z-50 w-full mt-1 border rounded-md bg-white shadow-lg p-4 text-sm text-muted-foreground">
                No matching add-ons found. You can create a custom add-on below.
              </div>
            )}
          </div>

          {selectedSuggestion && (
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm font-medium">Selected:</div>
              <div className="text-sm text-muted-foreground">{selectedSuggestion.fullName}</div>
            </div>
          )}

          <div className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUseCustom(true)
                setSearchQuery('')
                setSelectedSuggestion(null)
                setShowSuggestions(false)
              }}
              className="w-full"
            >
              Create Custom Add-on
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="custom_name">
              Add-on Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="custom_name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Custom Installation"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setUseCustom(false)
              setCustomName('')
            }}
          >
            ← Back to Search
          </Button>
        </div>
      )}

      {(selectedSuggestion !== null || useCustom || searchQuery.trim()) && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label htmlFor="price">
              Price (USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd()}
              className="flex-1"
            >
              Add to Item
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/useDebounce'
import { addonOptions, type AddonOption } from '@/data/addons'
import type { Addon } from '@/types/quote-creation'
import { useTranslation } from '@/hooks/useTranslation'

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
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddonSuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [customName, setCustomName] = useState('')
  const [price, setPrice] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(searchQuery, 200)

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
      return [] // Don't show suggestions until user types
    }

    const query = debouncedQuery.toLowerCase()
    return allSuggestions
      .filter((suggestion) =>
        suggestion.fullName.toLowerCase().includes(query) ||
        suggestion.option.name.toLowerCase().includes(query) ||
        suggestion.path.some((p) => p.name.toLowerCase().includes(query))
      )
      .slice(0, 20) // Show up to 20 results with inline scrolling
  }, [debouncedQuery, allSuggestions])

  const handleSelectSuggestion = (suggestion: AddonSuggestion) => {
    setSelectedSuggestion(suggestion)
    setSearchQuery(suggestion.fullName)
    setShowSuggestions(false)
    setUseCustom(false)
    // Scroll to top of modal to show selected item and price input
    setTimeout(() => {
      const modal = document.querySelector('[role="dialog"]')
      if (modal) {
        modal.scrollTop = 0
      }
    }, 100)
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    // Only show suggestions when user types (not on focus)
    setShowSuggestions(value.trim().length > 0)
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

  // Auto-focus price input when suggestion is selected
  const priceInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (selectedSuggestion && priceInputRef.current) {
      setTimeout(() => priceInputRef.current?.focus(), 100)
    }
  }, [selectedSuggestion])

  return (
    <div className="space-y-3">
      {!useCustom ? (
        <>
          <div ref={containerRef}>
            <Label htmlFor="addon_search" className="text-sm font-semibold mb-1.5 block">
              Search Add-on <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addon_search"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`${t('quoteCreation.typeToSearch')} (e.g., 'vinyl plank' ${t('quoteCreation.or')} 'demolition')`}
              autoComplete="off"
              className="text-base"
            />
          </div>

          {/* Inline suggestions - better for mobile, no cutoff issues */}
          {showSuggestions && debouncedQuery.trim() && filteredSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                Suggestions ({filteredSuggestions.length})
              </div>
              <div className="rounded-lg bg-gray-50/50 ring-1 ring-inset ring-gray-200/30 overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={`${suggestion.option.id}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full text-left px-4 py-3 transition-all duration-150 min-h-[56px] flex flex-col justify-center ${
                        idx > 0 ? 'border-t border-gray-200/50' : ''
                      } ${
                        selectedSuggestion?.option.id === suggestion.option.id
                          ? 'bg-primary/10 active:bg-primary/15'
                          : 'bg-white active:bg-gray-50'
                      } focus:bg-primary/10 focus:outline-none touch-manipulation`}
                    >
                      <div className="font-medium text-gray-900 text-sm sm:text-base">{suggestion.fullName}</div>
                      {suggestion.path.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1 font-normal">
                          {suggestion.path.slice(0, -1).map((p) => p.name).join(' › ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showSuggestions && debouncedQuery.trim() && filteredSuggestions.length === 0 && (
            <div className="rounded-lg bg-gray-50/50 ring-1 ring-inset ring-gray-200/30 p-3 text-sm text-gray-600">
              <div className="mb-2">
                <span>No matching add-ons found.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUseCustom(true)
                  setSearchQuery('')
                  setSelectedSuggestion(null)
                  setShowSuggestions(false)
                }}
                className="text-primary hover:text-primary/80 font-medium text-sm underline touch-manipulation"
              >
                Create a custom add-on instead
              </button>
            </div>
          )}

          {selectedSuggestion && (
            <div className="p-3 bg-primary/5 rounded-lg ring-1 ring-inset ring-primary/20">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">Selected</div>
              <div className="text-sm font-medium text-gray-900">{selectedSuggestion.fullName}</div>
            </div>
          )}

          {!showSuggestions && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUseCustom(true)
                setSearchQuery('')
                setSelectedSuggestion(null)
                setShowSuggestions(false)
              }}
              className="w-full font-medium touch-manipulation"
            >
              + Create Custom Add-on
            </Button>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="custom_name" className="text-sm font-semibold mb-2 block">
              Add-on Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="custom_name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Custom Installation"
              className="text-base"
              autoFocus
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setUseCustom(false)
              setCustomName('')
            }}
            className="text-sm"
          >
            ← Back to Search
          </Button>
        </div>
      )}

      {(selectedSuggestion !== null || useCustom || searchQuery.trim()) && (
        <div className="space-y-3 pt-4 border-t border-gray-200/50">
          <div>
            <Label htmlFor="price" className="text-sm font-semibold mb-2 block">
              Price (USD) <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={priceInputRef}
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="text-base"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd()}
              className="flex-1 font-semibold"
            >
              Add to Item
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

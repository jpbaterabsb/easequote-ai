import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, ArrowLeft, Grid3X3 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { Addon } from '@/types/quote-creation'
import type { SuggestedAddon, Subcategory } from '@/data/categories'
import { useTranslation } from '@/hooks/useTranslation'
import { TileSizeSelector } from './TileSizeSelector'
import { PackageOverviewScreen } from './PackageOverviewScreen'
import {
  findTileSizeById,
  calculateClipsNeeded,
  calculateSpacersNeeded,
  calculateTilePiecesNeeded,
  calculateFlooringBoxesNeeded,
  materialCoverage,
} from '@/data/tile-sizes'

type ScreenState = 'overview' | 'tile-selector' | 'main'

interface SubcategoryAddonsPopupProps {
  open: boolean
  subcategory: Subcategory | null
  area: number
  pricePerSqft: number
  onSelect: (addons: Addon[]) => void
  onCancel: () => void
  onBasePriceSuggestion?: (basePrice: number) => void
}

export function SubcategoryAddonsPopup({
  open,
  subcategory,
  area,
  pricePerSqft,
  onSelect,
  onCancel,
  onBasePriceSuggestion,
}: SubcategoryAddonsPopupProps) {
  const { t } = useTranslation()
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('overview')
  const [selectedAddons, setSelectedAddons] = useState<Map<string, SuggestedAddon & { price: number; quantity?: number; customBasePrice?: number; editMode?: 'base' | 'total' }>>(new Map())
  const [inputValues, setInputValues] = useState<Map<string, string>>(new Map())
  const [selectedTileSizeId, setSelectedTileSizeId] = useState<string | null>(null)
  const [includedMaterials, setIncludedMaterials] = useState<Addon[]>([])
  const [tileAddon, setTileAddon] = useState<Addon | null>(null)

  // Helper function: sempre usa o valor máximo do range quando disponível para cálculos
  const getMaxPrice = (addon: SuggestedAddon): number => {
    return addon.priceRange.max ?? addon.defaultPrice ?? addon.priceRange.min
  }

  // Initialize state when popup opens
  useEffect(() => {
    if (subcategory && open) {
      // Reset all state
      setSelectedAddons(new Map())
      setInputValues(new Map())
      setSelectedTileSizeId(null)
      setTileAddon(null)
      
      // Determine starting screen based on subcategory type
      if (subcategory.requiresTileSize && subcategory.includedItems && subcategory.includedItems.length > 0) {
        setCurrentScreen('overview')
        // Initialize included materials from subcategory
        const materials = subcategory.includedItems
          .filter((item) => item.type === 'material')
          .map((item) => ({
            id: `included_${item.id}_${crypto.randomUUID()}`,
            name: item.name,
            price: 0, // Included items don't have a separate price
            addonType: 'material' as const,
            quantity: undefined, // Will be shown as "Included"
          }))
        setIncludedMaterials(materials)
      } else {
        setCurrentScreen('main')
        setIncludedMaterials([])
      }
      
      // Apply basePrice from subcategory to price_per_sqft
      if (subcategory.basePrice !== undefined && onBasePriceSuggestion) {
        onBasePriceSuggestion(subcategory.basePrice)
      } else {
        // Fallback: look for base_price in addons
        const basePriceAddon = subcategory.suggestedAddons.find(addon => addon.id === 'base_price' || addon.id === 'installation' || addon.id === 'install')
        if (basePriceAddon && onBasePriceSuggestion) {
          const basePriceValue = getMaxPrice(basePriceAddon)
          onBasePriceSuggestion(basePriceValue)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategory, open])

  // Handle tile size selection - only calculate tile pieces
  useEffect(() => {
    if (!selectedTileSizeId || !subcategory || area <= 0) {
      setTileAddon(null)
      return
    }

    const tileSize = findTileSizeById(selectedTileSizeId)
    if (!tileSize) {
      setTileAddon(null)
      return
    }

    const tilesNeeded = calculateTilePiecesNeeded(selectedTileSizeId, area)
    if (tilesNeeded > 0) {
      setTileAddon({
        id: `tiles_${tileSize.id}_${crypto.randomUUID()}`,
        name: `${tileSize.name} Tiles (${tilesNeeded} ${tilesNeeded === 1 ? 'piece' : 'pieces'})`,
        price: 0,
        addonType: 'material',
        quantity: tilesNeeded,
        unit: 'piece',
        priceType: 'unit',
      })
    }
  }, [selectedTileSizeId, subcategory, area])

  // Calculate materials for non-requiresTileSize subcategories only
  const [calculatedMaterials, setCalculatedMaterials] = useState<Addon[]>([])
  
  useEffect(() => {
    if (!subcategory || area <= 0 || subcategory.requiresTileSize) {
      setCalculatedMaterials([])
      return
    }

    const materials: Addon[] = []

    // Calculate materials for flooring subcategories (Vinyl Plank, Laminate)
    if (subcategory.id === 'vinyl_plank' || subcategory.id === 'laminate' || subcategory.id === 'vinyl_glue_down') {
      const flooringType = subcategory.id === 'laminate' ? 'laminate' : 'vinyl'
      const boxesNeeded = calculateFlooringBoxesNeeded(flooringType, area)
      if (boxesNeeded > 0) {
        materials.push({
          id: `flooring_${flooringType}_${crypto.randomUUID()}`,
          name: `${subcategory.name} (${boxesNeeded} ${boxesNeeded === 1 ? 'box' : 'boxes'})`,
          price: 0,
          addonType: 'material',
          quantity: boxesNeeded,
          unit: 'box',
          priceType: 'unit',
        })
      }

      // Underlayment
      const underlaymentAddon = subcategory.suggestedAddons.find(a => a.id === 'underlayment')
      if (underlaymentAddon) {
        const sqftNeeded = materialCoverage.underlayment.formula(area)
        materials.push({
          id: `underlayment_${crypto.randomUUID()}`,
          name: `Underlayment (${sqftNeeded} sqft)`,
          price: 0,
          addonType: 'material',
          quantity: sqftNeeded,
          unit: 'sqft',
          priceType: 'sqft',
        })
      }

      // Estimate perimeter for quarter round
      const perimeter = Math.ceil(4 * Math.sqrt(area))
      const quarterRoundAddon = subcategory.suggestedAddons.find(a => a.id === 'quarter_round')
      if (quarterRoundAddon) {
        const linearFt = materialCoverage.quarterRound.formula(perimeter)
        materials.push({
          id: `quarter_round_${crypto.randomUUID()}`,
          name: `Quarter Round (${linearFt} ft)`,
          price: 0,
          addonType: 'material',
          quantity: linearFt,
          unit: 'ft',
          priceType: 'ft',
        })
      }
    }

    // Calculate materials for painting subcategories
    if (subcategory.id === 'interior_walls' || subcategory.id === 'ceilings') {
      const gallons = materialCoverage.paint.formula(area)
      materials.push({
        id: `paint_${crypto.randomUUID()}`,
        name: `Paint (${gallons} ${gallons === 1 ? 'gallon' : 'gallons'})`,
        price: 0,
        addonType: 'material',
        quantity: gallons,
        unit: 'gallon',
        priceType: 'unit',
      })

      const primerGallons = materialCoverage.primer.formula(area)
      materials.push({
        id: `primer_${crypto.randomUUID()}`,
        name: `Primer (${primerGallons} ${primerGallons === 1 ? 'gallon' : 'gallons'})`,
        price: 0,
        addonType: 'material',
        quantity: primerGallons,
        unit: 'gallon',
        priceType: 'unit',
      })
    }

    // Calculate materials for drywall subcategories
    if (subcategory.id === 'installation' || subcategory.id === 'patches') {
      const bags = materialCoverage.drywallMud.formula(area)
      materials.push({
        id: `drywall_mud_${crypto.randomUUID()}`,
        name: `Drywall Mud (${bags} ${bags === 1 ? 'bag' : 'bags'})`,
        price: 0,
        addonType: 'material',
        quantity: bags,
        unit: 'bag',
        priceType: 'unit',
      })

      const perimeter = Math.ceil(4 * Math.sqrt(area))
      const rolls = materialCoverage.drywallTape.formula(perimeter)
      if (rolls > 0) {
        materials.push({
          id: `drywall_tape_${crypto.randomUUID()}`,
          name: `Drywall Tape (${rolls} ${rolls === 1 ? 'roll' : 'rolls'})`,
          price: 0,
          addonType: 'material',
          quantity: rolls,
          unit: 'roll',
          priceType: 'unit',
        })
      }
    }

    // Calculate materials for exterior subcategories
    if (subcategory.id === 'concrete_repair') {
      const sealerAddon = subcategory.suggestedAddons.find(a => a.id === 'sealer')
      if (sealerAddon) {
        const gallons = materialCoverage.concreteSealer.formula(area)
        materials.push({
          id: `concrete_sealer_${crypto.randomUUID()}`,
          name: `Concrete Sealer (${gallons} ${gallons === 1 ? 'gallon' : 'gallons'})`,
          price: 0,
          addonType: 'material',
          quantity: gallons,
          unit: 'gallon',
          priceType: 'unit',
        })
      }
    }

    // Calculate materials for bathroom subcategories (non-tile)
    if (subcategory.id === 'toilet') {
      const waxRingAddon = subcategory.suggestedAddons.find(a => a.id === 'install' || a.id === 'replace')
      if (waxRingAddon) {
        materials.push({
          id: `wax_ring_${crypto.randomUUID()}`,
          name: `Wax Ring (1 ring)`,
          price: 0,
          addonType: 'material',
          quantity: 1,
          unit: 'ring',
          priceType: 'unit',
        })
      }
    }

    setCalculatedMaterials(materials)
  }, [subcategory, area])

  // Update prices when area or pricePerSqft changes
  useEffect(() => {
    if (selectedAddons.size > 0 && area > 0) {
      const updatedAddons = new Map(selectedAddons)
      let hasChanges = false
      
      updatedAddons.forEach((addon, id) => {
        if (addon.editMode === 'total') {
          return
        }
        
        const baseValue = addon.customBasePrice !== undefined ? addon.customBasePrice : getMaxPrice(addon)
        
        if (addon.priceType === 'sqft') {
          const newPrice = baseValue * area
          updatedAddons.set(id, { ...addon, price: newPrice })
          hasChanges = true
        } else if (addon.priceType === 'percent' && pricePerSqft > 0) {
          const newPrice = (area * pricePerSqft * baseValue) / 100
          updatedAddons.set(id, { ...addon, price: newPrice })
          hasChanges = true
        }
      })
      
      if (hasChanges) {
        setSelectedAddons(updatedAddons)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, pricePerSqft])

  const handleToggleAddon = (addon: SuggestedAddon, checked: boolean) => {
    const newSelected = new Map(selectedAddons)
    
    if (checked) {
      let initialPrice = getMaxPrice(addon)
      let quantity = 1
      
      if (addon.priceType === 'sqft' && area > 0) {
        initialPrice = initialPrice * area
      } else if (addon.priceType === 'percent' && area > 0 && pricePerSqft > 0) {
        initialPrice = (area * pricePerSqft * initialPrice) / 100
      } else if (addon.priceType === 'unit' || addon.priceType === 'ft' || addon.priceType === 'step') {
        quantity = 1
        initialPrice = initialPrice * quantity
      }
      
      newSelected.set(addon.id, {
        ...addon,
        price: initialPrice,
        quantity: (addon.priceType === 'unit' || addon.priceType === 'ft' || addon.priceType === 'step') ? quantity : undefined,
        editMode: (addon.priceType === 'sqft' || addon.priceType === 'percent') ? 'base' : undefined,
      })
    } else {
      newSelected.delete(addon.id)
    }
    
    setSelectedAddons(newSelected)
  }

  const handlePriceChange = (addonId: string, price: number, editMode: 'base' | 'total') => {
    const newSelected = new Map(selectedAddons)
    const addon = newSelected.get(addonId)
    if (addon) {
      if (editMode === 'total') {
        newSelected.set(addonId, { ...addon, price, editMode: 'total' })
      } else {
        let newPrice = price
        if (addon.priceType === 'sqft' && area > 0) {
          newPrice = price * area
        } else if (addon.priceType === 'percent' && area > 0 && pricePerSqft > 0) {
          newPrice = (area * pricePerSqft * price) / 100
        }
        newSelected.set(addonId, { ...addon, price: newPrice, customBasePrice: price, editMode: 'base' })
      }
      setSelectedAddons(newSelected)
    }
  }

  const handleQuantityChange = (addonId: string, quantity: number) => {
    const newSelected = new Map(selectedAddons)
    const addon = newSelected.get(addonId)
    if (addon && (addon.priceType === 'unit' || addon.priceType === 'ft' || addon.priceType === 'step')) {
      const basePricePerUnit = getMaxPrice(addon)
      const newPrice = basePricePerUnit * quantity
      newSelected.set(addonId, { ...addon, quantity, price: newPrice })
      setSelectedAddons(newSelected)
      setInputValues((prev) => {
        const newMap = new Map(prev)
        newMap.delete(`quantity-${addonId}`)
        return newMap
      })
    }
  }

  const handleRemoveIncludedMaterial = (materialId: string) => {
    setIncludedMaterials((prev) => prev.filter((m) => m.id !== materialId))
  }

  const handleRemoveCalculatedMaterial = (materialId: string) => {
    setCalculatedMaterials((prev) => prev.filter((m) => m.id !== materialId))
  }

  const handleRemoveTile = () => {
    setSelectedTileSizeId(null)
    setTileAddon(null)
  }

  const handleApply = () => {
    // Convert selected addons to Addon format
    const addons: Addon[] = Array.from(selectedAddons.values()).map((addon) => ({
      id: crypto.randomUUID(),
      name: addon.name,
      price: addon.price,
      addonType: addon.addonType,
      priceType: addon.priceType,
      basePrice: addon.customBasePrice !== undefined ? addon.customBasePrice : getMaxPrice(addon),
      quantity: addon.quantity,
    }))
    
    // Include tile if selected
    const tileAddons = tileAddon ? [tileAddon] : []
    
    // Include included materials (for requiresTileSize subcategories)
    // Include calculated materials (for non-requiresTileSize subcategories)
    const allAddons = [...addons, ...tileAddons, ...includedMaterials, ...calculatedMaterials]
    
    onSelect(allAddons)
    setSelectedAddons(new Map())
    setSelectedTileSizeId(null)
    setTileAddon(null)
    setIncludedMaterials([])
    setCalculatedMaterials([])
  }

  const handleSelectTileSize = () => {
    setCurrentScreen('tile-selector')
  }

  const handleContinueWithoutTile = () => {
    setCurrentScreen('main')
  }

  const handleTileSizeSelected = (tileSizeId: string) => {
    setSelectedTileSizeId(tileSizeId)
    setCurrentScreen('main')
  }

  const handleBackToOverview = () => {
    setCurrentScreen('overview')
    setSelectedTileSizeId(null)
    setTileAddon(null)
  }

  if (!subcategory) return null

  // Filter addons for display (remove base_price, installation, install when they're base prices)
  const displayAddons = subcategory.suggestedAddons.filter((addon) => {
    if (addon.id === 'base_price') return false
    if ((addon.id === 'installation' || addon.id === 'install') && addon.priceType === 'sqft') return false
    if (addon.priceType === 'sqft' && (
      addon.name.toLowerCase().includes('base price') ||
      addon.name.toLowerCase().includes('installation') ||
      (addon.name.toLowerCase().includes('install') && addon.name.toLowerCase().includes('tile'))
    )) {
      return subcategory.basePrice !== undefined
    }
    return true
  })
  
  // For requiresTileSize subcategories, also filter out materials that are in includedItems
  const includedItemIds = new Set((subcategory.includedItems || []).map(item => item.id.toLowerCase()))
  const filteredAddons = subcategory.requiresTileSize
    ? displayAddons.filter(addon => {
        const addonNameLower = addon.name.toLowerCase()
        // Filter out addons that match included items
        if (includedItemIds.has(addon.id.toLowerCase())) return false
        if (addonNameLower.includes('thinset') && includedItemIds.has('thinset')) return false
        if (addonNameLower.includes('grout') && includedItemIds.has('grout')) return false
        if (addonNameLower.includes('clip') && includedItemIds.has('leveling_clips')) return false
        if (addonNameLower.includes('spacer') && includedItemIds.has('spacers')) return false
        if (addonNameLower.includes('silicone') && includedItemIds.has('silicone')) return false
        if (addonNameLower.includes('waterproof') && (includedItemIds.has('waterproof_membrane') || includedItemIds.has('waterproofing'))) return false
        if (addonNameLower.includes('cement board') && includedItemIds.has('cement_board')) return false
        return true
      })
    : displayAddons

  // Organize addons by type
  const addonsByType = {
    service: filteredAddons.filter((addon) => addon.addonType === 'service'),
    material: filteredAddons.filter((addon) => addon.addonType === 'material'),
    complexity: filteredAddons.filter((addon) => addon.addonType === 'complexity'),
    general: filteredAddons.filter((addon) => addon.addonType === 'general'),
  }
  
  const hasSelectedAddons = selectedAddons.size > 0
  const selectedAddonsPrice = Array.from(selectedAddons.values()).reduce((sum, addon) => sum + addon.price, 0)
  const totalPrice = selectedAddonsPrice

  // Render addon section helper
  const renderAddonSection = (title: string, addons: typeof displayAddons, _type: 'service' | 'material' | 'complexity' | 'general') => {
    if (addons.length === 0) return null
    
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
          {title}
        </h3>
        {addons.map((addon) => {
          const isSelected = selectedAddons.has(addon.id)
          const selectedAddon = selectedAddons.get(addon.id)
          const baseValue = isSelected && selectedAddon?.customBasePrice !== undefined
            ? selectedAddon.customBasePrice
            : getMaxPrice(addon)

          return (
            <div
              key={addon.id}
              className={`p-4 border rounded-lg transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={addon.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleToggleAddon(addon, checked === true)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor={addon.id} className="text-sm font-medium cursor-pointer">
                    {addon.name}
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    {addon.priceType === 'sqft' ? (
                      <>
                        {formatCurrency(addon.priceRange.min)}
                        {addon.priceRange.max ? ` - ${formatCurrency(addon.priceRange.max)}` : ''} / sqft
                        {area > 0 && (
                          <span className="ml-2">
                            ({t('quoteCreation.total')}: {formatCurrency(baseValue * area)})
                          </span>
                        )}
                      </>
                    ) : addon.priceType === 'ft' ? (
                      <>
                        {formatCurrency(addon.priceRange.min)}
                        {addon.priceRange.max ? ` - ${formatCurrency(addon.priceRange.max)}` : ''} / ft
                      </>
                    ) : addon.priceType === 'step' ? (
                      <>
                        {formatCurrency(addon.priceRange.min)}
                        {addon.priceRange.max ? ` - ${formatCurrency(addon.priceRange.max)}` : ''} / {t('quoteCreation.step')}
                      </>
                    ) : addon.priceType === 'percent' ? (
                      <>
                        {addon.priceRange.min}%
                        {addon.priceRange.max ? ` - ${addon.priceRange.max}%` : ''} {t('quoteCreation.ofArea')}
                        {area > 0 && pricePerSqft > 0 && (
                          <span className="ml-2">
                            ({t('quoteCreation.total')}: {formatCurrency(
                              (area * pricePerSqft * (isSelected && selectedAddon?.customBasePrice !== undefined
                                ? selectedAddon.customBasePrice
                                : getMaxPrice(addon))) / 100
                            )})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {formatCurrency(addon.priceRange.min)}
                        {addon.priceRange.max ? ` - ${formatCurrency(addon.priceRange.max)}` : ''} / {t('quoteCreation.unit')}
                      </>
                    )}
                  </div>
                  {isSelected && (
                    <div className="pt-2 space-y-2">
                      {(addon.priceType === 'unit' || addon.priceType === 'ft' || addon.priceType === 'step') && (
                        <div>
                          <Label htmlFor={`quantity-${addon.id}`} className="text-xs">
                            {addon.priceType === 'unit' 
                              ? t('quoteCreation.quantityUnits')
                              : addon.priceType === 'ft' 
                              ? t('quoteCreation.quantityFt') 
                              : t('quoteCreation.quantitySteps')}:
                          </Label>
                          <Input
                            id={`quantity-${addon.id}`}
                            type="text"
                            inputMode="numeric"
                            value={inputValues.get(`quantity-${addon.id}`) ?? String(selectedAddon?.quantity || 1)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '')
                              setInputValues((prev) => {
                                const newMap = new Map(prev)
                                newMap.set(`quantity-${addon.id}`, value)
                                return newMap
                              })
                              const quantity = parseInt(value) || 1
                              handleQuantityChange(addon.id, quantity)
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 1
                              handleQuantityChange(addon.id, Math.max(1, value))
                            }}
                            className="mt-1 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                          />
                        </div>
                      )}
                      
                      {(addon.priceType === 'sqft' || addon.priceType === 'percent') && (
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newSelected = new Map(selectedAddons)
                              const currentAddon = newSelected.get(addon.id)
                              if (currentAddon) {
                                newSelected.set(addon.id, { ...currentAddon, editMode: 'base' })
                                setSelectedAddons(newSelected)
                              }
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              selectedAddon?.editMode !== 'total'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {addon.priceType === 'sqft' 
                              ? t('quoteCreation.editPerSqft') || 'Edit per sqft'
                              : t('quoteCreation.editPercent') || 'Edit %'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newSelected = new Map(selectedAddons)
                              const currentAddon = newSelected.get(addon.id)
                              if (currentAddon) {
                                newSelected.set(addon.id, { ...currentAddon, editMode: 'total' })
                                setSelectedAddons(newSelected)
                              }
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              selectedAddon?.editMode === 'total'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {t('quoteCreation.editTotal') || 'Edit total'}
                          </button>
                        </div>
                      )}
                      
                      <div>
                        {selectedAddon?.editMode === 'total' && (addon.priceType === 'sqft' || addon.priceType === 'percent') ? (
                          <>
                            <Label htmlFor={`price-total-${addon.id}`} className="text-xs">
                              {t('quoteCreation.totalPrice')} ({t('quoteCreation.usd')}):
                            </Label>
                            <Input
                              id={`price-total-${addon.id}`}
                              type="text"
                              inputMode="decimal"
                              value={inputValues.get(`price-total-${addon.id}`) ?? (selectedAddon?.price.toFixed(2) || '0.00')}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '')
                                setInputValues((prev) => {
                                  const newMap = new Map(prev)
                                  newMap.set(`price-total-${addon.id}`, value)
                                  return newMap
                                })
                                const newPrice = parseFloat(value) || 0
                                handlePriceChange(addon.id, newPrice, 'total')
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handlePriceChange(addon.id, value, 'total')
                              }}
                              className="mt-1 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('quoteCreation.manualTotal') || 'Manual total value'}
                            </p>
                          </>
                        ) : (addon.priceType === 'sqft' || addon.priceType === 'percent') ? (
                          <>
                            <Label htmlFor={`price-base-${addon.id}`} className="text-xs">
                              {addon.priceType === 'sqft' 
                                ? `${t('quoteCreation.pricePerSqft')} (${t('quoteCreation.usd')}):`
                                : `${t('quoteCreation.percent')} (%):`}
                            </Label>
                            <Input
                              id={`price-base-${addon.id}`}
                              type="text"
                              inputMode="decimal"
                              value={inputValues.get(`price-base-${addon.id}`) ?? (
                                selectedAddon?.customBasePrice !== undefined
                                  ? selectedAddon.customBasePrice
                                  : getMaxPrice(addon)
                              ).toFixed(addon.priceType === 'percent' ? 1 : 2)}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '')
                                setInputValues((prev) => {
                                  const newMap = new Map(prev)
                                  newMap.set(`price-base-${addon.id}`, value)
                                  return newMap
                                })
                                const newBaseValue = parseFloat(value) || 0
                                handlePriceChange(addon.id, newBaseValue, 'base')
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handlePriceChange(addon.id, value, 'base')
                              }}
                              className="mt-1 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {addon.priceType === 'sqft'
                                ? t('quoteCreation.priceAutoCalculated') || 'Price automatically calculated based on area'
                                : t('quoteCreation.percentAutoCalculated') || 'Price automatically calculated based on area and price per sqft'}
                            </p>
                          </>
                        ) : (
                          <>
                            <Label htmlFor={`price-${addon.id}`} className="text-xs">
                              {t('quoteCreation.price')} ({t('quoteCreation.usd')}):
                            </Label>
                            <Input
                              id={`price-${addon.id}`}
                              type="text"
                              inputMode="decimal"
                              value={inputValues.get(`price-${addon.id}`) ?? (selectedAddon?.price.toFixed(2) || '0.00')}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '')
                                setInputValues((prev) => {
                                  const newMap = new Map(prev)
                                  newMap.set(`price-${addon.id}`, value)
                                  return newMap
                                })
                                const newPrice = parseFloat(value) || 0
                                handlePriceChange(addon.id, newPrice, 'total')
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handlePriceChange(addon.id, value, 'total')
                              }}
                              className="mt-1 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render the appropriate screen
  const renderScreen = () => {
    if (currentScreen === 'overview') {
      return (
        <PackageOverviewScreen
          subcategory={subcategory}
          onSelectTileSize={handleSelectTileSize}
          onContinueWithoutTile={handleContinueWithoutTile}
        />
      )
    }

    if (currentScreen === 'tile-selector') {
      return (
        <div className="space-y-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back') || 'Back'}
          </Button>
          <TileSizeSelector
            selectedTileSizeId={selectedTileSizeId}
            onSelect={handleTileSizeSelected}
          />
        </div>
      )
    }

    // Main screen
    return (
      <div className="space-y-6">
        {/* Back button for requiresTileSize subcategories */}
        {subcategory.requiresTileSize && subcategory.includedItems && subcategory.includedItems.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back') || 'Back'}
          </Button>
        )}

        {/* Tile Selection - show option to select tile anytime */}
        {subcategory.requiresTileSize && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
              {t('quoteCreation.tile') || 'Tile'}
            </h3>
            {tileAddon ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{tileAddon.name}</div>
                    {tileAddon.quantity && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('quoteCreation.quantity')}: {tileAddon.quantity} {tileAddon.unit}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveTile}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                    title={t('common.remove') || 'Remove'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSelectTileSize}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-primary"
              >
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">{t('quoteCreation.selectTileSize') || 'Select Tile Size'}</span>
              </button>
            )}
          </div>
        )}

        {/* Included Materials (for requiresTileSize subcategories) */}
        {subcategory.requiresTileSize && includedMaterials.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
              {t('quoteCreation.includedMaterials') || 'Included Materials'}
            </h3>
            <div className="space-y-2">
              {includedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{material.name}</div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {t('quoteCreation.included') || 'Included in package'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveIncludedMaterial(material.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                      title={t('common.remove') || 'Remove'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculated Materials (for non-requiresTileSize subcategories) */}
        {!subcategory.requiresTileSize && calculatedMaterials.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
              {t('quoteCreation.calculatedMaterials') || 'Calculated Materials'}
            </h3>
            <div className="space-y-2">
              {calculatedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{material.name}</div>
                      {material.quantity && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('quoteCreation.quantity')}: {material.quantity} {material.unit}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCalculatedMaterial(material.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                      title={t('common.remove') || 'Remove'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons sections */}
        {filteredAddons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('quoteCreation.noSuggestedAddons')}
          </div>
        ) : (
          <>
            {renderAddonSection(t('quoteCreation.services') || 'Services', addonsByType.service, 'service')}
            {renderAddonSection(t('quoteCreation.materials') || 'Materials', addonsByType.material, 'material')}
            {renderAddonSection(t('quoteCreation.complexity') || 'Complexity', addonsByType.complexity, 'complexity')}
            {renderAddonSection(t('quoteCreation.general') || 'General', addonsByType.general, 'general')}
          </>
        )}

        {hasSelectedAddons && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('quoteCreation.total')}:</span>
              <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1"
          >
            {t('quoteCreation.applyAddons')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentScreen === 'overview' 
              ? subcategory.name
              : currentScreen === 'tile-selector'
              ? t('quoteCreation.selectTileSize') || 'Select Tile Size'
              : `${t('quoteCreation.suggestedAddons')} - ${subcategory.name}`}
          </DialogTitle>
          {currentScreen !== 'overview' && (
            <DialogDescription>
              {currentScreen === 'tile-selector'
                ? t('quoteCreation.selectTileSizeDescription') || 'Choose the tile size to calculate tiles needed'
                : t('quoteCreation.selectSuggestedAddons')}
            </DialogDescription>
          )}
        </DialogHeader>

        {renderScreen()}
      </DialogContent>
    </Dialog>
  )
}

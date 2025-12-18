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
import { X } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { Addon } from '@/types/quote-creation'
import type { SuggestedAddon, Subcategory } from '@/data/categories'
import { useTranslation } from '@/hooks/useTranslation'
import { TileSizeSelector } from './TileSizeSelector'
import {
  findTileSizeById,
  calculateClipsNeeded,
  calculateSpacersNeeded,
  calculateTilePiecesNeeded,
  calculateFlooringBoxesNeeded,
  materialCoverage,
} from '@/data/tile-sizes'

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
  const [selectedAddons, setSelectedAddons] = useState<Map<string, SuggestedAddon & { price: number; quantity?: number; customBasePrice?: number; editMode?: 'base' | 'total' }>>(new Map())
  const [inputValues, setInputValues] = useState<Map<string, string>>(new Map())
  const [selectedTileSizeId, setSelectedTileSizeId] = useState<string | null>(null)
  const [calculatedMaterials, setCalculatedMaterials] = useState<Addon[]>([])

  // Helper function: sempre usa o valor máximo do range quando disponível para cálculos
  const getMaxPrice = (addon: SuggestedAddon): number => {
    return addon.priceRange.max ?? addon.defaultPrice ?? addon.priceRange.min
  }

  useEffect(() => {
    if (subcategory && open) {
      // Reset selected addons when subcategory changes
      setSelectedAddons(new Map())
      setInputValues(new Map())
      setSelectedTileSizeId(null)
      setCalculatedMaterials([])
      
      // Aplicar basePrice da subcategoria ao price_per_sqft
      if (subcategory.basePrice !== undefined && onBasePriceSuggestion) {
        onBasePriceSuggestion(subcategory.basePrice)
      } else {
        // Fallback: procurar base_price nos addons (para compatibilidade)
        const basePriceAddon = subcategory.suggestedAddons.find(addon => addon.id === 'base_price' || addon.id === 'installation' || addon.id === 'install')
        if (basePriceAddon && onBasePriceSuggestion) {
          const basePriceValue = getMaxPrice(basePriceAddon)
          onBasePriceSuggestion(basePriceValue)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategory, open])

  // Calculate materials for all subcategories based on category and subcategory type
  useEffect(() => {
    if (!subcategory || area <= 0) {
      setCalculatedMaterials([])
      return
    }

    const materials: Addon[] = []
    // For tile-based subcategories (require tile size selection)
    if (subcategory.requiresTileSize) {
      if (!selectedTileSizeId) {
        setCalculatedMaterials([])
        return
      }

      const tileSize = findTileSizeById(selectedTileSizeId)
      if (!tileSize) {
        setCalculatedMaterials([])
        return
      }

      const tilesNeeded = calculateTilePiecesNeeded(selectedTileSizeId, area)
      if (tilesNeeded > 0) {
        materials.push({
          id: `tiles_${tileSize.id}_${crypto.randomUUID()}`,
          name: `${tileSize.name} Tiles (${tilesNeeded} ${tilesNeeded === 1 ? 'piece' : 'pieces'})`,
          price: 0,
          addonType: 'material',
          quantity: tilesNeeded,
          unit: 'piece',
          priceType: 'unit',
        })
      }

      // Calculate Thinset
      const thinsetAddon = subcategory.suggestedAddons.find(a => a.id === 'thinset')
      if (thinsetAddon) {
        const bags = materialCoverage.thinset.formula(area)
        materials.push({
          id: `thinset_${crypto.randomUUID()}`,
          name: `Thinset (${bags} ${bags === 1 ? 'bag' : 'bags'})`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: bags,
          unit: 'bag',
          priceType: 'unit',
        })
      }

      // Calculate Grout
      const groutAddon = subcategory.suggestedAddons.find(a => a.id === 'grout')
      if (groutAddon) {
        const bags = materialCoverage.grout.formula(area)
        materials.push({
          id: `grout_${crypto.randomUUID()}`,
          name: `Grout (${bags} ${bags === 1 ? 'bag' : 'bags'})`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: bags,
          unit: 'bag',
          priceType: 'unit',
        })
      }

      // Calculate Leveling Clips
      const clipsAddon = subcategory.suggestedAddons.find(a => a.id === 'leveling_clips')
      if (clipsAddon) {
        const clipsNeeded = calculateClipsNeeded(selectedTileSizeId, area)
        materials.push({
          id: `leveling_clips_${crypto.randomUUID()}`,
          name: `Leveling Clips (${clipsNeeded} clips)`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: clipsNeeded,
          unit: 'clips',
          priceType: 'unit',
        })
      }

      // Calculate Spacers
      const spacersAddon = subcategory.suggestedAddons.find(a => a.id === 'spacers')
      if (spacersAddon) {
        const spacersNeeded = calculateSpacersNeeded(selectedTileSizeId, area)
        materials.push({
          id: `spacers_${crypto.randomUUID()}`,
          name: `Spacers (${spacersNeeded} spacers)`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: spacersNeeded,
          unit: 'spacers',
          priceType: 'unit',
        })
      }

      // Calculate Silicone for backsplash (estimate perimeter as 2x sqrt of area for typical backsplash)
      if (subcategory.id === 'backsplash') {
        const perimeter = Math.ceil(2 * Math.sqrt(area) * 2) // Rough estimate: 2x width + 2x height
        const tubes = materialCoverage.silicone.formula(perimeter)
        materials.push({
          id: `silicone_${crypto.randomUUID()}`,
          name: `Silicone (${tubes} ${tubes === 1 ? 'tube' : 'tubes'})`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: tubes,
          unit: 'tube',
          priceType: 'unit',
        })
      }
    }

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
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: sqftNeeded,
          unit: 'sqft',
          priceType: 'sqft',
        })
      }

      // Estimate perimeter for quarter round (assume square room: 4 * sqrt(area))
      const perimeter = Math.ceil(4 * Math.sqrt(area))
      const quarterRoundAddon = subcategory.suggestedAddons.find(a => a.id === 'quarter_round')
      if (quarterRoundAddon) {
        const linearFt = materialCoverage.quarterRound.formula(perimeter)
        materials.push({
          id: `quarter_round_${crypto.randomUUID()}`,
          name: `Quarter Round (${linearFt} ft)`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: linearFt,
          unit: 'ft',
          priceType: 'ft',
        })
      }
    }

    // Calculate materials for painting subcategories
    if (subcategory.id === 'interior_walls' || subcategory.id === 'ceilings') {
      // Paint
      const gallons = materialCoverage.paint.formula(area)
      materials.push({
        id: `paint_${crypto.randomUUID()}`,
        name: `Paint (${gallons} ${gallons === 1 ? 'gallon' : 'gallons'})`,
        price: 0, // Materials don't have price, only quantity
        addonType: 'material',
        quantity: gallons,
        unit: 'gallon',
        priceType: 'unit',
      })

      // Primer (typically needed for new or repaired walls)
      const primerGallons = materialCoverage.primer.formula(area)
      materials.push({
        id: `primer_${crypto.randomUUID()}`,
        name: `Primer (${primerGallons} ${primerGallons === 1 ? 'gallon' : 'gallons'})`,
        price: 0, // Materials don't have price, only quantity
        addonType: 'material',
        quantity: primerGallons,
        unit: 'gallon',
        priceType: 'unit',
      })
    }

    // Calculate materials for drywall subcategories
    if (subcategory.id === 'installation' || subcategory.id === 'patches') {
      // Drywall mud
      const bags = materialCoverage.drywallMud.formula(area)
      materials.push({
        id: `drywall_mud_${crypto.randomUUID()}`,
        name: `Drywall Mud (${bags} ${bags === 1 ? 'bag' : 'bags'})`,
        price: 0, // Materials don't have price, only quantity
        addonType: 'material',
        quantity: bags,
        unit: 'bag',
        priceType: 'unit',
      })

      // Drywall tape (estimate perimeter)
      const perimeter = Math.ceil(4 * Math.sqrt(area))
      const rolls = materialCoverage.drywallTape.formula(perimeter)
      if (rolls > 0) {
        materials.push({
          id: `drywall_tape_${crypto.randomUUID()}`,
          name: `Drywall Tape (${rolls} ${rolls === 1 ? 'roll' : 'rolls'})`,
          price: 0, // Materials don't have price, only quantity
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
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: gallons,
          unit: 'gallon',
          priceType: 'unit',
        })
      }
    }

    // Calculate materials for bathroom subcategories
    if (subcategory.id === 'toilet') {
      const waxRingAddon = subcategory.suggestedAddons.find(a => a.id === 'install' || a.id === 'replace')
      if (waxRingAddon) {
        const rings = 1 // Typically 1 per toilet
        materials.push({
          id: `wax_ring_${crypto.randomUUID()}`,
          name: `Wax Ring (${rings} ring)`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: rings,
          unit: 'ring',
          priceType: 'unit',
        })
      }
    }

    // Calculate waterproofing for shower/bathroom subcategories
    if (subcategory.id === 'shower_full' || subcategory.id === 'shower_walls_only' || 
        subcategory.id === 'shower_floor_only' || subcategory.id === 'tub_surround') {
      const waterproofAddon = subcategory.suggestedAddons.find(a => a.id === 'waterproof' || a.id === 'waterproof_floor')
      if (waterproofAddon) {
        const units = materialCoverage.waterproof.formula(area)
        materials.push({
          id: `waterproof_${crypto.randomUUID()}`,
          name: `Waterproof Membrane (${units} ${units === 1 ? 'unit' : 'units'})`,
          price: 0, // Materials don't have price, only quantity
          addonType: 'material',
          quantity: units,
          unit: 'unit',
          priceType: 'unit',
        })
      }
    }

    setCalculatedMaterials(materials)
  }, [subcategory, selectedTileSizeId, area])

  // Update prices when area or pricePerSqft changes - recalcula sqft e percent
  // Percent calcula baseado em: area * pricePerSqft * (percentValue / 100)
  // Só recalcula se não estiver em modo de edição manual do total
  useEffect(() => {
    if (selectedAddons.size > 0 && area > 0) {
      const updatedAddons = new Map(selectedAddons)
      let hasChanges = false
      
      updatedAddons.forEach((addon, id) => {
        // Se está editando o total manualmente, não recalcula automaticamente
        if (addon.editMode === 'total') {
          return
        }
        
        // Usa customBasePrice se existir, senão usa o valor máximo do range
        const baseValue = addon.customBasePrice !== undefined ? addon.customBasePrice : getMaxPrice(addon)
        
        // Sempre recalcula sqft quando área muda
        if (addon.priceType === 'sqft') {
          const newPrice = baseValue * area
          updatedAddons.set(id, {
            ...addon,
            price: newPrice,
          })
          hasChanges = true
        } else if (addon.priceType === 'percent' && pricePerSqft > 0) {
          // Percent calcula: area * pricePerSqft * (percentValue / 100)
          const newPrice = (area * pricePerSqft * baseValue) / 100
          updatedAddons.set(id, {
            ...addon,
            price: newPrice,
          })
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
      // Calculate initial price based on type - sempre usa valor máximo do range
      let initialPrice = getMaxPrice(addon)
      let quantity = 1
      
      if (addon.priceType === 'sqft' && area > 0) {
        initialPrice = initialPrice * area
      } else if (addon.priceType === 'percent' && area > 0 && pricePerSqft > 0) {
        // Percent calcula: area * pricePerSqft * (percentValue / 100)
        initialPrice = (area * pricePerSqft * initialPrice) / 100
      } else if (addon.priceType === 'unit' || addon.priceType === 'ft' || addon.priceType === 'step') {
        // Para unit, ft, step - começa com quantidade 1 e multiplica
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
        // Editando o valor total - atualiza apenas o preço
        newSelected.set(addonId, {
          ...addon,
          price,
          editMode: 'total',
        })
      } else {
        // Editando o valor base (porcentagem ou preço por sqft)
        let newPrice = price
        
        // Calcular baseado no tipo
        if (addon.priceType === 'sqft' && area > 0) {
          newPrice = price * area
        } else if (addon.priceType === 'percent' && area > 0 && pricePerSqft > 0) {
          newPrice = (area * pricePerSqft * price) / 100
        }
        
        newSelected.set(addonId, {
          ...addon,
          price: newPrice,
          customBasePrice: price,
          editMode: 'base',
        })
      }
      setSelectedAddons(newSelected)
      // Limpar valor do input quando atualizado programaticamente (mas não quando usuário está digitando)
      // Não limpar aqui para manter reatividade durante digitação
    }
  }

  const handleQuantityChange = (addonId: string, quantity: number) => {
    const newSelected = new Map(selectedAddons)
    const addon = newSelected.get(addonId)
    if (addon && (addon.priceType === 'unit' || addon.priceType === 'ft' || addon.priceType === 'step')) {
      const basePricePerUnit = getMaxPrice(addon)
      const newPrice = basePricePerUnit * quantity
      newSelected.set(addonId, {
        ...addon,
        quantity,
        price: newPrice,
      })
      setSelectedAddons(newSelected)
      // Limpar valor do input quando atualizado programaticamente
      setInputValues((prev) => {
        const newMap = new Map(prev)
        newMap.delete(`quantity-${addonId}`)
        return newMap
      })
    }
  }

  const handleRemoveCalculatedMaterial = (materialId: string) => {
    setCalculatedMaterials((prev) => prev.filter((m) => m.id !== materialId))
  }

  const handleApply = () => {
    // Converter addons selecionados para formato Addon
    const addons: Addon[] = Array.from(selectedAddons.values()).map((addon) => ({
      id: crypto.randomUUID(),
      name: addon.name,
      price: addon.price,
      addonType: addon.addonType, // Incluir tipo do addon
      // Preservar metadados para recalcular quando área ou pricePerSqft mudar
      priceType: addon.priceType,
      basePrice: addon.customBasePrice !== undefined ? addon.customBasePrice : getMaxPrice(addon),
      quantity: addon.quantity,
    }))
    
    // Incluir materiais calculados automaticamente se houver tile size selecionado
    const allAddons = [...addons, ...calculatedMaterials]
    
    onSelect(allAddons)
    setSelectedAddons(new Map())
    setSelectedTileSizeId(null)
    setCalculatedMaterials([])
  }

  if (!subcategory) return null

  // Filtrar base_price, installation e install (quando priceType é sqft) da lista de addons exibidos
  // Esses são addons especiais que compartilham o estado com price_per_sqft
  const displayAddons = subcategory.suggestedAddons.filter((addon) => {
    // Remover base_price sempre
    if (addon.id === 'base_price') return false
    // Remover installation ou install quando priceType é sqft (são base prices)
    if ((addon.id === 'installation' || addon.id === 'install') && addon.priceType === 'sqft') return false
    // Remover addons que são base price por nome quando priceType é sqft
    if (addon.priceType === 'sqft' && (
      addon.name.toLowerCase().includes('base price') ||
      addon.name.toLowerCase().includes('installation') ||
      (addon.name.toLowerCase().includes('install') && addon.name.toLowerCase().includes('tile'))
    )) {
      // Mas só se não tiver basePrice definido na subcategoria
      return subcategory.basePrice !== undefined
    }
    return true
  })
  
  // Get base names of calculated materials to filter them out from selectable materials
  const calculatedMaterialBaseNames = new Set(
    calculatedMaterials.map(m => {
      // Extract base name (everything before the first parenthesis)
      const fullName = m.name || ''
      return fullName.split('(')[0].trim().toLowerCase()
    })
  )

  // Organizar addons por tipo, excluindo materiais que já foram calculados
  const addonsByType = {
    service: displayAddons.filter((addon) => addon.addonType === 'service'),
    material: displayAddons.filter((addon) => {
      if (addon.addonType !== 'material') return false
      // Check if this material is already calculated
      const addonBaseName = addon.name.toLowerCase()
      return !calculatedMaterialBaseNames.has(addonBaseName)
    }),
    complexity: displayAddons.filter((addon) => addon.addonType === 'complexity'),
    general: displayAddons.filter((addon) => addon.addonType === 'general'),
  }
  
  const hasSelectedAddons = selectedAddons.size > 0
  const selectedAddonsPrice = Array.from(selectedAddons.values()).reduce((sum, addon) => sum + addon.price, 0)
  // Materials don't have price, so total is only from selected addons
  const totalPrice = selectedAddonsPrice
  
  // Função para renderizar uma seção de addons
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
          
                // Calculate base value for display - usa valor máximo para cálculos
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
                  onCheckedChange={(checked) =>
                    handleToggleAddon(addon, checked === true)
                  }
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor={addon.id}
                    className="text-sm font-medium cursor-pointer"
                  >
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
                      
                      {/* Para sqft e percent: permitir editar base ou total */}
                      {(addon.priceType === 'sqft' || addon.priceType === 'percent') && (
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newSelected = new Map(selectedAddons)
                              const currentAddon = newSelected.get(addon.id)
                              if (currentAddon) {
                                newSelected.set(addon.id, {
                                  ...currentAddon,
                                  editMode: 'base',
                                })
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
                                newSelected.set(addon.id, {
                                  ...currentAddon,
                                  editMode: 'total',
                                })
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('quoteCreation.suggestedAddons')} - {subcategory.name}
          </DialogTitle>
          <DialogDescription>
            {t('quoteCreation.selectSuggestedAddons')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mostrar seleção de tile size primeiro se necessário */}
          {subcategory.requiresTileSize && !selectedTileSizeId && (
            <TileSizeSelector
              selectedTileSizeId={selectedTileSizeId}
              onSelect={setSelectedTileSizeId}
            />
          )}

          {/* Mostrar materiais calculados para todos os tipos de subcategorias */}
          {calculatedMaterials.length > 0 && (
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

          {/* Mostrar addons apenas se tile size estiver selecionado (quando necessário) ou se não requer tile size */}
          {(!subcategory.requiresTileSize || selectedTileSizeId) && (
            <>
              {displayAddons.length === 0 ? (
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
              disabled={!hasSelectedAddons && calculatedMaterials.length === 0 && (!subcategory.requiresTileSize || !selectedTileSizeId)}
              className="flex-1"
            >
              {t('quoteCreation.applyAddons')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


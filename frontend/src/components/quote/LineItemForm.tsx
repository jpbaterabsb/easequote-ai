import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { X } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { QuoteItem, Addon } from '@/types/quote-creation'
import { CategorySelector } from './CategorySelector'
import { SubcategorySelector } from './SubcategorySelector'
import { SubcategoryAddonsPopup } from './SubcategoryAddonsPopup'
import { SimpleAddonForm } from './SimpleAddonForm'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { findCategoryById, findSubcategoryById } from '@/data/categories'
import { useTranslation } from '@/hooks/useTranslation'

const getLineItemSchema = (t: (key: string) => string) => z.object({
  item_name: z.string().min(1, t('quoteCreation.itemNameRequired')),
  area: z.number().min(0.01, t('quoteCreation.areaRequired')),
  price_per_sqft: z.number().min(0, t('quoteCreation.priceRequired')),
})

type LineItemFormData = z.infer<ReturnType<typeof getLineItemSchema>>

interface LineItemFormProps {
  item?: QuoteItem
  onSave: (item: QuoteItem) => void
  onCancel: () => void
}

export function LineItemForm({ item, onSave, onCancel }: LineItemFormProps) {
  const { t } = useTranslation()
  const [inputMode, setInputMode] = useState<'area' | 'dimensions'>('area')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [addons, setAddons] = useState<Addon[]>(item?.addons || [])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('')
  const [showSubcategoryAddons, setShowSubcategoryAddons] = useState(false)
  const [showSimpleAddonForm, setShowSimpleAddonForm] = useState(false)
  const [showCategoryChangeDialog, setShowCategoryChangeDialog] = useState(false)
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LineItemFormData>({
    resolver: zodResolver(getLineItemSchema(t)),
    defaultValues: {
      item_name: item?.item_name || '',
      area: item?.area || 0,
      price_per_sqft: item?.price_per_sqft || 0,
    },
  })

  const area = watch('area')
  const pricePerSqft = watch('price_per_sqft')

  // Initialize category and subcategory when editing an existing item
  useEffect(() => {
    if (item?.category_id && item?.subcategory_id) {
      setSelectedCategoryId(item.category_id)
      setSelectedSubcategoryId(item.subcategory_id)
    }
  }, [item])

  useEffect(() => {
    if (inputMode === 'dimensions' && length && width) {
      const l = parseFloat(length)
      const w = parseFloat(width)
      if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
        const calculatedArea = l * w
        setValue('area', calculatedArea, { shouldValidate: true })
      }
    }
  }, [length, width, inputMode, setValue])

  // Função para recalcular o preço de um addon baseado no tipo
  const recalculateAddonPrice = (addon: Addon): number => {
    if (!addon.priceType || addon.basePrice === undefined) {
      // Se não tem priceType ou basePrice, mantém o preço atual
      return addon.price
    }

    switch (addon.priceType) {
      case 'sqft':
        // Preço por sqft: basePrice * area
        if (area <= 0) return addon.price
        return addon.basePrice * area
      
      case 'percent':
        // Percentual: (area * pricePerSqft * basePrice) / 100
        if (area <= 0 || pricePerSqft <= 0) return addon.price
        return (area * pricePerSqft * addon.basePrice) / 100
      
      case 'unit':
      case 'ft':
      case 'step':
        // Unit, ft, step: basePrice * quantity
        // Para materiais, a quantidade pode mudar com a área, mas como não temos
        // acesso às fórmulas aqui, mantemos a quantidade atual e recalculamos o preço
        return addon.basePrice * (addon.quantity || 1)
      
      default:
        return addon.price
    }
  }

  // Recalcular addons quando area ou pricePerSqft mudarem
  useEffect(() => {
    if (addons.length === 0) return

    const recalculatedAddons = addons.map((addon) => {
      // Materiais sempre devem ser recalculados (100% reativo)
      if (addon.addonType === 'material') {
        const newPrice = recalculateAddonPrice(addon)
        return { ...addon, price: newPrice }
      }
      
      // Addons com priceType sqft ou percent devem ser recalculados quando área ou preço mudar
      if (addon.priceType === 'sqft' || addon.priceType === 'percent') {
        const newPrice = recalculateAddonPrice(addon)
        return { ...addon, price: newPrice }
      }
      
      // Para outros tipos com priceType definido, recalcular também
      if (addon.priceType && addon.basePrice !== undefined) {
        const newPrice = recalculateAddonPrice(addon)
        return { ...addon, price: newPrice }
      }
      
      return addon
    })

    // Só atualizar se houver mudanças
    const hasChanges = recalculatedAddons.some((newAddon, index) => 
      newAddon.price !== addons[index].price
    )

    if (hasChanges) {
      setAddons(recalculatedAddons)
    }
  }, [area, pricePerSqft]) // eslint-disable-line react-hooks/exhaustive-deps

  const materialAddons = addons.filter((addon) => addon.addonType === 'material')
  const serviceAddons = addons.filter((addon) => addon.addonType !== 'material')

  // Exclude materials from addon total - materials don't affect price
  const addonTotal = serviceAddons.reduce((sum, addon) => sum + addon.price, 0)
  const lineTotal = area * pricePerSqft + addonTotal

  const onSubmit = (data: LineItemFormData) => {
    const newItem: QuoteItem = {
      id: item?.id || crypto.randomUUID(),
      item_name: data.item_name,
      area: data.area,
      price_per_sqft: data.price_per_sqft,
      line_total: lineTotal,
      addons,
      category_id: selectedCategoryId || undefined,
      subcategory_id: selectedSubcategoryId || undefined,
    }
    onSave(newItem)
  }

  // Helper function to extract base name (for materials with quantities like "Thinset (2 bags)")
  const getBaseName = (name: string): string => {
    // Extract base name (everything before the first parenthesis)
    return name.split('(')[0].trim().toLowerCase()
  }

  // Helper function to check if two addons are duplicates
  const isDuplicate = (existing: Addon, newAddon: Addon): boolean => {
    // For materials, compare base names (before parenthesis) since quantity may change
    if (existing.addonType === 'material' && newAddon.addonType === 'material') {
      return getBaseName(existing.name) === getBaseName(newAddon.name)
    }
    // For other addons, compare full names (case-insensitive)
    return existing.name.toLowerCase() === newAddon.name.toLowerCase()
  }

  const handleAddAddons = (newAddons: Addon[]) => {
    // Remove duplicates: if an addon with the same name exists, remove it first
    const updatedAddons = [...addons]
    
    newAddons.forEach((newAddon) => {
      // Find and remove existing duplicate addon
      const existingIndex = updatedAddons.findIndex(
        (existing) => isDuplicate(existing, newAddon)
      )
      
      if (existingIndex !== -1) {
        // Remove the old addon
        updatedAddons.splice(existingIndex, 1)
      }
      
      // Add the new addon
      updatedAddons.push(newAddon)
    })
    
    setAddons(updatedAddons)
    setShowSubcategoryAddons(false)
    setShowSimpleAddonForm(false)
    // Não limpar selectedSubcategoryId para permitir adicionar múltiplos addons
    // Categoria agora está permanentemente bloqueada após adicionar addons
  }

  const handleAddSimpleAddon = (addon: Addon) => {
    // Remove duplicate: if an addon with the same name exists, remove it first
    const existingIndex = addons.findIndex(
      (existing) => isDuplicate(existing, addon)
    )
    
    const updatedAddons = [...addons]
    
    if (existingIndex !== -1) {
      // Remove the old addon
      updatedAddons.splice(existingIndex, 1)
    }
    
    // Add the new addon
    updatedAddons.push(addon)
    
    setAddons(updatedAddons)
    // Manter o formulário aberto para adicionar mais addons
    // Categoria agora está permanentemente bloqueada após adicionar addons
  }

  const handleRemoveAddon = (addonId: string) => {
    setAddons(addons.filter((a) => a.id !== addonId))
  }

  const handleCategorySelect = (categoryId: string) => {
    if (area <= 0) return // Não permitir seleção se área for 0
    
    // Se já tem uma categoria selecionada e é diferente, mostrar dialog de confirmação
    if (selectedCategoryId && selectedCategoryId !== categoryId) {
      // Verificar se tem dados que serão perdidos
      const hasDataToLose = addons.length > 0 || selectedSubcategoryId
      if (hasDataToLose) {
        setPendingCategoryId(categoryId)
        setShowCategoryChangeDialog(true)
        return
      }
    }
    
    // Se não tem dados ou é a mesma categoria, selecionar normalmente
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryId('')
  }

  const handleConfirmCategoryChange = () => {
    if (pendingCategoryId !== null) {
      setSelectedCategoryId(pendingCategoryId)
      setSelectedSubcategoryId('')
      setAddons([])
      setShowSubcategoryAddons(false)
      setShowSimpleAddonForm(false)
    }
    setShowCategoryChangeDialog(false)
    setPendingCategoryId(null)
  }

  const handleCancelCategoryChange = (open: boolean) => {
    if (!open) {
      // Dialog foi fechado (cancelado)
      setPendingCategoryId(null)
    }
    setShowCategoryChangeDialog(open)
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    if (area <= 0) return // Não permitir seleção se área for 0
    
    // Permitir adicionar addons de múltiplas subcategorias sem limpar os existentes
    setSelectedSubcategoryId(subcategoryId)
    
    // Aplicar basePrice automaticamente se a subcategoria tiver
    if (selectedCategoryId && subcategoryId) {
      const subcategory = findSubcategoryById(selectedCategoryId, subcategoryId)
      if (subcategory?.basePrice !== undefined) {
        setValue('price_per_sqft', subcategory.basePrice, { shouldValidate: true })
      }
    }
    
    if (area > 0) {
      // Se for "Others", mostrar formulário simples
      if (subcategoryId === 'others') {
        setShowSimpleAddonForm(true)
      } else {
        setShowSubcategoryAddons(true)
      }
    }
  }

  // Limpar seleção de categoria/subcategoria se área for 0
  // Mas só limpar se ainda não tiver addons adicionados
  useEffect(() => {
    if (area <= 0 && addons.length === 0) {
      setSelectedCategoryId('')
      setSelectedSubcategoryId('')
      setShowSubcategoryAddons(false)
      setShowSimpleAddonForm(false)
    }
  }, [area, addons.length])

  const handleBasePriceSuggestion = (basePrice: number) => {
    setValue('price_per_sqft', basePrice, { shouldValidate: true })
  }

  const selectedCategory = selectedCategoryId ? findCategoryById(selectedCategoryId) : null
  const selectedSubcategory = selectedCategoryId && selectedSubcategoryId
    ? findSubcategoryById(selectedCategoryId, selectedSubcategoryId)
    : null

  const renderAddonChip = (addon: Addon) => {
    const isMaterial = addon.addonType === 'material'
    return (
      <div
        key={addon.id}
        className={`group flex items-center gap-2 px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 ${
          isMaterial
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-300'
            : 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40'
        }`}
      >
        <span className="text-sm font-medium text-gray-900">
          {addon.name}
          {!isMaterial && (
            <> - <span className="text-primary font-semibold">{formatCurrency(addon.price)}</span></>
          )}
          {isMaterial && addon.quantity && (
            <> ({addon.quantity} {addon.unit || ''})</>
          )}
        </span>
        <button
          type="button"
          onClick={() => handleRemoveAddon(addon.id)}
          className={`ml-1 p-0.5 rounded-md transition-colors duration-200 ${
            isMaterial
              ? 'hover:bg-red-100 hover:text-red-600'
              : 'hover:bg-destructive/10 hover:text-destructive'
          }`}
          aria-label={`Remove ${addon.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="item_name">
            {t('quoteCreation.itemName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="item_name"
            {...register('item_name')}
            placeholder="e.g., Bathroom Floor"
            className={errors.item_name ? 'border-destructive' : ''}
          />
          {errors.item_name && (
            <p className="text-sm text-destructive mt-1">
              {errors.item_name.message}
            </p>
          )}
        </div>

        <div>
          <Label>{t('quoteCreation.areaInputMethod')}</Label>
          <RadioGroup
            value={inputMode}
            onValueChange={(value) => {
              setInputMode(value as 'area' | 'dimensions')
              if (value === 'area') {
                setLength('')
                setWidth('')
              }
            }}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="area" id="area" />
              <Label htmlFor="area">{t('quoteCreation.squareFeet')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dimensions" id="dimensions" />
              <Label htmlFor="dimensions">{t('quoteCreation.dimensions')}</Label>
            </div>
          </RadioGroup>
        </div>

        {inputMode === 'area' ? (
          <div>
            <Label htmlFor="area">
              {t('quoteCreation.areaSqFt')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="area"
              type="number"
              step="0.01"
              {...register('area', { valueAsNumber: true })}
              className={errors.area ? 'border-destructive' : ''}
            />
            {errors.area && (
              <p className="text-sm text-destructive mt-1">
                {errors.area.message}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">{t('quoteCreation.length')}</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={length}
                onChange={(e) => {
                  setLength(e.target.value)
                }}
              />
            </div>
            <div>
              <Label htmlFor="width">{t('quoteCreation.width')}</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value)
                }}
              />
            </div>
            {area > 0 && (
              <div className="col-span-2 text-sm text-muted-foreground">
                {t('quoteCreation.calculatedArea')}: {area.toFixed(2)} {t('quoteCreation.sqFt')}
              </div>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="price_per_sqft">
            {t('quoteCreation.pricePerSquareFoot')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price_per_sqft"
            type="number"
            step="0.01"
            {...register('price_per_sqft', { valueAsNumber: true })}
            className={errors.price_per_sqft ? 'border-destructive' : ''}
          />
          {errors.price_per_sqft && (
            <p className="text-sm text-destructive mt-1">
              {errors.price_per_sqft.message}
            </p>
          )}
        </div>

        <div className="p-4 bg-muted rounded-md">
          <div className="flex justify-between mb-2">
            <span>{t('quoteCreation.lineTotal')}:</span>
            <span className="font-bold">{formatCurrency(lineTotal)}</span>
          </div>
          {addonTotal > 0 && (
            <div className="text-sm text-muted-foreground">
              {t('quoteCreation.base')}: {formatCurrency(area * pricePerSqft)} + {t('quote.addons')}:{' '}
              {formatCurrency(addonTotal)}
            </div>
          )}
        </div>

        {/* Seleção de Categoria e Subcategoria */}
        <div className="space-y-4">
          <CategorySelector
            selectedCategoryId={selectedCategoryId}
            onSelect={handleCategorySelect}
            disabled={area <= 0}
            locked={false}
          />
          
          {selectedCategory && (
            <SubcategorySelector
              category={selectedCategory}
              selectedSubcategoryId={selectedSubcategoryId}
              onSelect={handleSubcategorySelect}
              onClearCategory={() => {
                // Verificar se tem dados que serão perdidos
                const hasDataToLose = addons.length > 0 || selectedSubcategoryId
                if (hasDataToLose) {
                  setPendingCategoryId('')
                  setShowCategoryChangeDialog(true)
                } else {
                  setSelectedCategoryId('')
                  setSelectedSubcategoryId('')
                }
              }}
            />
          )}
        </div>

        {addons.length > 0 && (
          <div className="space-y-3">
            <Label>{t('quoteCreation.currentAddons')}</Label>
            <div className="space-y-4">
              {materialAddons.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('quoteCreation.materials')}
                  </p>
            <div className="flex flex-wrap gap-2">
                    {materialAddons.map(renderAddonChip)}
                  </div>
                </div>
              )}
              {serviceAddons.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('quoteCreation.addons')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {serviceAddons.map(renderAddonChip)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-primary hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {item ? t('quoteCreation.editItem') : t('quoteCreation.addLineItem')}
          </Button>
        </div>
      </form>

      {/* Dialog de confirmação para mudança de categoria/subcategoria */}
      <ConfirmDialog
        open={showCategoryChangeDialog}
        onOpenChange={handleCancelCategoryChange}
        title={t('quoteCreation.categoryChangeWarning')}
        description={t('quoteCreation.categoryChangeWarningDescription')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant="warning"
        onConfirm={handleConfirmCategoryChange}
      />

      {/* Modal de Addons da Subcategoria */}
      {selectedSubcategory && selectedSubcategory.id !== 'others' && (
        <SubcategoryAddonsPopup
          open={showSubcategoryAddons}
          subcategory={selectedSubcategory}
          area={area}
          pricePerSqft={pricePerSqft}
          onSelect={handleAddAddons}
          onCancel={() => {
            setShowSubcategoryAddons(false)
            setSelectedSubcategoryId('')
          }}
          onBasePriceSuggestion={handleBasePriceSuggestion}
        />
      )}

      {/* Formulário simples para subcategoria "Others" */}
      {selectedSubcategory && selectedSubcategory.id === 'others' && (
        <SimpleAddonForm
          open={showSimpleAddonForm}
          subcategoryName={selectedSubcategory.name}
          onAdd={handleAddSimpleAddon}
          onCancel={() => {
            setShowSimpleAddonForm(false)
            setSelectedSubcategoryId('')
          }}
        />
      )}
    </>
  )
}


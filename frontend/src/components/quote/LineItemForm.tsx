import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { QuoteItem, Addon } from '@/types/quote-creation'
import { AddonSelector } from './AddonSelector'
import { useTranslation } from '@/hooks/useTranslation'

const getLineItemSchema = (t: (key: string) => string) => z.object({
  item_name: z.string().min(1, t('quoteCreation.itemNameRequired')),
  area: z.number().min(0.01, t('quoteCreation.areaRequired')),
  price_per_sqft: z.number().min(0, t('quoteCreation.priceRequired')),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
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
  const [showAddonSelector, setShowAddonSelector] = useState(false)
  const [addonSelectorKey, setAddonSelectorKey] = useState(0)

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
      start_date: item?.start_date || '',
      end_date: item?.end_date || '',
    },
  })

  const area = watch('area')
  const pricePerSqft = watch('price_per_sqft')

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

  const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0)
  const lineTotal = area * pricePerSqft + addonTotal

  const onSubmit = (data: LineItemFormData) => {
    const newItem: QuoteItem = {
      id: item?.id || crypto.randomUUID(),
      item_name: data.item_name,
      area: data.area,
      price_per_sqft: data.price_per_sqft,
      line_total: lineTotal,
      start_date: data.start_date,
      end_date: data.end_date,
      addons,
    }
    onSave(newItem)
  }

  const handleAddAddon = (addon: Addon) => {
    setAddons([...addons, addon])
    setShowAddonSelector(false)
  }

  const handleRemoveAddon = (addonId: string) => {
    setAddons(addons.filter((a) => a.id !== addonId))
  }

  const handleOpenAddonSelector = () => {
    setAddonSelectorKey((prev) => prev + 1)
    setShowAddonSelector(true)
  }

  const handleCloseAddonSelector = () => {
    setShowAddonSelector(false)
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

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenAddonSelector}
            className="w-full gap-2 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            {t('quoteCreation.addAddons')}
          </Button>
        </div>

        {addons.length > 0 && (
          <div className="space-y-2">
            <Label>{t('quoteCreation.currentAddons')}</Label>
            <div className="flex flex-wrap gap-2">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {addon.name} - <span className="text-primary font-semibold">{formatCurrency(addon.price)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(addon.id)}
                    className="ml-1 p-0.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                    aria-label={`Remove ${addon.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">{t('quoteCreation.startDate')}</Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
            />
          </div>
          <div>
            <Label htmlFor="end_date">{t('quoteCreation.endDate')}</Label>
            <Input
              id="end_date"
              type="date"
              {...register('end_date')}
              min={watch('start_date') || undefined}
            />
          </div>
        </div>

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

      <Dialog open={showAddonSelector} onOpenChange={(open) => {
        if (!open) {
          handleCloseAddonSelector()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] min-h-[200px] overflow-y-auto overscroll-contain">
          <DialogHeader className="pb-2">
            <DialogTitle>{t('quoteCreation.addAddons')}</DialogTitle>
            <DialogDescription>
              {t('quoteCreation.addItemsDescription')}
            </DialogDescription>
          </DialogHeader>
          <AddonSelector
            key={addonSelectorKey}
            onSelect={handleAddAddon}
            onCancel={handleCloseAddonSelector}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}


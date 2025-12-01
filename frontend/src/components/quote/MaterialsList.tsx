import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { useTranslation } from '@/hooks/useTranslation'
import { Package, Plus, Trash2 } from 'lucide-react'
import type { Addon } from '@/types/quote-creation'

interface MaterialInstance {
  addonId: string
  itemId: string
  itemName: string
  quantity?: number
  unit?: string
}

interface MaterialGroup {
  key: string
  name: string
  unit?: string
  totalQuantity: number
  instances: MaterialInstance[]
}

const getBaseMaterialName = (name: string) => name.split('(')[0].trim()

export function MaterialsList() {
  const {
    formData,
    addAddonToItem,
    removeAddonFromItem,
  } = useQuoteCreationStore()
  const { t } = useTranslation()

  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialQuantity, setNewMaterialQuantity] = useState('')
  const [newMaterialUnit, setNewMaterialUnit] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<string>(formData.items[0]?.id || '')

  useEffect(() => {
    if (!formData.items.find((item) => item.id === selectedItemId)) {
      setSelectedItemId(formData.items[0]?.id || '')
    }
  }, [formData.items, selectedItemId])

  const materialGroups = useMemo<MaterialGroup[]>(() => {
    const materialMap = new Map<string, MaterialGroup>()
  
  formData.items.forEach((item) => {
    item.addons
      .filter((addon) => addon.addonType === 'material')
      .forEach((addon) => {
          const key = getBaseMaterialName(addon.name).toLowerCase() || addon.id
          const displayName = getBaseMaterialName(addon.name) || addon.name
          const quantity = addon.quantity ?? 0

          if (!materialMap.has(key)) {
            materialMap.set(key, {
              key,
              name: displayName,
              unit: addon.unit,
              totalQuantity: quantity,
              instances: [
                {
                  addonId: addon.id,
                  itemId: item.id,
                  itemName: item.item_name,
                  quantity: addon.quantity,
                  unit: addon.unit,
                },
              ],
            })
          } else {
            const existing = materialMap.get(key)!
            existing.totalQuantity += quantity
            existing.instances.push({
              addonId: addon.id,
              itemId: item.id,
              itemName: item.item_name,
              quantity: addon.quantity,
              unit: addon.unit,
            })
            if (!existing.unit && addon.unit) {
              existing.unit = addon.unit
            }
          }
        })
    })

    return Array.from(materialMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [formData.items])

  const formatQuantity = (quantity: number, unit?: string) => {
    if (quantity && unit) {
      return `${quantity} ${unit}${quantity !== 1 ? 's' : ''}`
    }
    if (quantity) {
      return quantity.toString()
    }
    if (unit) {
      return `0 ${unit}${unit !== '' && !unit.endsWith('s') ? 's' : ''}`
    }
    return t('quoteCreation.materialsListQuantityMissing') || 'Quantity not provided'
  }

  const handleRemoveMaterial = (group: MaterialGroup) => {
    if (group.instances.length === 0) return
    const confirmed = window.confirm(
      t('quoteCreation.materialsListRemoveConfirm') ||
        'Remove this material from all items?'
    )
    if (!confirmed) return
    group.instances.forEach((instance) => {
      removeAddonFromItem(instance.itemId, instance.addonId)
    })
  }

  const handleAddMaterial = () => {
    if (!selectedItemId || !newMaterialName.trim()) return

    const quantityNumber = parseFloat(newMaterialQuantity)
    const addon: Addon = {
      id: crypto.randomUUID(),
      name: newMaterialName.trim(),
      price: 0,
      addonType: 'material',
    }

    if (!Number.isNaN(quantityNumber) && quantityNumber > 0) {
      addon.quantity = quantityNumber
    }

    if (newMaterialUnit.trim()) {
      addon.unit = newMaterialUnit.trim()
    }

    addAddonToItem(selectedItemId, addon)
    setNewMaterialName('')
    setNewMaterialQuantity('')
    setNewMaterialUnit('')
  }

  const canAddMaterial = Boolean(selectedItemId && newMaterialName.trim())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('quoteCreation.materialsList') || 'Materials List'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {materialGroups.length > 0 ? (
          <div className="space-y-3">
            {materialGroups.map((group) => (
              <div
                key={group.key}
                className="rounded-lg border border-gray-200/70 bg-muted/60 p-3"
              >
                <div className="flex items-center gap-3">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('quoteCreation.materialsListUsedIn', { count: group.instances.length }) ||
                        `Used in ${group.instances.length} items`}
                    </p>
                    {group.instances.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.instances.map((instance) => (
                          <span
                            key={instance.addonId}
                            className="rounded-full border border-gray-200/80 bg-white px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {instance.itemName}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                  <div className="text-right text-sm font-semibold text-gray-900">
                    {formatQuantity(group.totalQuantity, group.unit)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMaterial(group)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={t('quoteCreation.materialsListRemoveMaterial') || 'Remove material'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('quoteCreation.materialsListEmpty') ||
              'No materials added yet. Use the form below to include them manually.'}
          </p>
        )}

        <div className="space-y-3 rounded-lg border border-dashed border-gray-300/80 p-4">
          <p className="text-sm font-semibold text-gray-900">
            {t('quoteCreation.materialsListAddTitle') || 'Add material manually'}
          </p>
          <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
            <div className="space-y-1">
              <Label htmlFor="material-name">
                {t('quoteCreation.materialsListName') || 'Material name'}
              </Label>
              <Input
                id="material-name"
                placeholder="e.g., Silicone"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="material-qty">
                {t('quoteCreation.materialsListQuantity') || 'Quantity (optional)'}
              </Label>
              <Input
                id="material-qty"
                type="number"
                min="0"
                step="1"
                value={newMaterialQuantity}
                onChange={(e) => setNewMaterialQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="material-unit">
                {t('quoteCreation.materialsListUnit') || 'Unit (optional)'}
              </Label>
              <Input
                id="material-unit"
                placeholder="bags, boxes..."
                value={newMaterialUnit}
                onChange={(e) => setNewMaterialUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>
              {t('quoteCreation.materialsListItem') || 'Apply to item'}
            </Label>
            <Select
              value={selectedItemId}
              onValueChange={setSelectedItemId}
              disabled={formData.items.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    t('quoteCreation.materialsListItemPlaceholder') || 'Select an item'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {formData.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.item_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleAddMaterial}
            disabled={!canAddMaterial}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('quoteCreation.materialsListAddButton') || 'Add material'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


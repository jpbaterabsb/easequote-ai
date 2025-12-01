import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Addon } from '@/types/quote-creation'
import { useTranslation } from '@/hooks/useTranslation'

interface SimpleAddonFormProps {
  open: boolean
  subcategoryName: string
  onAdd: (addon: Addon) => void
  onCancel: () => void
}

export function SimpleAddonForm({
  open,
  subcategoryName,
  onAdd,
  onCancel,
}: SimpleAddonFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const handleAdd = () => {
    const addonPrice = parseFloat(price)
    if (!name.trim() || isNaN(addonPrice) || addonPrice < 0) {
      return
    }

    const addon: Addon = {
      id: crypto.randomUUID(),
      name: name.trim(),
      price: addonPrice,
      addonType: 'general',
    }

    onAdd(addon)
    // Limpar campos mas manter modal aberto para adicionar mais
    setName('')
    setPrice('')
    // Focar no campo de nome novamente
    setTimeout(() => {
      const nameInput = document.getElementById('addon-name')
      if (nameInput) {
        nameInput.focus()
      }
    }, 100)
  }

  const handleCancel = () => {
    setName('')
    setPrice('')
    onCancel()
  }

  const isValid = name.trim().length > 0 && !isNaN(parseFloat(price)) && parseFloat(price) >= 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('quoteCreation.addCustomAddon') || 'Add Custom Add-on'} - {subcategoryName}
          </DialogTitle>
          <DialogDescription>
            {t('quoteCreation.addCustomAddonDescription') || 'Enter the add-on name and price'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="addon-name">
              {t('quoteCreation.addonName') || 'Add-on Name'} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addon-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('quoteCreation.addonNamePlaceholder') || 'e.g., Custom service'}
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValid) {
                  handleAdd()
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor="addon-price">
              {t('quoteCreation.price')} ({t('quoteCreation.usd')}) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addon-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValid) {
                  handleAdd()
                }
              }}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={!isValid}
              className="flex-1"
            >
              {t('quoteCreation.addAnother') || 'Add Another'}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="flex-1"
            >
              {t('common.done')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


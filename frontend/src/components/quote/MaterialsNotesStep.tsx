import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { formatCurrency } from '@/utils/format'
import type { QuoteFormData, QuoteItem } from '@/types/quote-creation'
import { useTranslation } from '@/hooks/useTranslation'
import { MaterialsList } from './MaterialsList'

interface MaterialsNotesStepProps {
  onNext: () => void
  onBack: () => void
}

export function MaterialsNotesStep({ onNext, onBack }: MaterialsNotesStepProps) {
  const { formData, setMaterials, setPaymentMethod, setNotes } = useQuoteCreationStore()
  const { t } = useTranslation()
  const [materialCost, setMaterialCost] = useState(
    formData.material_cost.toString()
  )

  const subtotal = formData.items.reduce((sum: number, item: QuoteItem) => sum + item.line_total, 0)
  // When checkbox is unchecked (we provide materials), add material cost to total
  // When checkbox is checked (customer provides materials), don't add cost
  const total = subtotal + (!formData.customer_provides_materials ? formData.material_cost : 0)

  const handleNotesChange = (value: string) => {
    if (value.length <= 500) {
      setNotes(value)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('quoteCreation.materialsNotes')}</h2>
        <p className="text-muted-foreground">
          {t('quoteCreation.materialsNotesDescription')}
        </p>
      </div>

      {/* Lista de materiais agregados */}
      <MaterialsList />

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="provides_materials"
            checked={formData.customer_provides_materials}
            onCheckedChange={(checked) => {
              // When checked: customer provides materials = true (hide cost)
              // When unchecked: customer provides materials = false (show cost)
              setMaterials(checked as boolean, checked ? 0 : parseFloat(materialCost) || 0)
            }}
          />
          <Label htmlFor="provides_materials" className="cursor-pointer">
            {t('quoteCreation.customerProvidesMaterials')}
          </Label>
        </div>

        {!formData.customer_provides_materials && (
          <div>
            <Label htmlFor="material_cost">{t('quoteCreation.materialCostUSD')}</Label>
            <Input
              id="material_cost"
              type="number"
              step="0.01"
              min="0"
              value={materialCost}
              onChange={(e) => {
                const value = e.target.value
                setMaterialCost(value)
                // Update cost when we provide materials (checkbox unchecked)
                if (!formData.customer_provides_materials) {
                  const cost = parseFloat(value) || 0
                  setMaterials(false, cost)
                }
              }}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {t('quoteCreation.materialCostAdded')}
            </p>
          </div>
        )}

        <div>
          <Label>{t('quoteCreation.paymentMethod')}</Label>
          <RadioGroup
            value={formData.payment_method || ''}
            onValueChange={(value) =>
              setPaymentMethod(value as QuoteFormData['payment_method'])
            }
            className="grid grid-cols-2 gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card">{t('quoteCreation.creditCard')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debit_card" id="debit_card" />
              <Label htmlFor="debit_card">{t('quoteCreation.debitCard')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash">{t('quoteCreation.cash')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="check" id="check" />
              <Label htmlFor="check">{t('quoteCreation.check')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zelle" id="zelle" />
              <Label htmlFor="zelle">{t('quoteCreation.zelleVenmo')}</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="notes">{t('quoteCreation.additionalNotes')}</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t('quoteCreation.addNotesPlaceholder')}
            rows={6}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-sm text-muted-foreground">
              {t('quoteCreation.maxCharacters')}
            </p>
            <p className="text-sm text-muted-foreground">
              {formData.notes.length}/500
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-md space-y-2">
        <div className="flex justify-between">
          <span>{t('quote.subtotal')}:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {!formData.customer_provides_materials && formData.material_cost > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('quote.materialCost')}:</span>
            <span>+{formatCurrency(formData.material_cost)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>{t('quote.total')}:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button onClick={onNext}>{t('quoteCreation.reviewSave')}</Button>
      </div>
    </div>
  )
}


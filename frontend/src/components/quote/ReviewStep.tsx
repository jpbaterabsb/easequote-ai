import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { formatCurrency } from '@/utils/format'
import { Loader2, Package } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Addon, QuoteItem } from '@/types/quote-creation'

interface ReviewStepProps {
  onBack: () => void
  onSave: () => void
  saving: boolean
}

export function ReviewStep({ onBack, onSave, saving }: ReviewStepProps) {
  const { formData } = useQuoteCreationStore()
  const { t } = useTranslation()

  const subtotal = formData.items.reduce((sum: number, item: QuoteItem) => sum + item.line_total, 0)
  // When checkbox is checked (we provide materials), add material cost to total
  // When checkbox is unchecked (customer provides materials), don't add cost
  const total =
    subtotal + (!formData.customer_provides_materials ? formData.material_cost : 0)

  // Collect all materials from all items
  const materialMap = new Map<string, { name: string; quantity: number; unit?: string }>()
  
  formData.items.forEach((item: QuoteItem) => {
    item.addons
      .filter((addon: Addon) => addon.addonType === 'material')
      .forEach((addon: Addon) => {
        // Extract base name (everything before the first parenthesis)
        const fullName = addon.name || 'Unknown Material'
        const baseName = fullName.split('(')[0].trim()
        const quantity = addon.quantity || 0
        const unit = addon.unit || ''
        
        if (materialMap.has(baseName)) {
          const existing = materialMap.get(baseName)!
          existing.quantity += quantity
        } else {
          materialMap.set(baseName, {
            name: baseName,
            quantity,
            unit,
          })
        }
      })
  })

  const materials = Array.from(materialMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('quoteCreation.reviewQuote')}</h2>
        <p className="text-muted-foreground">
          {t('quoteCreation.reviewDetails')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('quoteCreation.customerInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">{t('quoteCreation.name')}:</span> {formData.customer.customer_name}
          </div>
          {formData.customer.customer_phone && (
            <div>
              <span className="font-medium">{t('quoteCreation.phone')}:</span> {formData.customer.customer_phone}
            </div>
          )}
          {formData.customer.customer_email && (
            <div>
              <span className="font-medium">{t('quoteCreation.email')}:</span> {formData.customer.customer_email}
            </div>
          )}
          {formData.customer.customer_address && (
            <div>
              <span className="font-medium">{t('quoteCreation.address')}:</span>{' '}
              {[
                formData.customer.customer_address,
                formData.customer.customer_city,
                formData.customer.customer_state,
                formData.customer.customer_zip,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('quoteCreation.lineItems')} ({formData.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.items.map((item: QuoteItem) => (
            <div key={item.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{item.item_name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {item.area.toFixed(2)} {t('quoteCreation.sqFt')} × {formatCurrency(item.price_per_sqft)}{t('quoteCreation.perSqFt')}
                  </div>
                </div>
                <div className="font-bold">{formatCurrency(item.line_total)}</div>
              </div>
              {item.addons.filter((addon: Addon) => addon.addonType !== 'material').length > 0 && (
                <div className="ml-4 mt-2 text-sm">
                  <div className="font-medium mb-1">{t('quote.addons')}:</div>
                  {item.addons
                    .filter((addon: Addon) => addon.addonType !== 'material')
                    .map((addon: Addon) => (
                      <div key={addon.id} className="text-muted-foreground">
                        • {addon.name} - {formatCurrency(addon.price)}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {(!formData.customer_provides_materials || formData.payment_method) && (
        <Card>
          <CardHeader>
            <CardTitle>{t('quote.additionalDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">{t('quoteCreation.customerProvidesMaterials')}:</span>{' '}
              {formData.customer_provides_materials ? t('quote.yes') : t('quote.no')}
            </div>
            {!formData.customer_provides_materials && formData.material_cost > 0 && (
              <div>
                <span className="font-medium">{t('quote.materialCost')}:</span>{' '}
                {formatCurrency(formData.material_cost)}
              </div>
            )}
            {formData.payment_method && (
              <div>
                <span className="font-medium">{t('quoteCreation.paymentMethod')}:</span>{' '}
                {formData.payment_method
                  .split('_')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Materials Section */}
      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('quote.materials') || 'Materials'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="font-medium text-sm">{material.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {material.quantity} {material.unit && `${material.unit}${material.quantity !== 1 ? 's' : ''}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {formData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('quote.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{formData.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('quote.summary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={saving}>
          {t('common.back')}
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('quoteCreation.saving')}
            </>
          ) : (
            t('quoteCreation.saveQuote')
          )}
        </Button>
      </div>
    </div>
  )
}


import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { formatCurrency } from '@/utils/format'
import { Loader2 } from 'lucide-react'

interface ReviewStepProps {
  onBack: () => void
  onSave: () => void
  saving: boolean
}

export function ReviewStep({ onBack, onSave, saving }: ReviewStepProps) {
  const { formData } = useQuoteCreationStore()

  const subtotal = formData.items.reduce((sum, item) => sum + item.line_total, 0)
  // When checkbox is checked (we provide materials), add material cost to total
  // When checkbox is unchecked (customer provides materials), don't add cost
  const total =
    subtotal + (!formData.customer_provides_materials ? formData.material_cost : 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Quote</h2>
        <p className="text-muted-foreground">
          Review all details before saving your quote.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Name:</span> {formData.customer.customer_name}
          </div>
          {formData.customer.customer_phone && (
            <div>
              <span className="font-medium">Phone:</span> {formData.customer.customer_phone}
            </div>
          )}
          {formData.customer.customer_email && (
            <div>
              <span className="font-medium">Email:</span> {formData.customer.customer_email}
            </div>
          )}
          {formData.customer.customer_address && (
            <div>
              <span className="font-medium">Address:</span>{' '}
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
          <CardTitle>Line Items ({formData.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.items.map((item) => (
            <div key={item.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{item.item_name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {item.area.toFixed(2)} sq ft × {formatCurrency(item.price_per_sqft)}/sq ft
                  </div>
                </div>
                <div className="font-bold">{formatCurrency(item.line_total)}</div>
              </div>
              {item.addons.length > 0 && (
                <div className="ml-4 mt-2 text-sm">
                  <div className="font-medium mb-1">Add-ons:</div>
                  {item.addons.map((addon) => (
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
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Customer Provides Materials:</span>{' '}
              {formData.customer_provides_materials ? 'Yes' : 'No'}
            </div>
            {!formData.customer_provides_materials && formData.material_cost > 0 && (
              <div>
                <span className="font-medium">Material Cost:</span>{' '}
                {formatCurrency(formData.material_cost)}
              </div>
            )}
            {formData.payment_method && (
              <div>
                <span className="font-medium">Payment Method:</span>{' '}
                {formData.payment_method
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {formData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{formData.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {!formData.customer_provides_materials && formData.material_cost > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Material Cost:</span>
              <span>+{formatCurrency(formData.material_cost)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Quote'
          )}
        </Button>
      </div>
    </div>
  )
}


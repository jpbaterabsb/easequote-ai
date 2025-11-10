import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { LineItemForm } from './LineItemForm'
import { formatCurrency } from '@/utils/format'
import type { QuoteItem } from '@/types/quote-creation'

interface LineItemsStepProps {
  onNext: () => void
  onBack: () => void
}

export function LineItemsStep({ onNext, onBack }: LineItemsStepProps) {
  const { formData, addItem, updateItem, removeItem } = useQuoteCreationStore()
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)

  const subtotal = formData.items.reduce((sum, item) => sum + item.line_total, 0)

  const handleAddItem = () => {
    setEditingItem(null)
    setShowItemForm(true)
  }

  const handleEditItem = (item: QuoteItem) => {
    setEditingItem(item)
    setShowItemForm(true)
  }

  const handleSaveItem = (item: QuoteItem) => {
    if (editingItem) {
      updateItem(item.id, item)
    } else {
      addItem(item)
    }
    setShowItemForm(false)
    setEditingItem(null)
  }

  const handleCancelItem = () => {
    setShowItemForm(false)
    setEditingItem(null)
  }

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      removeItem(itemId)
    }
  }

  const canProceed = formData.items.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Line Items</h2>
        <p className="text-muted-foreground">
          Add items to your quote. Each item can have add-ons and specific details.
        </p>
      </div>

      {showItemForm ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit Item' : 'Add Line Item'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelItem}
                className="hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <LineItemForm
              item={editingItem || undefined}
              onSave={handleSaveItem}
              onCancel={handleCancelItem}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {formData.items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No items added yet</p>
              <Button onClick={handleAddItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.item_name}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.area.toFixed(2)} sq ft × {formatCurrency(item.price_per_sqft)}/sq ft
                        </div>
                        {item.addons.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Add-ons:</div>
                            <div className="text-sm text-muted-foreground">
                              {item.addons.map((addon) => (
                                <div key={addon.id}>
                                  • {addon.name} - {formatCurrency(addon.price)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 font-bold text-lg">
                          {formatCurrency(item.line_total)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleAddItem} variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Another Item
              </Button>
            </div>
          )}
        </>
      )}

      {!showItemForm && formData.items.length > 0 && (
        <div className="p-4 bg-muted rounded-md">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}

      {!showItemForm && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed}>
            Next: Materials & Notes
          </Button>
        </div>
      )}
    </div>
  )
}


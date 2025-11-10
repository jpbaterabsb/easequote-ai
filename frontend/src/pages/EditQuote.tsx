import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { CustomerStep } from '@/components/quote/CustomerStep'
import { LineItemsStep } from '@/components/quote/LineItemsStep'
import { MaterialsNotesStep } from '@/components/quote/MaterialsNotesStep'
import { ReviewStep } from '@/components/quote/ReviewStep'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { Quote } from '@/types/quote'
import { QuoteItem } from '@/types/quote-creation'
import { logAuditEvent } from '@/utils/audit'
import { findOrCreateCustomer } from '@/utils/customers'

const STEPS = [
  { number: 1, title: 'Customer Info' },
  { number: 2, title: 'Line Items' },
  { number: 3, title: 'Materials & Notes' },
  { number: 4, title: 'Review' },
]

export function EditQuote() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    currentStep,
    setCurrentStep,
    formData,
    reset,
    updateCustomer,
    setMaterials,
    setPaymentMethod,
    setNotes,
    addItem,
    removeItem,
  } = useQuoteCreationStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [originalQuote, setOriginalQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (id) {
      loadQuote()
    }
    return () => {
      // Reset form when leaving
      reset()
    }
  }, [id])

  const loadQuote = async () => {
    try {
      setLoading(true)

      // Fetch quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (quoteError) throw quoteError

      if (!quoteData) {
        toast({
          title: 'Error',
          description: 'Quote not found',
          variant: 'destructive',
        })
        navigate('/dashboard')
        return
      }

      const quote = quoteData as Quote
      setOriginalQuote(quote)

      // Load customer data
      updateCustomer({
        customer_name: quote.customer_name,
        customer_phone: quote.customer_phone || '',
        customer_email: quote.customer_email || '',
        customer_address: quote.customer_address || '',
        customer_city: quote.customer_city || '',
        customer_state: quote.customer_state || '',
        customer_zip: quote.customer_zip || '',
        customer_lat: quote.customer_lat || undefined,
        customer_lng: quote.customer_lng || undefined,
      })

      // Load materials and notes
      setMaterials(quote.customer_provides_materials, quote.material_cost)
      setPaymentMethod(quote.payment_method || undefined)
      setNotes(quote.notes || '')

      // Fetch and load quote items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      // Clear existing items first
      const currentItems = useQuoteCreationStore.getState().formData.items
      currentItems.forEach((item) => removeItem(item.id))

      // Add loaded items
      ;(itemsData || []).forEach((item) => {
        addItem({
          id: item.id,
          item_name: item.item_name,
          area: item.area,
          price_per_sqft: item.price_per_sqft,
          line_total: item.line_total,
          start_date: item.start_date || undefined,
          end_date: item.end_date || undefined,
          addons: (item.addons as any[]) || [],
        })
      })
    } catch (error: any) {
      console.error('Error loading quote:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load quote. Please try again.',
        variant: 'destructive',
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    if (!user || !id || !originalQuote) {
      toast({
        title: 'Error',
        description: 'You must be logged in to edit a quote.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => sum + item.line_total, 0)
      const total =
        subtotal + (!formData.customer_provides_materials ? formData.material_cost : 0)

      // Find or create customer
      const customerId = await findOrCreateCustomer({
        name: formData.customer.customer_name,
        phone: formData.customer.customer_phone || null,
        email: formData.customer.customer_email || null,
      })

      // Prepare old values for audit log
      const oldValues = {
        customer_name: originalQuote.customer_name,
        customer_phone: originalQuote.customer_phone,
        customer_email: originalQuote.customer_email,
        customer_address: originalQuote.customer_address,
        customer_city: originalQuote.customer_city,
        customer_state: originalQuote.customer_state,
        customer_zip: originalQuote.customer_zip,
        status: originalQuote.status,
        notes: originalQuote.notes,
        customer_provides_materials: originalQuote.customer_provides_materials,
        material_cost: originalQuote.material_cost,
        subtotal: originalQuote.subtotal,
        total_amount: originalQuote.total_amount,
      }

      // Update quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          customer_id: customerId,
          customer_name: formData.customer.customer_name,
          customer_phone: formData.customer.customer_phone || null,
          customer_email: formData.customer.customer_email || null,
          customer_address: formData.customer.customer_address || null,
          customer_city: formData.customer.customer_city || null,
          customer_state: formData.customer.customer_state || null,
          customer_zip: formData.customer.customer_zip || null,
          customer_lat: formData.customer.customer_lat || null,
          customer_lng: formData.customer.customer_lng || null,
          notes: formData.notes || null,
          customer_provides_materials: formData.customer_provides_materials,
          material_cost: formData.material_cost,
          subtotal,
          total_amount: total,
        })
        .eq('id', id)

      if (quoteError) throw quoteError

      // Prepare new values for audit log
      const newValues = {
        customer_name: formData.customer.customer_name,
        customer_phone: formData.customer.customer_phone,
        customer_email: formData.customer.customer_email,
        customer_address: formData.customer.customer_address,
        customer_city: formData.customer.customer_city,
        customer_state: formData.customer.customer_state,
        customer_zip: formData.customer.customer_zip,
        status: originalQuote.status, // Status doesn't change on edit
        notes: formData.notes,
        customer_provides_materials: formData.customer_provides_materials,
        material_cost: formData.material_cost,
        subtotal,
        total_amount: total,
      }

      // Log audit event
      await logAuditEvent({
        entity_type: 'quote',
        entity_id: id,
        action: 'updated',
        old_values: oldValues,
        new_values: newValues,
      })

      // Delete existing items
      const { error: deleteItemsError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id)

      if (deleteItemsError) throw deleteItemsError

      // Create new items
      if (formData.items.length > 0) {
        const itemsToInsert = formData.items.map((item) => ({
          quote_id: id,
          item_name: item.item_name,
          area: item.area,
          price_per_sqft: item.price_per_sqft,
          line_total: item.line_total,
          start_date: item.start_date || null,
          end_date: item.end_date || null,
          addons: item.addons,
        }))

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert)

        if (itemsError) throw itemsError
      }

      toast({
        title: 'Success',
        description: `Quote ${originalQuote.quote_number} updated successfully!`,
      })

      navigate(`/quotes/${id}`)
    } catch (error: any) {
      console.error('Error updating quote:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quote. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowCancelDialog(true)
  }

  const confirmCancel = () => {
    reset()
    navigate(`/quotes/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Edit Quote</h1>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep > step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <div className="mt-2 text-xs text-center text-muted-foreground">
                    {step.title}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && <CustomerStep onNext={handleNext} />}
            {currentStep === 2 && (
              <LineItemsStep onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <MaterialsNotesStep onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 4 && (
              <ReviewStep onBack={handleBack} onSave={handleSave} saving={saving} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Editing?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel? All unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              className="w-full sm:w-auto border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Continue Editing
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


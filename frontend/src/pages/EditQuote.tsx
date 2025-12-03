import { useEffect, useState, Fragment } from 'react'
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
import type { Quote } from '@/types/quote'
import { logAuditEvent } from '@/utils/audit'
import { findOrCreateCustomer } from '@/utils/customers'
import { useTranslation } from '@/hooks/useTranslation'
import { MainLayout } from '@/components/layout/MainLayout'
import type { QuoteItem } from '@/types/quote-creation'

const getSteps = (t: (key: string) => string) => [
  { number: 1, title: t('quoteCreation.customerInfo') },
  { number: 2, title: t('quoteCreation.lineItems') },
  { number: 3, title: t('quoteCreation.materialsNotes') },
  { number: 4, title: t('quoteCreation.review') },
]

export function EditQuote() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const {
    currentStep,
    setCurrentStep,
    formData,
    reset,
    updateCustomer,
    setMaterials,
    setNotes,
    addItem,
    removeItem,
  } = useQuoteCreationStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [originalQuote, setOriginalQuote] = useState<Quote | null>(null)
  const STEPS = getSteps(t)

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
      // Note: payment_method is not stored in quotes table, it's only in the form
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
      currentItems.forEach((item: QuoteItem) => removeItem(item.id))

      // Add loaded items
      ;(itemsData || []).forEach((item) => {
        const addons = (item.addons as any[]) || []
        // Try to extract category_id and subcategory_id from addons metadata
        // Look for a special metadata addon or check if they're stored elsewhere
        let categoryId: string | undefined
        let subcategoryId: string | undefined
        
        // Check if there's a metadata addon (stored as first addon with id '_metadata')
        const metadataAddon = addons.find((a: any) => a.id === '_metadata')
        if (metadataAddon) {
          categoryId = metadataAddon.category_id
          subcategoryId = metadataAddon.subcategory_id
        }
        
        addItem({
          id: item.id,
          item_name: item.item_name,
          area: item.area,
          price_per_sqft: item.price_per_sqft,
          line_total: item.line_total,
          addons: addons.filter((a: any) => a.id !== '_metadata'), // Remove metadata addon from display
          category_id: categoryId,
          subcategory_id: subcategoryId,
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
      const subtotal = formData.items.reduce((sum: number, item: QuoteItem) => sum + item.line_total, 0)
      const total =
        subtotal + (!formData.customer_provides_materials ? formData.material_cost : 0)

      // Find or create customer (with address)
      const customerId = await findOrCreateCustomer({
        name: formData.customer.customer_name,
        phone: formData.customer.customer_phone || null,
        email: formData.customer.customer_email || null,
        address: formData.customer.customer_address || null,
        city: formData.customer.customer_city || null,
        state: formData.customer.customer_state || null,
        zip: formData.customer.customer_zip || null,
        lat: formData.customer.customer_lat || null,
        lng: formData.customer.customer_lng || null,
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
        const itemsToInsert = formData.items.map((item: QuoteItem) => {
          // Store category_id and subcategory_id in addons as metadata
          const addonsWithMetadata = [...(item.addons || [])]
          if (item.category_id || item.subcategory_id) {
            addonsWithMetadata.unshift({
              id: '_metadata',
              name: '_metadata',
              price: 0,
              category_id: item.category_id,
              subcategory_id: item.subcategory_id,
            })
          }
          return {
            quote_id: id,
            item_name: item.item_name,
            area: item.area,
            price_per_sqft: item.price_per_sqft,
            line_total: item.line_total,
            addons: addonsWithMetadata,
          }
        })

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
      <MainLayout>
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{t('quote.edit')}</h1>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="gap-2 border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              {t('common.cancel')}
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto pb-2 pt-2 px-1 sm:px-2">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.number
              const isActive = currentStep === step.number
              
              return (
                <Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                    {/* Step Circle */}
                    <div
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold
                        transition-all duration-300 transform border-2
                        ${isCompleted 
                          ? 'bg-primary border-primary text-white shadow-lg' 
                          : isActive
                          ? 'bg-primary border-primary text-white shadow-lg scale-110 ring-4 ring-primary/20'
                          : 'bg-white border-gray-300 text-gray-500'
                        }
                      `}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <span className="animate-scale-in text-sm sm:text-base leading-[1] block">✓</span>
                      ) : (
                        <span className="text-sm sm:text-base leading-[1] block">{step.number}</span>
                      )}
                    </div>
                    {/* Step Label */}
                    <div className={`mt-2 text-xs text-center whitespace-nowrap px-1 transition-colors duration-200 ${
                      isCompleted 
                        ? 'text-primary font-medium' 
                        : isActive 
                        ? 'text-primary font-semibold' 
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-1 sm:mx-2 flex items-center relative" style={{ marginTop: '-20px' }}>
                      {/* Background Line (gray) */}
                      <div className="h-1 w-full bg-gray-200 rounded-full absolute" />
                      {/* Progress Line (blue) */}
                      <div 
                        className={`h-1 rounded-full absolute transition-all duration-500 ${
                          isCompleted ? 'bg-primary w-full' : 'bg-gray-200 w-0'
                        }`}
                      />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>

        <Card className="shadow-xl shadow-gray-300/40 border-gray-100">
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
            <DialogTitle>{t('quote.cancelEditing')}</DialogTitle>
            <DialogDescription>
              {t('quote.cancelConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              className="w-full sm:w-auto border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              {t('quote.continueEditing')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('quote.discardChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}


import { useEffect, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import { CustomerStep } from '@/components/quote/CustomerStep'
import { LineItemsStep } from '@/components/quote/LineItemsStep'
import { MaterialsNotesStep } from '@/components/quote/MaterialsNotesStep'
import { ReviewStep } from '@/components/quote/ReviewStep'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { findOrCreateCustomer } from '@/utils/customers'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { MainLayout } from '@/components/layout/MainLayout'
import type { QuoteItem } from '@/types/quote-creation'

const getSteps = (t: (key: string) => string) => [
  { number: 1, title: t('quoteCreation.customerInfo') },
  { number: 2, title: t('quoteCreation.lineItems') },
  { number: 3, title: t('quoteCreation.materialsNotes') },
  { number: 4, title: t('quoteCreation.review') },
]

export function CreateQuote() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const {
    currentStep,
    setCurrentStep,
    formData,
    reset,
  } = useQuoteCreationStore()
  const [saving, setSaving] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const STEPS = getSteps(t)

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Draft is automatically saved via Zustand persist middleware
    }, 30000) // 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [])

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
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a quote.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      // Calculate totals
      const subtotal = formData.items.reduce((sum: number, item: QuoteItem) => sum + item.line_total, 0)
      // When checkbox is checked (we provide materials), add material cost to total
      // When checkbox is unchecked (customer provides materials), don't add cost
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

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
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
          status: 'created',
          notes: formData.notes || null,
          customer_provides_materials: formData.customer_provides_materials,
          material_cost: formData.material_cost,
          subtotal,
          total_amount: total,
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      // Create quote items
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
            quote_id: quote.id,
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

      // Clear draft
      reset()

      toast({
        title: 'Success',
        description: `Quote ${quote.quote_number} created successfully!`,
      })

      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error creating quote:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create quote. Please try again.',
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
    navigate('/dashboard')
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-4 sm:mb-6 animate-slide-in-down">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('quote.create')}
            </h1>
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              aria-label="Cancel quote creation"
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
                        <span className={`text-sm sm:text-base leading-[1] block ${isActive ? '' : ''}`}>{step.number}</span>
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

        <Card className="shadow-xl shadow-gray-300/40 border-gray-100 bg-white animate-slide-in-up">
          <CardContent className="p-4 sm:p-6">
            <div className="animate-fade-in">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('quote.cancelQuoteCreation')}</DialogTitle>
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


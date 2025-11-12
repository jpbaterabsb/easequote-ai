import { useEffect, useState } from 'react'
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

const STEPS = [
  { number: 1, title: 'Customer Info' },
  { number: 2, title: 'Line Items' },
  { number: 3, title: 'Materials & Notes' },
  { number: 4, title: 'Review' },
]

export function CreateQuote() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    currentStep,
    setCurrentStep,
    formData,
    reset,
  } = useQuoteCreationStore()
  const [saving, setSaving] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

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
      const subtotal = formData.items.reduce((sum, item) => sum + item.line_total, 0)
      // When checkbox is checked (we provide materials), add material cost to total
      // When checkbox is unchecked (customer provides materials), don't add cost
      const total =
        subtotal + (!formData.customer_provides_materials ? formData.material_cost : 0)

      // Find or create customer
      const customerId = await findOrCreateCustomer({
        name: formData.customer.customer_name,
        phone: formData.customer.customer_phone || null,
        email: formData.customer.customer_email || null,
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
        const itemsToInsert = formData.items.map((item) => ({
          quote_id: quote.id,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-4 sm:mb-6 animate-slide-in-down">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create New Quote
            </h1>
            <Button 
              variant="ghost" 
              onClick={handleCancel} 
              aria-label="Cancel quote creation"
              className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2 pt-2">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.number
              const isActive = currentStep === step.number
              const isPending = currentStep < step.number
              
              return (
                <div key={step.number} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1 min-w-0 pt-2">
                    <div
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base
                        transition-all duration-300 transform
                        ${isCompleted 
                          ? 'bg-primary text-white shadow-lg scale-100' 
                          : isActive
                          ? 'bg-primary text-white shadow-lg scale-110 ring-4 ring-primary/20'
                          : 'bg-gray-200 text-gray-600 scale-100'
                        }
                      `}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <span className="animate-scale-in">✓</span>
                      ) : (
                        <span className={isActive ? 'animate-pulse' : ''}>{step.number}</span>
                      )}
                    </div>
                    <div className={`mt-2 text-xs text-center truncate w-full px-1 transition-colors duration-200 ${
                      isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        h-1 flex-1 mx-2 sm:mx-4 rounded-full transition-all duration-500
                        ${isCompleted ? 'bg-primary' : 'bg-muted'}
                      `}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Card className="shadow-elegant-lg border-gray-200/50 bg-white/80 backdrop-blur-sm animate-slide-in-up">
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
            <DialogTitle>Cancel Quote Creation?</DialogTitle>
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


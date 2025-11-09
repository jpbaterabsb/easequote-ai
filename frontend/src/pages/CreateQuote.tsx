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

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Create New Quote</h1>
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
            <DialogTitle>Cancel Quote Creation?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel? All unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


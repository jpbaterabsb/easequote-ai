import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { CreditCard, Check, Loader2, LogOut, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface SubscriptionRequiredModalProps {
  open: boolean
  onSignOut: () => void
  userEmail?: string
}

// Get Stripe Price IDs from environment
const STRIPE_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || ''
const STRIPE_PRICE_ID_YEARLY = import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY || ''

type PlanType = 'monthly' | 'yearly'

const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: '$29.90',
    period: '/month',
    priceId: STRIPE_PRICE_ID_MONTHLY,
    savings: null,
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    price: '$319.90',
    period: '/year',
    priceId: STRIPE_PRICE_ID_YEARLY,
    savings: 'Save $38.90',
    monthlyEquivalent: '$26.66/mo',
  },
} as const

export function SubscriptionRequiredModal({ open, onSignOut, userEmail }: SubscriptionRequiredModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly')
  const { toast } = useToast()

  const handleSubscribe = async () => {
    const plan = PLANS[selectedPlan]
    
    if (!plan.priceId) {
      toast({
        title: 'Configuration Error',
        description: 'Stripe Price ID is not configured. Please contact support.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
        },
      })

      if (error) throw error

      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <Logo linkTo={null} size="lg" className="h-14" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-primary">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {userEmail ? (
              <>Welcome, <strong>{userEmail}</strong>!</>
            ) : (
              'Welcome to EaseQuote.AI!'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Select a plan to access all features of EaseQuote.AI
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              disabled={loading}
              className={cn(
                "relative rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50",
                selectedPlan === 'monthly' 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-muted bg-background hover:bg-muted/30"
              )}
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm">{PLANS.monthly.name}</p>
                <p className="text-2xl font-bold">{PLANS.monthly.price}</p>
                <p className="text-xs text-muted-foreground">{PLANS.monthly.period}</p>
              </div>
              {selectedPlan === 'monthly' && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              )}
            </button>

            {/* Yearly Plan */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              disabled={loading}
              className={cn(
                "relative rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50",
                selectedPlan === 'yearly' 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-muted bg-background hover:bg-muted/30"
              )}
            >
              {PLANS.yearly.savings && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    <Sparkles className="h-3 w-3" />
                    {PLANS.yearly.savings}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                <p className="font-semibold text-sm">{PLANS.yearly.name}</p>
                <p className="text-2xl font-bold">{PLANS.yearly.price}</p>
                <p className="text-xs text-muted-foreground">{PLANS.yearly.period}</p>
                {PLANS.yearly.monthlyEquivalent && (
                  <p className="text-xs text-green-600 font-medium">
                    ({PLANS.yearly.monthlyEquivalent})
                  </p>
                )}
              </div>
              {selectedPlan === 'yearly' && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              )}
            </button>
          </div>

          {/* Features */}
          <div className="rounded-lg border border-muted bg-muted/30 p-4 space-y-2">
            <h4 className="font-semibold text-sm text-center mb-3">All plans include:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Unlimited quotes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>PDF generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Email sending</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>WhatsApp integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Customer management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Materials calculator</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} - {PLANS[selectedPlan].price}
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={onSignOut}
            disabled={loading}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out and use another account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { Sparkles } from 'lucide-react'

interface BetaAgreementModalProps {
  open: boolean
  onAccept: () => void
}

export function BetaAgreementModal({ open, onAccept }: BetaAgreementModalProps) {
  const [hasRead, setHasRead] = useState(false)

  const handleAccept = () => {
    if (hasRead) {
      onAccept()
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
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-50 animate-pulse" />
              <Logo linkTo={null} size="lg" className="relative h-16" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            BETA ACCESS AGREEMENT
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Thank you for participating in the EaseQuote.AI Beta Program.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            By continuing and using the application, you acknowledge that:
          </p>
          
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>This is a <strong>test version</strong>, not final, and may contain errors or limitations.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Access is provided <strong>100% free</strong> during the beta phase.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Features, pricing, layouts, and results may <strong>change without prior notice</strong>.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>You agree to use the system responsibly and understand that results are <strong>estimates, not guaranteed values</strong>.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Your usage data and feedback may be used to <strong>improve the platform</strong>.</span>
            </li>
          </ul>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Your participation helps us build a better product.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="beta-terms"
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked as boolean)}
              className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor="beta-terms"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I have read and understood the Beta Access terms
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!hasRead}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasRead ? '✓ AGREE & CONTINUE' : 'Please read and accept the terms'}
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground">
          By pressing AGREE, you confirm that you have read and accepted the Beta Access terms.
        </p>
      </DialogContent>
    </Dialog>
  )
}


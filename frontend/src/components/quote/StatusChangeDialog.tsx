import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { QuoteStatus } from '@/types/quote'
import { logAuditEvent } from '@/utils/audit'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'

interface StatusChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: QuoteStatus
  quoteId: string
  quoteNumber: string
  onStatusChanged: () => void
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  currentStatus,
  quoteId,
  quoteNumber,
  onStatusChanged,
}: StatusChangeDialogProps) {
  const { t } = useTranslation()
  const [newStatus, setNewStatus] = useState<QuoteStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
    { value: 'created', label: t('quote.statusChangeDialog.statusCreated') },
    { value: 'sent', label: t('quote.statusChangeDialog.statusSent') },
    { value: 'accepted', label: t('quote.statusChangeDialog.statusAccepted') },
    { value: 'rejected', label: t('quote.statusChangeDialog.statusRejected') },
    { value: 'in_progress', label: t('quote.statusChangeDialog.statusInProgress') },
    { value: 'completed', label: t('quote.statusChangeDialog.statusCompleted') },
  ]

  // Reset status when dialog opens or currentStatus changes
  useEffect(() => {
    if (open) {
      setNewStatus(currentStatus)
    }
  }, [open, currentStatus])

  const handleSave = async () => {
    if (newStatus === currentStatus) {
      onOpenChange(false)
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId)

      if (error) throw error

      // Log audit event
      await logAuditEvent({
        entity_type: 'quote',
        entity_id: quoteId,
        action: 'status_changed',
        old_values: { status: currentStatus },
        new_values: { status: newStatus },
      })

      toast({
        title: 'Success',
        description: 'Quote status updated successfully',
      })

      onStatusChanged()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusLabel = (status: QuoteStatus): string => {
    switch (status) {
      case 'created':
        return t('quote.statusChangeDialog.statusCreated')
      case 'sent':
        return t('quote.statusChangeDialog.statusSent')
      case 'accepted':
        return t('quote.statusChangeDialog.statusAccepted')
      case 'rejected':
        return t('quote.statusChangeDialog.statusRejected')
      case 'in_progress':
        return t('quote.statusChangeDialog.statusInProgress')
      case 'completed':
        return t('quote.statusChangeDialog.statusCompleted')
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('quote.statusChangeDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('quote.statusChangeDialog.description', { number: quoteNumber })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('quote.statusChangeDialog.currentStatus')}
            </label>
            <div className="text-sm text-muted-foreground">
              {getStatusLabel(currentStatus)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('quote.statusChangeDialog.newStatus')}
            </label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as QuoteStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={saving}
            className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || newStatus === currentStatus}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('quote.statusChangeDialog.updating')}
              </>
            ) : (
              t('quote.statusChangeDialog.updateStatus')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


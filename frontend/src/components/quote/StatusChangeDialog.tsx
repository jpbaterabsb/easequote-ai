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

interface StatusChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: QuoteStatus
  quoteId: string
  quoteNumber: string
  onStatusChanged: () => void
}

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export function StatusChangeDialog({
  open,
  onOpenChange,
  currentStatus,
  quoteId,
  quoteNumber,
  onStatusChanged,
}: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState<QuoteStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Quote Status</DialogTitle>
          <DialogDescription>
            Update the status for quote {quoteNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Status</label>
            <div className="text-sm text-muted-foreground capitalize">{currentStatus}</div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">New Status</label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || newStatus === currentStatus}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


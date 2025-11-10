import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { formatCurrency, formatRelativeDate } from '@/utils/format'
import { Quote } from '@/types/quote'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Edit, Mail, MessageSquare, RefreshCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StatusChangeDialog } from '@/components/quote/StatusChangeDialog'

interface QuoteCardProps {
  quote: Quote
  onDelete?: (quoteId: string) => void
  onStatusChanged?: () => void
}

export function QuoteCard({ quote, onDelete, onStatusChanged }: QuoteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const handleDelete = () => {
    if (onDelete) {
      onDelete(quote.id)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="group hover:shadow-elegant-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors duration-200">
                  {quote.quote_number}
                </h3>
                <StatusBadge status={quote.status} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1.5">{quote.customer_name}</p>
              {quote.customer_address && (
                <p className="text-sm text-muted-foreground truncate mb-3">
                  {quote.customer_address}
                  {quote.customer_city && `, ${quote.customer_city}`}
                  {quote.customer_state && `, ${quote.customer_state}`}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {formatCurrency(quote.total_amount)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatRelativeDate(quote.created_at)}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 hover:bg-primary/10 rounded-md transition-all duration-200 touch-manipulation hover:scale-110 active:scale-95"
                  aria-label="Quote actions menu"
                  aria-haspopup="true"
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/quotes/${quote.id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/quotes/${quote.id}/edit`} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Mail className="h-4 w-4 mr-2" />
                  Send via Email
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send via WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowStatusDialog(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Change Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <StatusChangeDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        currentStatus={quote.status}
        quoteId={quote.id}
        quoteNumber={quote.quote_number}
        onStatusChanged={() => {
          if (onStatusChanged) {
            onStatusChanged()
          }
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Quote"
        description={`Are you sure you want to delete quote ${quote.quote_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}


import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Quote } from '@/types/quote'
import { QuoteItem } from '@/types/quote-creation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import { ArrowLeft, Edit, Trash2, Loader2, FileDown, Mail } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusChangeDialog } from '@/components/quote/StatusChangeDialog'
import { LanguageSelectorModal, Language } from '@/components/quote/LanguageSelectorModal'
import { SendEmailModal } from '@/components/quote/SendEmailModal'
import { logAuditEvent } from '@/utils/audit'

interface QuoteItemWithId extends QuoteItem {
  id: string
}

export function ViewQuote() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [items, setItems] = useState<QuoteItemWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuote()
    }
  }, [id])

  const fetchQuote = async () => {
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

      setQuote(quoteData as Quote)

      // Fetch quote items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', id)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      setItems(
        (itemsData || []).map((item) => ({
          id: item.id,
          item_name: item.item_name,
          area: item.area,
          price_per_sqft: item.price_per_sqft,
          line_total: item.line_total,
          start_date: item.start_date || undefined,
          end_date: item.end_date || undefined,
          addons: (item.addons as any[]) || [],
        }))
      )
    } catch (error: any) {
      console.error('Error fetching quote:', error)
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

  const handleDelete = async () => {
    if (!quote) return

    try {
      setDeleting(true)

      const { error } = await supabase
        .from('quotes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', quote.id)

      if (error) throw error

      // Log audit event
      await logAuditEvent({
        entity_type: 'quote',
        entity_id: quote.id,
        action: 'deleted',
        old_values: { quote_number: quote.quote_number },
      })

      toast({
        title: 'Success',
        description: 'Quote deleted successfully',
      })

      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error deleting quote:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete quote. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleGeneratePdf = async (language: Language) => {
    if (!quote) return

    try {
      setGeneratingPdf(true)
      setShowLanguageModal(false)

      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          quote_id: quote.id,
          language,
        },
      })

      if (error) throw error

      if (data?.pdf_url) {
        // Download the PDF
        const link = document.createElement('a')
        link.href = data.pdf_url
        link.download = `Quote-${quote.quote_number}-${quote.customer_name.replace(/\s+/g, '-')}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: 'Success',
          description: 'PDF generated and downloaded successfully',
        })
      } else {
        throw new Error('No PDF URL returned')
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{quote.quote_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Created {formatDate(quote.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={quote.status} />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowLanguageModal(true)}
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowEmailModal(true)}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowStatusDialog(true)}
            >
              Change Status
            </Button>
            <Link to={`/quotes/${quote.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {quote.customer_name}
              </div>
              {quote.customer_phone && (
                <div>
                  <span className="font-medium">Phone:</span> {quote.customer_phone}
                </div>
              )}
              {quote.customer_email && (
                <div>
                  <span className="font-medium">Email:</span> {quote.customer_email}
                </div>
              )}
              {quote.customer_address && (
                <div>
                  <span className="font-medium">Address:</span>{' '}
                  {[
                    quote.customer_address,
                    quote.customer_city,
                    quote.customer_state,
                    quote.customer_zip,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <p className="text-muted-foreground">No items in this quote.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{item.item_name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {item.area.toFixed(2)} sq ft × {formatCurrency(item.price_per_sqft)}/sq
                          ft
                        </div>
                        {(item.start_date || item.end_date) && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.start_date && `Start: ${formatDate(item.start_date)}`}
                            {item.start_date && item.end_date && ' • '}
                            {item.end_date && `End: ${formatDate(item.end_date)}`}
                          </div>
                        )}
                      </div>
                      <div className="font-bold">{formatCurrency(item.line_total)}</div>
                    </div>
                    {item.addons.length > 0 && (
                      <div className="ml-4 mt-2 text-sm">
                        <div className="font-medium mb-1">Add-ons:</div>
                        {item.addons.map((addon) => (
                          <div key={addon.id} className="text-muted-foreground">
                            • {addon.name} - {formatCurrency(addon.price)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(quote.customer_provides_materials || quote.payment_method || quote.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Customer Provides Materials:</span>{' '}
                  {quote.customer_provides_materials ? 'Yes' : 'No'}
                </div>
                {!quote.customer_provides_materials && quote.material_cost > 0 && (
                  <div>
                    <span className="font-medium">Material Cost:</span>{' '}
                    {formatCurrency(quote.material_cost)}
                  </div>
                )}
                {quote.payment_method && (
                  <div>
                    <span className="font-medium">Payment Method:</span>{' '}
                    {quote.payment_method
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </div>
                )}
                {quote.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {quote.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              {!quote.customer_provides_materials && quote.material_cost > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Material Cost:</span>
                  <span>+{formatCurrency(quote.material_cost)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(quote.total_amount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LanguageSelectorModal
        open={showLanguageModal}
        onOpenChange={setShowLanguageModal}
        onLanguageSelect={handleGeneratePdf}
        loading={generatingPdf}
      />

      <SendEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        quoteId={quote.id}
        quoteNumber={quote.quote_number}
        customerName={quote.customer_name}
        customerEmail={quote.customer_email}
        onEmailSent={() => {
          toast({
            title: 'Success',
            description: 'Email sent successfully!',
          })
        }}
      />

      <StatusChangeDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        currentStatus={quote.status}
        quoteId={quote.id}
        quoteNumber={quote.quote_number}
        onStatusChanged={fetchQuote}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete quote {quote.quote_number}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


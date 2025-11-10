import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Quote } from '@/types/quote'
import { QuoteItem } from '@/types/quote-creation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import { ArrowLeft, Edit, Trash2, Loader2, FileDown, Mail, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StatusChangeDialog } from '@/components/quote/StatusChangeDialog'
import { LanguageSelectorModal, Language } from '@/components/quote/LanguageSelectorModal'
import { SendEmailModal } from '@/components/quote/SendEmailModal'
import { SendWhatsAppModal } from '@/components/quote/SendWhatsAppModal'
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
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  {quote.quote_number}
                </h1>
                <StatusBadge status={quote.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Created {formatDate(quote.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="gap-2 h-auto py-2.5 px-3 sm:px-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
              onClick={() => setShowLanguageModal(true)}
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs sm:text-sm">Generating...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Download PDF</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-auto py-2.5 px-3 sm:px-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
              onClick={() => setShowEmailModal(true)}
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Send Email</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-auto py-2.5 px-3 sm:px-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
              onClick={() => setShowWhatsAppModal(true)}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-auto py-2.5 px-3 sm:px-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
              onClick={() => setShowStatusDialog(true)}
            >
              <span className="text-xs sm:text-sm whitespace-nowrap">Change Status</span>
            </Button>
            <Link to={`/quotes/${quote.id}/edit`} className="contents">
              <Button 
                variant="outline" 
                className="gap-2 h-auto py-2.5 px-3 sm:px-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm whitespace-nowrap">Edit</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="gap-2 h-auto py-2.5 px-3 sm:px-4 relative overflow-hidden group bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 text-white font-semibold animate-pulse hover:animate-none col-span-2 sm:col-span-1 lg:col-span-1"
              onClick={() => setShowDeleteDialog(true)}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              <Trash2 className="h-4 w-4 relative z-10 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10 text-xs sm:text-sm whitespace-nowrap">Delete</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <Card className="shadow-elegant border-gray-200/50 bg-white/80 backdrop-blur-sm animate-slide-in-up">
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
          <Card className="shadow-elegant border-gray-200/50 bg-white/80 backdrop-blur-sm animate-slide-in-up stagger-1">
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
            <Card className="shadow-elegant border-gray-200/50 bg-white/80 backdrop-blur-sm animate-slide-in-up stagger-2">
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
          <Card className="shadow-elegant-lg border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm animate-slide-in-up stagger-3">
            <CardHeader>
              <CardTitle className="text-xl">Summary</CardTitle>
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
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Total:</span>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{formatCurrency(quote.total_amount)}</span>
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

      <SendWhatsAppModal
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
        quoteId={quote.id}
        quoteNumber={quote.quote_number}
        customerName={quote.customer_name}
        customerPhone={quote.customer_phone}
        totalAmount={quote.total_amount}
        onWhatsAppOpened={() => {
          toast({
            title: 'Success',
            description: 'WhatsApp opened! Complete sending the message.',
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

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Quote"
        description={`Are you sure you want to delete quote ${quote.quote_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}


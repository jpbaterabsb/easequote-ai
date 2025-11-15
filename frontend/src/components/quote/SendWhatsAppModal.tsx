import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageCircle, ExternalLink } from 'lucide-react'
import { LanguageSelectorModal, Language } from './LanguageSelectorModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency } from '@/utils/format'
import { useTranslation } from '@/hooks/useTranslation'

interface SendWhatsAppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteId: string
  quoteNumber: string
  customerName: string
  customerPhone?: string | null
  totalAmount: number
  onWhatsAppOpened?: () => void
}

// WhatsApp message templates by language
const messageTemplates = {
  en: (customerName: string, quoteNumber: string, totalAmount: number, pdfUrl: string) =>
    `Hello ${customerName}!

Here's your quote #${quoteNumber}.
Total: ${formatCurrency(totalAmount)}

View your quote: ${pdfUrl}

Let me know if you have any questions!`,
  es: (customerName: string, quoteNumber: string, totalAmount: number, pdfUrl: string) =>
    `¡Hola ${customerName}!

Aquí está tu presupuesto #${quoteNumber}.
Total: ${formatCurrency(totalAmount)}

Ver tu presupuesto: ${pdfUrl}

¡Avísame si tienes alguna pregunta!`,
  pt: (customerName: string, quoteNumber: string, totalAmount: number, pdfUrl: string) =>
    `Olá ${customerName}!

Aqui está seu orçamento #${quoteNumber}.
Total: ${formatCurrency(totalAmount)}

Ver seu orçamento: ${pdfUrl}

Avise-me se tiver alguma dúvida!`,
}

// Format phone number for display (adds formatting but keeps digits)
function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function SendWhatsAppModal({
  open,
  onOpenChange,
  quoteId,
  quoteNumber,
  customerName,
  customerPhone,
  totalAmount,
  onWhatsAppOpened,
}: SendWhatsAppModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [phone, setPhone] = useState(customerPhone || '')
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (open && customerPhone) {
      setPhone(customerPhone)
    }
  }, [open, customerPhone])

  useEffect(() => {
    // Generate preview message when language changes (without PDF URL initially)
    if (open) {
      // Use placeholder URL for preview
      const placeholderUrl = 'https://your-pdf-link-here.com'
      const template = messageTemplates[language]
      const previewMessage = template(customerName, quoteNumber, totalAmount, placeholderUrl)
      setMessage(previewMessage.replace(placeholderUrl, '[PDF link will be generated]'))
    }
  }, [open, language])

  const updateMessage = () => {
    if (pdfUrl) {
      const template = messageTemplates[language]
      const newMessage = template(customerName, quoteNumber, totalAmount, pdfUrl)
      setMessage(newMessage)
    }
  }

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage)
    setShowLanguageModal(false)
  }

  const getLanguageDisplayName = (lang: Language): string => {
    switch (lang) {
      case 'en':
        return `🇺🇸 ${t('quote.sendWhatsAppModal.english')}`
      case 'es':
        return `🇪🇸 ${t('quote.sendWhatsAppModal.spanish')}`
      case 'pt':
        return `🇧🇷 ${t('quote.sendWhatsAppModal.portuguese')}`
      default:
        return `🇺🇸 ${t('quote.sendWhatsAppModal.english')}`
    }
  }

  const handleOpenWhatsApp = async () => {
    if (!phone.trim()) {
      return
    }

    try {
      setGenerating(true)

      // Generate WhatsApp link (function handles PDF generation internally)
      const { data, error } = await supabase.functions.invoke('whatsapp-link', {
        body: {
          quote_id: quoteId,
          phone: phone.trim(),
          language,
        },
      })

      if (error) throw error

      if (data?.whatsapp_url) {
        // Update message preview with actual PDF URL
        if (data.pdf_url) {
          setPdfUrl(data.pdf_url)
          const template = messageTemplates[language]
          const updatedMessage = template(
            customerName,
            quoteNumber,
            totalAmount,
            data.pdf_url
          )
          setMessage(updatedMessage)
        }

        // Open WhatsApp in new tab
        window.open(data.whatsapp_url, '_blank')

        onWhatsAppOpened?.()
        onOpenChange(false)
      } else {
        throw new Error('No WhatsApp URL returned')
      }
    } catch (error: any) {
      console.error('Error opening WhatsApp:', error)
      alert(error.message || 'Failed to open WhatsApp. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('quote.sendWhatsAppModal.title')}
            </DialogTitle>
            <DialogDescription>
              {t('quote.sendWhatsAppModal.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">{t('quote.sendWhatsAppModal.phoneNumber')}</Label>
              <Input
                id="whatsapp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('quote.sendWhatsAppModal.phoneNumberPlaceholder')}
                disabled={generating}
              />
              <p className="text-xs text-muted-foreground">
                {t('quote.sendWhatsAppModal.phoneNumberHelper')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-language">{t('quote.sendWhatsAppModal.language')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLanguageModal(true)}
                  disabled={generating}
                >
                  {getLanguageDisplayName(language)}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">{t('quote.sendWhatsAppModal.messagePreview')}</Label>
              <Textarea
                id="whatsapp-message"
                value={message || t('quote.sendWhatsAppModal.generatingMessage')}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('quote.sendWhatsAppModal.messagePlaceholder')}
                rows={10}
                disabled={generating}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {t('quote.sendWhatsAppModal.messageHelper')}
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('quote.sendWhatsAppModal.howItWorks')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('quote.sendWhatsAppModal.howItWorksDescription')}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={generating}
              className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleOpenWhatsApp} disabled={generating || !phone.trim()}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('quote.sendWhatsAppModal.generating')}
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('quote.sendWhatsAppModal.openWhatsApp')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LanguageSelectorModal
        open={showLanguageModal}
        onOpenChange={setShowLanguageModal}
        onLanguageSelect={handleLanguageSelect}
        loading={false}
      />
    </>
  )
}


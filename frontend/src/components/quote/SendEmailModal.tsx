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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, FileText } from 'lucide-react'
import { LanguageSelectorModal } from './LanguageSelectorModal'
import type { Language } from './LanguageSelectorModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'

interface SendEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteId: string
  quoteNumber: string
  customerName: string
  customerEmail?: string | null
  onEmailSent?: () => void
}

const emailTemplates = {
  en: {
    subject: (quoteNumber: string, businessName: string) =>
      `Quote #${quoteNumber} from ${businessName}`,
    body: (customerName: string, businessName: string, userPhone?: string) => `Hello ${customerName},

Thank you for your interest! Please find attached your quote.

If you have any questions, feel free to reach out.

Best regards,
${businessName}${userPhone ? `\n${userPhone}` : ''}`,
  },
  es: {
    subject: (quoteNumber: string, businessName: string) =>
      `Presupuesto #${quoteNumber} de ${businessName}`,
    body: (customerName: string, businessName: string, userPhone?: string) => `Hola ${customerName},

¡Gracias por tu interés! Adjunto encontrarás tu presupuesto.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos cordiales,
${businessName}${userPhone ? `\n${userPhone}` : ''}`,
  },
  pt: {
    subject: (quoteNumber: string, businessName: string) =>
      `Orçamento #${quoteNumber} de ${businessName}`,
    body: (customerName: string, businessName: string, userPhone?: string) => `Olá ${customerName},

Obrigado pelo seu interesse! Segue em anexo seu orçamento.

Se tiver alguma dúvida, sinta-se à vontade para entrar em contato.

Atenciosamente,
${businessName}${userPhone ? `\n${userPhone}` : ''}`,
  },
}

export function SendEmailModal({
  open,
  onOpenChange,
  quoteId,
  quoteNumber,
  customerName,
  customerEmail,
  onEmailSent,
}: SendEmailModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [recipientEmail, setRecipientEmail] = useState(customerEmail || '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [profile, setProfile] = useState<{ full_name?: string; phone?: string; business_name?: string } | null>(null)
  const [showMaterialPrices, setShowMaterialPrices] = useState(false) // Padrão: escondido

  useEffect(() => {
    if (open && user) {
      loadProfile()
    }
  }, [open, user])

  useEffect(() => {
    if (open && profile) {
      updateEmailContent()
    }
  }, [open, language, profile])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, business_name')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const updateEmailContent = () => {
    const businessName = profile?.business_name || profile?.full_name || user?.email?.split('@')[0] || 'EaseQuote AI'
    const template = emailTemplates[language]
    setSubject(template.subject(quoteNumber, businessName))
    setBody(template.body(customerName, businessName, profile?.phone))
  }

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case 'en':
        return t('quote.sendEmailModal.english')
      case 'es':
        return t('quote.sendEmailModal.spanish')
      case 'pt':
        return t('quote.sendEmailModal.portuguese')
      default:
        return t('quote.sendEmailModal.english')
    }
  }

  const getLanguageDisplayName = (lang: Language): string => {
    switch (lang) {
      case 'en':
        return `🇺🇸 ${t('quote.sendEmailModal.english')}`
      case 'es':
        return `🇪🇸 ${t('quote.sendEmailModal.spanish')}`
      case 'pt':
        return `🇧🇷 ${t('quote.sendEmailModal.portuguese')}`
      default:
        return `🇺🇸 ${t('quote.sendEmailModal.english')}`
    }
  }

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage)
    setShowLanguageModal(false)
  }

  const handleSend = async () => {
    if (!recipientEmail.trim()) {
      return
    }

    try {
      setSending(true)

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          quote_id: quoteId,
          recipient_email: recipientEmail.trim(),
          subject: subject.trim(),
          body: body.trim(),
          language,
          show_material_prices: showMaterialPrices,
        },
      })

      if (error) throw error

      if (data?.success) {
        onEmailSent?.()
        onOpenChange(false)
        // Reset form
        setRecipientEmail(customerEmail || '')
        setLanguage('en')
        updateEmailContent()
      } else {
        throw new Error(data?.error || 'Failed to send email')
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      alert(error.message || 'Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('quote.sendEmailModal.title')}
            </DialogTitle>
            <DialogDescription>
              {t('quote.sendEmailModal.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-email">{t('quote.sendEmailModal.to')}</Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={t('quote.sendEmailModal.emailPlaceholder')}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="language">{t('quote.sendEmailModal.language')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLanguageModal(true)}
                  disabled={sending}
                >
                  {getLanguageDisplayName(language)}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="show-material-prices-email"
                checked={showMaterialPrices}
                onCheckedChange={(checked) => setShowMaterialPrices(checked === true)}
                disabled={sending}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="show-material-prices-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t('quote.languageSelectorModal.showMaterialPrices')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('quote.languageSelectorModal.showMaterialPricesDescription')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t('quote.sendEmailModal.subject')}</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('quote.sendEmailModal.subjectPlaceholder')}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">{t('quote.sendEmailModal.message')}</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('quote.sendEmailModal.messagePlaceholder')}
                rows={8}
                disabled={sending}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('quote.sendEmailModal.pdfAttachment')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('quote.sendEmailModal.pdfAttachmentDescription', {
                    number: quoteNumber,
                    language: getLanguageName(language),
                  })}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={sending}
              className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSend} disabled={sending || !recipientEmail.trim()}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('quote.sendEmailModal.sending')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('quote.sendEmailModal.sendEmail')}
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


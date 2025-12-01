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
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export type Language = 'en' | 'es' | 'pt'

interface LanguageOption {
  code: Language
  name: string
  flag: string
}

interface LanguageSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLanguageSelect: (language: Language, showMaterialPrices: boolean) => void
  loading?: boolean
  showMaterialPricesOption?: boolean // Se true, mostra a opção de preços de materiais
}

export function LanguageSelectorModal({
  open,
  onOpenChange,
  onLanguageSelect,
  loading = false,
  showMaterialPricesOption = false,
}: LanguageSelectorModalProps) {
  const { t } = useTranslation()
  const [showMaterialPrices, setShowMaterialPrices] = useState(false) // Padrão: escondido

  const languages: LanguageOption[] = [
    { code: 'en', name: t('quote.languageSelectorModal.english'), flag: '🇺🇸' },
    { code: 'es', name: t('quote.languageSelectorModal.spanish'), flag: '🇪🇸' },
    { code: 'pt', name: t('quote.languageSelectorModal.portuguese'), flag: '🇧🇷' },
  ]

  const handleLanguageSelect = (lang: Language) => {
    onLanguageSelect(lang, showMaterialPrices)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('quote.languageSelectorModal.title')}</DialogTitle>
          <DialogDescription>
            {t('quote.languageSelectorModal.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="w-full justify-start h-auto py-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={loading}
              >
                <span className="text-2xl mr-3">{lang.flag}</span>
                <span className="text-lg">{lang.name}</span>
              </Button>
            ))}
          </div>
          
          {showMaterialPricesOption && (
            <div className="flex items-start space-x-2 pt-4 border-t">
              <Checkbox
                id="show-material-prices"
                checked={showMaterialPrices}
                onCheckedChange={(checked) => setShowMaterialPrices(checked === true)}
                disabled={loading}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="show-material-prices"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t('quote.languageSelectorModal.showMaterialPrices')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('quote.languageSelectorModal.showMaterialPricesDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
            className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {t('common.cancel')}
          </Button>
        </DialogFooter>
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


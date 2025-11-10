import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export type Language = 'en' | 'es' | 'pt'

interface LanguageOption {
  code: Language
  name: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
]

interface LanguageSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLanguageSelect: (language: Language) => void
  loading?: boolean
}

export function LanguageSelectorModal({
  open,
  onOpenChange,
  onLanguageSelect,
  loading = false,
}: LanguageSelectorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Language for PDF</DialogTitle>
          <DialogDescription>
            Choose the language for your quote PDF. The content will be automatically translated.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 py-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="outline"
              className="w-full justify-start h-auto py-4 border-gray-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
              onClick={() => onLanguageSelect(lang.code)}
              disabled={loading}
            >
              <span className="text-2xl mr-3">{lang.flag}</span>
              <span className="text-lg">{lang.name}</span>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
            className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
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


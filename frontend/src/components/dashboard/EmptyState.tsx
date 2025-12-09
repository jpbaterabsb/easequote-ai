import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t('dashboard.noQuotes')}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {t('dashboard.noQuotesDescriptionFull')}
      </p>
      <Link to="/quotes/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          {t('dashboard.createQuote')}
        </Button>
      </Link>
    </div>
  )
}


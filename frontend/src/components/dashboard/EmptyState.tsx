import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No quotes yet!</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Create your first quote to get started. You can send professional quotes via email or
        WhatsApp.
      </p>
      <Link to="/quotes/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Quote
        </Button>
      </Link>
    </div>
  )
}


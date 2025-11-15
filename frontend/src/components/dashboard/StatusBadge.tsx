import { cn } from '@/lib/utils'
import type { QuoteStatus } from '@/types/quote'

interface StatusBadgeProps {
  status: QuoteStatus
  className?: string
}

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  created: {
    label: 'CREATED',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  sent: {
    label: 'SENT',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  accepted: {
    label: 'ACCEPTED',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  rejected: {
    label: 'REJECTED',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  in_progress: {
    label: 'IN PROGRESS',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  completed: {
    label: 'COMPLETED',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}


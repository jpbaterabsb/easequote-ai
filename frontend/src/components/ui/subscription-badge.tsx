import { cn } from '@/lib/utils'
import { Crown, Sparkles } from 'lucide-react'

interface SubscriptionBadgeProps {
  plan: 'pro' | 'gold' | string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showIcon?: boolean
}

export function SubscriptionBadge({ 
  plan, 
  size = 'sm', 
  className,
  showIcon = true 
}: SubscriptionBadgeProps) {
  if (!plan || (plan !== 'pro' && plan !== 'gold')) {
    return null
  }

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }

  if (plan === 'gold') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 font-bold rounded-full',
          'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400',
          'text-amber-900 shadow-sm',
          'border border-amber-300/50',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <Crown className={cn(iconSizes[size], 'fill-amber-600')} />}
        GOLD
      </span>
    )
  }

  // Pro badge
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-bold rounded-full',
        'bg-gradient-to-r from-primary via-primary/90 to-primary',
        'text-white shadow-sm',
        'border border-primary/30',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Sparkles className={cn(iconSizes[size], 'fill-white/30')} />}
      PRO
    </span>
  )
}

// Mini badge for avatar overlay
export function SubscriptionBadgeMini({ 
  plan 
}: { 
  plan: 'pro' | 'gold' | string | null | undefined 
}) {
  if (!plan || (plan !== 'pro' && plan !== 'gold')) {
    return null
  }

  if (plan === 'gold') {
    return (
      <span
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center 
          w-4 h-4 rounded-full 
          bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500
          border-2 border-white shadow-sm"
      >
        <Crown className="w-2.5 h-2.5 text-amber-800 fill-amber-600" />
      </span>
    )
  }

  return (
    <span
      className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center 
        w-4 h-4 rounded-full 
        bg-gradient-to-br from-primary to-primary/80
        border-2 border-white shadow-sm"
    >
      <Sparkles className="w-2.5 h-2.5 text-white fill-white/30" />
    </span>
  )
}


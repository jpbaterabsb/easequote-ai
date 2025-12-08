import { Link } from 'react-router-dom'
import { Settings, LogOut, Home } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/hooks/useTranslation'
import { SubscriptionBadge, SubscriptionBadgeMini } from '@/components/ui/subscription-badge'

interface UserMenuProps {
  userEmail?: string | null
  avatarUrl?: string | null
  fullName?: string | null
  subscriptionPlan?: string | null
  onSignOut: () => void
}

export function UserMenu({ userEmail, avatarUrl, fullName, subscriptionPlan, onSignOut }: UserMenuProps) {
  const { t } = useTranslation()

  // Get initials from full name or email
  const getInitials = () => {
    if (fullName) {
      const names = fullName.trim().split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return fullName.substring(0, 2).toUpperCase()
    }
    if (userEmail) {
      return userEmail.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 hover:opacity-80">
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-gray-200 hover:border-primary/50 transition-colors">
              <AvatarImage src={avatarUrl || undefined} alt={fullName || userEmail || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <SubscriptionBadgeMini plan={subscriptionPlan} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2">
              {fullName && (
                <p className="text-sm font-medium leading-none">{fullName}</p>
              )}
              <SubscriptionBadge plan={subscriptionPlan} size="sm" />
            </div>
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/" className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            <span>{t('dashboard.title')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings.title')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('common.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


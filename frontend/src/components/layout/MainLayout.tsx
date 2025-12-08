import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Settings, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { LanguageSelector } from '@/components/ui/language-selector'
import { UserMenu } from '@/components/ui/user-menu'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState<{ 
    avatar_url?: string
    full_name?: string
    subscription_plan?: string 
  } | null>(null)

  const isSettingsPage = location.pathname === '/settings'

  // Reload profile when navigating (especially after updating avatar in Settings)
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user, location.pathname])

  const loadProfile = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, subscription_plan')
        .eq('id', user.id)
        .single()
      if (data) {
        // Add cache-busting timestamp to avatar URL to ensure fresh image
        const avatarUrl = data.avatar_url 
          ? `${data.avatar_url}?t=${Date.now()}` 
          : undefined
        setProfile({ ...data, avatar_url: avatarUrl })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between animate-slide-in-down">
          <Logo linkTo="/dashboard" size="lg" />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {isSettingsPage ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <UserMenu
              userEmail={user?.email}
              avatarUrl={profile?.avatar_url}
              fullName={profile?.full_name}
              subscriptionPlan={profile?.subscription_plan}
              onSignOut={signOut}
            />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}


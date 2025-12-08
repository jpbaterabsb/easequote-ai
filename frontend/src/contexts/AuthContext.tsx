import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { BetaAgreementModal } from '@/components/ui/beta-agreement-modal'

const BETA_AGREEMENT_KEY = 'easequote_beta_agreement_accepted'
const BETA_AGREEMENT_VERSION = '1.0' // Increment this to force re-acceptance

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  hasBetaAccess: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [betaAccepted, setBetaAccepted] = useState(false)
  const [showBetaModal, setShowBetaModal] = useState(false)
  const { setUser: setStoreUser } = useAuthStore()

  // Check if user has accepted beta agreement
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(BETA_AGREEMENT_KEY)
      if (stored) {
        try {
          const { userId, version } = JSON.parse(stored)
          if (userId === user.id && version === BETA_AGREEMENT_VERSION) {
            setBetaAccepted(true)
            setShowBetaModal(false)
            return
          }
        } catch {
          // Invalid stored data
        }
      }
      // User hasn't accepted or version changed
      setBetaAccepted(false)
      setShowBetaModal(true)
    } else {
      setBetaAccepted(false)
      setShowBetaModal(false)
    }
  }, [user])

  const handleBetaAccept = async () => {
    if (user) {
      // Store acceptance in localStorage
      localStorage.setItem(
        BETA_AGREEMENT_KEY,
        JSON.stringify({
          userId: user.id,
          version: BETA_AGREEMENT_VERSION,
          acceptedAt: new Date().toISOString(),
        })
      )
      
      // Also update profile in database (optional, for record keeping)
      try {
        await supabase
          .from('profiles')
          .update({
            beta_agreement_accepted: true,
            beta_agreement_date: new Date().toISOString(),
            beta_agreement_version: BETA_AGREEMENT_VERSION,
          })
          .eq('id', user.id)
      } catch (error) {
        // Silently fail - localStorage is the primary storage
        console.warn('Failed to save beta agreement to profile:', error)
      }
      
      setBetaAccepted(true)
      setShowBetaModal(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStoreUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStoreUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setStoreUser])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setStoreUser(null)
    setBetaAccepted(false)
  }

  const hasBetaAccess = betaAccepted || !user

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, hasBetaAccess }}>
      {children}
      <BetaAgreementModal open={showBetaModal} onAccept={handleBetaAccept} />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


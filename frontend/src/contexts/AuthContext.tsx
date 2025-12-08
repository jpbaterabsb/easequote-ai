import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { BetaAgreementModal } from '@/components/ui/beta-agreement-modal'
import { SubscriptionRequiredModal } from '@/components/ui/subscription-required-modal'

const BETA_AGREEMENT_KEY = 'easequote_beta_agreement_accepted'
const BETA_AGREEMENT_VERSION = '1.0' // Increment this to force re-acceptance

// Valid subscription statuses that allow access
const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing']

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  subscriptionLoading: boolean
  signOut: () => Promise<void>
  hasBetaAccess: boolean
  hasActiveSubscription: boolean
  subscriptionStatus: string | null
  refreshSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  // Track if subscription has been checked for the CURRENT user
  // null = not checked yet, string = user id that was checked
  const [subscriptionCheckedForUser, setSubscriptionCheckedForUser] = useState<string | null>(null)
  const [betaAccepted, setBetaAccepted] = useState(false)
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const { setUser: setStoreUser } = useAuthStore()
  
  // Subscription is loading if there's a user but we haven't checked subscription for this user yet
  const subscriptionLoading = user !== null && subscriptionCheckedForUser !== user.id

  // Fetch subscription status from profile
  // Returns effective status considering:
  // - active/trialing = has access
  // - canceled = has access UNTIL subscription_end_date
  // - past_due/inactive/incomplete = no access
  const fetchSubscriptionStatus = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_id, subscription_status, subscription_end_date')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Failed to fetch subscription status:', error)
        return 'inactive'
      }

      // User must have a subscription_id
      if (!profile?.subscription_id) {
        console.log('User has no subscription_id - treating as inactive')
        return 'inactive'
      }

      const status = profile?.subscription_status || 'inactive'
      
      // Handle canceled subscriptions - user still has access until end date
      if (status === 'canceled' && profile?.subscription_end_date) {
        const endDate = new Date(profile.subscription_end_date)
        const now = new Date()
        
        if (endDate > now) {
          console.log('Subscription canceled but still within paid period until:', endDate)
          return 'active' // Treat as active until period ends
        } else {
          console.log('Subscription canceled and period has ended')
          return 'inactive'
        }
      }

      // Return the actual status
      return status
    } catch (error) {
      console.warn('Error fetching subscription:', error)
      return 'inactive'
    }
  }, [])

  // Check subscription and beta agreement when user changes
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        // Check beta agreement first
        const stored = localStorage.getItem(BETA_AGREEMENT_KEY)
        let isBetaAccepted = false
        
        if (stored) {
          try {
            const { userId, version } = JSON.parse(stored)
            if (userId === user.id && version === BETA_AGREEMENT_VERSION) {
              isBetaAccepted = true
            }
          } catch {
            // Invalid stored data
          }
        }
        
        setBetaAccepted(isBetaAccepted)
        
        // If beta not accepted, show beta modal first
        if (!isBetaAccepted) {
          setShowBetaModal(true)
          setShowSubscriptionModal(false)
          // Mark subscription as checked for this user (even though we're showing beta modal)
          setSubscriptionCheckedForUser(user.id)
          return
        }
        
        setShowBetaModal(false)
        
        // Check subscription status
        const status = await fetchSubscriptionStatus(user.id)
        setSubscriptionStatus(status)
        
        // Show subscription modal if not active
        const hasActive = status && ACTIVE_SUBSCRIPTION_STATUSES.includes(status)
        setShowSubscriptionModal(!hasActive)
        
        // Mark subscription as checked for this user
        setSubscriptionCheckedForUser(user.id)
      } else {
        setBetaAccepted(false)
        setShowBetaModal(false)
        setSubscriptionStatus(null)
        setShowSubscriptionModal(false)
        setSubscriptionCheckedForUser(null)
      }
    }
    
    checkUserStatus()
  }, [user, fetchSubscriptionStatus])

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
      
      // After beta acceptance, check subscription
      const status = await fetchSubscriptionStatus(user.id)
      setSubscriptionStatus(status)
      const hasActive = status && ACTIVE_SUBSCRIPTION_STATUSES.includes(status)
      setShowSubscriptionModal(!hasActive)
    }
  }

  // Refresh subscription status (can be called after successful payment)
  const refreshSubscription = useCallback(async () => {
    if (user) {
      // Temporarily mark as not checked to show loading
      setSubscriptionCheckedForUser(null)
      const status = await fetchSubscriptionStatus(user.id)
      setSubscriptionStatus(status)
      const hasActive = status && ACTIVE_SUBSCRIPTION_STATUSES.includes(status)
      setShowSubscriptionModal(!hasActive)
      setSubscriptionCheckedForUser(user.id)
    }
  }, [user, fetchSubscriptionStatus])

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
    setSubscriptionStatus(null)
    setShowSubscriptionModal(false)
    setSubscriptionCheckedForUser(null)
  }

  const hasBetaAccess = betaAccepted || !user
  const hasActiveSubscription = subscriptionStatus !== null && ACTIVE_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading,
      subscriptionLoading,
      signOut, 
      hasBetaAccess,
      hasActiveSubscription,
      subscriptionStatus,
      refreshSubscription,
    }}>
      {children}
      <BetaAgreementModal open={showBetaModal} onAccept={handleBetaAccept} />
      <SubscriptionRequiredModal 
        open={showSubscriptionModal && !showBetaModal} 
        onSignOut={signOut}
        userEmail={user?.email}
      />
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



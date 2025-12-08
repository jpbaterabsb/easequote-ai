import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { ImageUpload } from '@/components/settings/ImageUpload'
import { AddressInput } from '@/components/ui/address-input'
import { useToast } from '@/hooks/useToast'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useTranslation } from '@/hooks/useTranslation'
import { MainLayout } from '@/components/layout/MainLayout'
import { AlertTriangle, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  businessName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  language: z.enum(['en', 'es', 'pt']),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

function SettingsContent() {
  const { user, refreshSubscription } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false)
  const [showReactivateDialog, setShowReactivateDialog] = useState(false)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [reactivatingSubscription, setReactivatingSubscription] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [hasChanges, setHasChanges] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      address: '',
      language: 'en',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setProfile(data)
      profileForm.reset({
        fullName: data.full_name || '',
        businessName: data.business_name || '',
        email: user?.email || '',
        phone: data.phone || '',
        address: data.address || '',
        language: data.language || 'en',
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('settings.failedToLoadProfile'),
      })
    }
  }

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          business_name: data.businessName || null,
          phone: data.phone || null,
          address: data.address || null,
          language: data.language,
        })
        .eq('id', user?.id)

      if (profileError) throw profileError

      // Update email if changed
      if (data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        })
        if (emailError) throw emailError
        toast({
          title: t('settings.emailUpdate'),
          description: t('settings.emailUpdateDescription'),
        })
      }

      toast({
        variant: 'success',
        title: t('common.success'),
        description: t('settings.profileUpdated'),
      })
      setHasChanges(false)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('settings.failedToUpdateProfile'),
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setLoading(true)
    try {
      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      })

      if (verifyError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) throw updateError

      toast({
        variant: 'success',
        title: t('common.success'),
        description: t('settings.passwordUpdated'),
      })

      passwordForm.reset()
      setNewPassword('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('settings.failedToUpdatePassword'),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`
    const filePath = fileName

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update profile with the base URL (without cache buster)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Reload profile to update local state
    await loadProfile()

    // Return URL with cache-busting timestamp for immediate preview
    return `${data.publicUrl}?t=${Date.now()}`
  }

  const handleAvatarRemove = async () => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id)

    if (error) throw error
  }

  const handleLogoUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/logo.${fileExt}`
    const filePath = fileName

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage.from('logos').getPublicUrl(filePath)

    // Update profile with the base URL (without cache buster)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ company_logo_url: data.publicUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Reload profile to update local state
    await loadProfile()

    // Return URL with cache-busting timestamp for immediate preview
    return `${data.publicUrl}?t=${Date.now()}`
  }

  const handleLogoRemove = async () => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ company_logo_url: null })
      .eq('id', user.id)

    if (error) throw error
  }

  const handleCancelSubscription = async () => {
    setCancelingSubscription(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ cancelImmediately: false }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription')
      }

      toast({
        variant: 'success',
        title: t('settings.subscriptionCanceled'),
        description: result.message,
      })

      setShowCancelSubscriptionDialog(false)
      
      // Wait for Stripe webhook to process and update our database
      // Stripe sends webhook events within seconds
      console.log('Waiting for Stripe webhook to update database...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reload profile with fresh data
      await loadProfile()
      await refreshSubscription()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('settings.failedToCancelSubscription'),
      })
    } finally {
      setCancelingSubscription(false)
    }
  }

  // Helper functions for subscription display
  const getPlanName = () => {
    if (!profile?.stripe_price_id) return 'No Plan'
    
    const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY
    const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY
    
    if (profile.stripe_price_id === monthlyPriceId) return 'Pro Monthly'
    if (profile.stripe_price_id === yearlyPriceId) return 'Pro Annual'
    
    // Fallback to subscription_plan field
    if (profile.subscription_plan === 'pro') return 'Pro'
    if (profile.subscription_plan === 'gold') return 'Gold'
    
    return profile.subscription_plan || 'Pro'
  }

  const getPlanPrice = () => {
    const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY
    const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY
    
    if (profile?.stripe_price_id === monthlyPriceId) return '$29.90/month'
    if (profile?.stripe_price_id === yearlyPriceId) return '$319.90/year'
    
    return ''
  }

  const getStatusBadge = () => {
    const status = profile?.subscription_status
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> {t('settings.statusActive')}</Badge>
      case 'canceled':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" /> {t('settings.statusCanceled')}</Badge>
      case 'past_due':
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertTriangle className="w-3 h-3 mr-1" /> {t('settings.statusPastDue')}</Badge>
      case 'incomplete':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> {t('settings.statusIncomplete')}</Badge>
      case 'trialing':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="w-3 h-3 mr-1" /> {t('settings.statusTrial')}</Badge>
      default:
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> {t('settings.statusInactive')}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isSubscriptionActive = () => {
    const status = profile?.subscription_status
    return status === 'active' || status === 'trialing'
  }

  const isSubscriptionCanceled = () => {
    return profile?.subscription_status === 'canceled'
  }

  const handleReactivateSubscription = async () => {
    setReactivatingSubscription(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // First, try to reactivate the existing subscription (if it's just scheduled to cancel)
      const reactivateResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reactivate-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      const reactivateResult = await reactivateResponse.json()

      if (!reactivateResponse.ok) {
        throw new Error(reactivateResult.error || 'Failed to reactivate subscription')
      }

      // If reactivation was successful (subscription was just scheduled to cancel)
      if (reactivateResult.reactivated) {
        toast({
          variant: 'success',
          title: t('settings.subscriptionReactivated'),
          description: t('settings.subscriptionReactivatedNoPayment'),
        })
        setShowReactivateDialog(false)
        
        // Wait for Stripe webhook to update database
        console.log('Waiting for Stripe webhook to update database...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        await loadProfile()
        await refreshSubscription()
        return
      }

      // If subscription is already active
      if (reactivateResult.success && !reactivateResult.needsNewSubscription) {
        toast({
          variant: 'success',
          title: t('settings.subscriptionAlreadyActive'),
          description: reactivateResult.message,
        })
        setShowReactivateDialog(false)
        await loadProfile()
        await refreshSubscription()
        return
      }

      // If we need a new subscription, create a checkout session
      if (reactivateResult.needsNewSubscription) {
        const priceId = selectedPlan === 'monthly' 
          ? import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY 
          : import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY

        if (!priceId) {
          throw new Error('Price ID not configured')
        }

        const checkoutResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              priceId,
              successUrl: `${window.location.origin}/settings?payment=success`,
              cancelUrl: `${window.location.origin}/settings?payment=cancelled`,
            }),
          }
        )

        const checkoutResult = await checkoutResponse.json()

        if (!checkoutResponse.ok) {
          throw new Error(checkoutResult.error || 'Failed to create checkout session')
        }

        if (checkoutResult.url) {
          window.location.href = checkoutResult.url
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to reactivate subscription',
      })
    } finally {
      setReactivatingSubscription(false)
    }
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="shadow-xl shadow-gray-300/40 border-gray-100 bg-white">
            <CardHeader>
              <CardTitle>{t('settings.title')}</CardTitle>
              <CardDescription>{t('settings.manageAccount')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
                  <TabsTrigger value="password">{t('settings.password')}</TabsTrigger>
                  <TabsTrigger value="branding">{t('settings.branding')}</TabsTrigger>
                  <TabsTrigger value="subscription">{t('settings.subscription')}</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-6">
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('settings.fullNameRequired')}</Label>
                      <Input
                        id="fullName"
                        {...profileForm.register('fullName', {
                          onChange: () => setHasChanges(true),
                        })}
                      />
                      {profileForm.formState.errors.fullName && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">{t('settings.businessName')}</Label>
                      <Input
                        id="businessName"
                        {...profileForm.register('businessName', {
                          onChange: () => setHasChanges(true),
                        })}
                        placeholder={t('settings.businessNamePlaceholder')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('common.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register('email', {
                          onChange: () => setHasChanges(true),
                        })}
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('settings.emailVerificationRequired')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('settings.phoneNumber')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...profileForm.register('phone', {
                          onChange: () => setHasChanges(true),
                        })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">{t('settings.businessAddress')}</Label>
                      <Controller
                        name="address"
                        control={profileForm.control}
                        render={({ field }) => (
                          <AddressInput
                            id="address"
                            value={field.value || ''}
                            onChange={(value) => {
                              field.onChange(value)
                              setHasChanges(true)
                            }}
                            placeholder={t('settings.addressPlaceholder')}
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">{t('settings.language')}</Label>
                      <Select
                        value={profileForm.watch('language')}
                        onValueChange={(value) => {
                          profileForm.setValue('language', value as 'en' | 'es' | 'pt')
                          setHasChanges(true)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('settings.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇺🇸 {t('common.english')}</SelectItem>
                          <SelectItem value="es">🇪🇸 {t('common.spanish')}</SelectItem>
                          <SelectItem value="pt">🇧🇷 {t('common.portuguese')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading || !hasChanges}>
                        {loading ? t('settings.saving') : t('settings.saveChanges')}
                      </Button>
                      {hasChanges && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCancelDialog(true)}
                        >
                          {t('common.cancel')}
                        </Button>
                      )}
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="space-y-4 mt-6">
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t('settings.currentPasswordRequired')}</Label>
                      <PasswordInput
                        id="currentPassword"
                        {...passwordForm.register('currentPassword')}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-600">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t('settings.newPasswordRequired')}</Label>
                      <PasswordInput
                        id="newPassword"
                        {...passwordForm.register('newPassword')}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          passwordForm.register('newPassword').onChange(e)
                        }}
                      />
                      <PasswordStrengthIndicator password={newPassword} />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-600">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
                      <PasswordInput
                        id="confirmPassword"
                        {...passwordForm.register('confirmPassword')}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? t('settings.updating') : t('settings.updatePassword')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4 mt-6">
                  <div className="space-y-6">
                    <ImageUpload
                      label={t('settings.profilePicture')}
                      currentUrl={profile?.avatar_url}
                      onUpload={handleAvatarUpload}
                      onRemove={handleAvatarRemove}
                      maxWidth={200}
                      maxHeight={200}
                      maxSizeMB={2}
                    />

                    <ImageUpload
                      label={t('settings.companyLogo')}
                      currentUrl={profile?.company_logo_url}
                      onUpload={handleLogoUpload}
                      onRemove={handleLogoRemove}
                      maxWidth={400}
                      maxHeight={400}
                      maxSizeMB={2}
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('settings.companyLogoDescription')}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6 mt-6">
                  <div className="space-y-6">
                    {/* Canceled Subscription Warning */}
                    {isSubscriptionCanceled() && (
                      <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-full bg-amber-100">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-amber-800">
                              {t('settings.subscriptionCanceledTitle')}
                            </h3>
                            <p className="text-sm text-amber-700">
                              {t('settings.subscriptionCanceledMessage', { date: formatDate(profile?.subscription_end_date) })}
                            </p>
                            <Button
                              onClick={() => setShowReactivateDialog(true)}
                              className="mt-3 bg-primary hover:bg-primary/90"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              {t('settings.reactivateSubscription')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Plan Card */}
                    <div className={`rounded-xl border-2 p-6 shadow-sm ${
                      isSubscriptionCanceled() 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                            <CreditCard className="w-5 h-5 text-primary" />
                            {t('settings.currentPlan')}
                          </h3>
                          <p className={`text-2xl font-bold ${isSubscriptionCanceled() ? 'text-gray-500' : 'text-primary'}`}>
                            {getPlanName()}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {getPlanPrice()}
                          </p>
                        </div>
                        <div>
                          {getStatusBadge()}
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary/70" />
                          <span className="text-sm font-medium">{t('settings.subscriptionStartDate')}</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatDate(profile?.created_at)}
                        </p>
                      </div>

                      <div className={`rounded-xl border p-4 space-y-2 ${
                        isSubscriptionCanceled() 
                          ? 'border-amber-200 bg-amber-50/50' 
                          : 'border-gray-100 bg-gray-50/50'
                      }`}>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className={`w-4 h-4 ${isSubscriptionCanceled() ? 'text-amber-600' : 'text-primary/70'}`} />
                          <span className="text-sm font-medium">
                            {isSubscriptionCanceled() 
                              ? t('settings.accessUntil')
                              : t('settings.nextBillingDate')}
                          </span>
                        </div>
                        <p className={`text-lg font-semibold ${isSubscriptionCanceled() ? 'text-amber-700' : 'text-gray-800'}`}>
                          {formatDate(profile?.subscription_end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Subscription ID (for support) */}
                    {profile?.subscription_id && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                        <p className="text-xs text-muted-foreground mb-1">{t('settings.subscriptionId')}</p>
                        <code className="text-sm font-mono text-gray-600">
                          {profile.subscription_id}
                        </code>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      {isSubscriptionActive() && (
                        <Button
                          variant="outline"
                          onClick={() => setShowCancelSubscriptionDialog(true)}
                          className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                          {t('settings.cancelSubscription')}
                        </Button>
                      )}
                      
                      {isSubscriptionCanceled() && (
                        <Button
                          onClick={() => setShowReactivateDialog(true)}
                          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                        >
                          <CreditCard className="w-4 h-4" />
                          {t('settings.reactivateSubscription')}
                        </Button>
                      )}

                      {!profile?.subscription_id && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-sm text-primary/80">
                            {t('settings.noActiveSubscription')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('settings.discardChangesTitle')}</DialogTitle>
              <DialogDescription>
                {t('settings.discardChangesDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                {t('settings.keepEditing')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  profileForm.reset()
                  setHasChanges(false)
                  setShowCancelDialog(false)
                }}
              >
                {t('settings.discardChanges')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                {t('settings.cancelSubscriptionTitle')}
              </DialogTitle>
              <DialogDescription className="text-left space-y-3 pt-2">
                <p className="text-gray-600">{t('settings.cancelSubscriptionWarning')}</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                  <p className="font-medium text-sm text-gray-700">{t('settings.whatHappensNext')}</p>
                  <ul className="text-sm space-y-1.5 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('settings.cancelBullet1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('settings.cancelBullet2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('settings.cancelBullet3')}</span>
                    </li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelSubscriptionDialog(false)}
                disabled={cancelingSubscription}
                className="w-full sm:w-auto border-gray-200"
              >
                {t('settings.keepSubscription')}
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={cancelingSubscription}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              >
                {cancelingSubscription ? t('settings.canceling') : t('settings.confirmCancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reactivate Subscription Dialog */}
        <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <CreditCard className="w-5 h-5" />
                {t('settings.reactivateSubscriptionTitle')}
              </DialogTitle>
              <DialogDescription className="text-gray-600 pt-1">
                {t('settings.reactivateSubscriptionDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  disabled={reactivatingSubscription}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 ${
                    selectedPlan === 'monthly' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{t('settings.monthlyPlan')}</p>
                    <p className="text-2xl font-bold text-primary">$29.90</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                  {selectedPlan === 'monthly' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>

                {/* Yearly Plan */}
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  disabled={reactivatingSubscription}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 ${
                    selectedPlan === 'yearly' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SAVE $38.90
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="font-semibold text-sm">{t('settings.yearlyPlan')}</p>
                    <p className="text-2xl font-bold text-primary">$319.90</p>
                    <p className="text-xs text-muted-foreground">/year ($26.66/mo)</p>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-medium text-sm text-gray-700 mb-2">{t('settings.includedFeatures')}</p>
                <ul className="text-sm space-y-1.5 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('settings.feature1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('settings.feature2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('settings.feature3')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowReactivateDialog(false)}
                disabled={reactivatingSubscription}
                className="w-full sm:w-auto border-gray-200"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleReactivateSubscription}
                disabled={reactivatingSubscription}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {reactivatingSubscription ? t('settings.processing') : t('settings.continueToPayment')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </ProtectedRoute>
  )
}

export function Settings() {
  return <SettingsContent />
}


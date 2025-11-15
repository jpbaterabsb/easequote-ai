import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Home } from 'lucide-react'
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
import { useToast } from '@/hooks/useToast'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LanguageSelector } from '@/components/ui/language-selector'
import { UserMenu } from '@/components/ui/user-menu'
import { useTranslation } from '@/hooks/useTranslation'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
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
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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
        email: user?.email || '',
        phone: data.phone || '',
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
          phone: data.phone || null,
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

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    return data.publicUrl
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

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ company_logo_url: data.publicUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    return data.publicUrl
  }

  const handleLogoRemove = async () => {
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ company_logo_url: null })
      .eq('id', user.id)

    if (error) throw error
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between animate-slide-in-down">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              EaseQuote AI
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link to="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <UserMenu
                userEmail={user?.email}
                avatarUrl={profile?.avatar_url}
                fullName={profile?.full_name}
                onSignOut={signOut}
              />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.title')}</CardTitle>
              <CardDescription>{t('settings.manageAccount')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
                  <TabsTrigger value="password">{t('settings.password')}</TabsTrigger>
                  <TabsTrigger value="branding">{t('settings.branding')}</TabsTrigger>
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
      </div>
    </ProtectedRoute>
  )
}

export function Settings() {
  return <SettingsContent />
}


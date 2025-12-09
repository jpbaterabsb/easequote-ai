import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { AddressInput } from '@/components/ui/address-input'
import { Logo } from '@/components/ui/logo'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            business_name: data.businessName || null,
            phone: data.phone || null,
            address: data.address || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (authData.user && !authData.session) {
        navigate('/register/success', { state: { email: data.email } })
      } else if (authData.session) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // TODO: Enable Google OAuth after configuring Google Cloud Console credentials
  // const handleGoogleSignUp = async () => {
  //   setError(null)
  //   setLoading(true)
  //
  //   try {
  //     const { error: oauthError } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: `${window.location.origin}/auth/callback`,
  //       },
  //     })
  //
  //     if (oauthError) {
  //       setError('Failed to sign up with Google. Please try again.')
  //       setLoading(false)
  //     }
  //   } catch (err) {
  //     setError('An unexpected error occurred. Please try again.')
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo acima do card */}
        <div className="mb-8">
          <Logo linkTo={null} size="lg" className="h-16" />
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-300/40 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-500">Sign up to start creating professional quotes</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="John Doe"
                autoComplete="name"
                className="h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-gray-700 font-medium">Business Name (Optional)</Label>
              <Input
                id="businessName"
                {...register('businessName')}
                placeholder="Your Company LLC"
                autoComplete="organization"
                className="h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
              <PasswordInput
                id="password"
                {...register('password')}
                placeholder="At least 8 characters with a number"
                autoComplete="new-password"
                className="h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                onChange={(e) => {
                  setPassword(e.target.value)
                  register('password').onChange(e)
                }}
              />
              <PasswordStrengthIndicator password={password} />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                className="h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 font-medium">Business Address (Optional)</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <AddressInput
                    id="address"
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Start typing your address..."
                    className="h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold rounded-lg"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* TODO: Enable Google OAuth sign up after configuring Google Cloud Console credentials
              - Create OAuth 2.0 Client ID in Google Cloud Console
              - Add authorized redirect URIs for Supabase
              - Configure Google provider in Supabase Dashboard > Authentication > Providers
          */}
          {/* 
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium rounded-lg border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          */}

          {/* Sign in link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Logo */}
      <div className="flex justify-center pb-8">
        <Logo linkTo={null} size="sm" className="h-8 opacity-60" />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'

export function RegisterSuccess() {
  const location = useLocation()
  const email = location.state?.email || ''
  const { toast } = useToast()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResendConfirmation = async () => {
    if (!email || email === 'your email') {
      toast({
        title: 'Error',
        description: 'Email address not found. Please try registering again.',
        variant: 'destructive',
      })
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        throw error
      }

      setResent(true)
      toast({
        title: 'Email Sent!',
        description: 'A new confirmation email has been sent. Please check your inbox.',
      })
    } catch (error) {
      console.error('Error resending confirmation:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend confirmation email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl shadow-gray-300/40 border-gray-100">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a confirmation email to <strong>{email || 'your email'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please click the confirmation link in the email to activate your account.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={handleResendConfirmation}
              disabled={resending || resent}
              className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {resending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  sending...
                </>
              ) : resent ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  email sent!
                </>
              ) : (
                'resend confirmation'
              )}
            </button>.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}


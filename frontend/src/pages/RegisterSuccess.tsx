import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export function RegisterSuccess() {
  const location = useLocation()
  const email = location.state?.email || 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl shadow-gray-300/40 border-gray-100">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a confirmation email to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please click the confirmation link in the email to activate your account.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or{' '}
            <button className="text-primary hover:underline">resend confirmation</button>.
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


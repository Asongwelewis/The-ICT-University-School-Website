'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="card-shadow border-0 overflow-hidden">
          <CardHeader className="header-gradient text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-orange-100">
              Password reset instructions sent
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium">Email sent successfully!</p>
                <p className="text-green-600 text-sm mt-1">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>Please check your email and click the reset link to continue.</p>
                <p>If you don't see the email, check your spam folder.</p>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  Send Another Email
                </Button>
                
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="card-shadow border-0 overflow-hidden">
        <CardHeader className="header-gradient text-white text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-orange-100">
            Enter your email to receive reset instructions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500">
                We'll send you a link to reset your password
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 button-gradient text-white font-semibold hover:opacity-90 transition-opacity" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center pt-4">
              <Link 
                href="/auth/login"
                className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, User, Shield, Users, DollarSign, Target, Loader2 } from 'lucide-react'

/**
 * LoginForm Component - ICT University Authentication
 * 
 * Features:
 * - Split-screen design with branding (left) and form (right)
 * - Role-based authentication with dynamic permissions display
 * - Orange/blue color scheme matching university branding
 * - Supabase integration for authentication
 * - Responsive design for all screen sizes
 * - Optimized with useCallback and useMemo for performance
 */
export function LoginForm() {
  // State management for form inputs and UI states
  const [email, setEmail] = useState('') // Email input
  const [password, setPassword] = useState('') // Password input
  const [loading, setLoading] = useState(false) // Loading state during authentication
  const [error, setError] = useState('') // Error message display
  
  // Hooks for navigation and authentication
  const router = useRouter()
  const { login } = useAuth()



  /**
   * Handle login authentication
   * Optimized with useCallback to prevent unnecessary re-renders
   */
  const handleLogin = useCallback(async () => {
    // Validate all required fields are filled
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Authenticate user with backend API
      await login(email, password)
      
      // Navigate to dashboard after successful authentication
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }, [email, password, login, router])



  /**
   * System features configuration for display grid
   * Memoized to prevent recreation on every render
   */
  const systemFeatures = useMemo(() => [
    {
      icon: GraduationCap,
      title: 'Academic',
      description: 'Course & Student Management',
      colorClass: 'text-orange-500',
      borderClass: 'border-orange-200 dark:border-orange-800',
      titleClass: 'text-orange-700 dark:text-orange-300'
    },
    {
      icon: DollarSign,
      title: 'Finance',
      description: 'Fee & Payment Tracking',
      colorClass: 'text-blue-500',
      borderClass: 'border-blue-200 dark:border-blue-800',
      titleClass: 'text-blue-700 dark:text-blue-300'
    },
    {
      icon: Users,
      title: 'HR',
      description: 'Employee Management',
      colorClass: 'text-orange-500',
      borderClass: 'border-orange-200 dark:border-orange-800',
      titleClass: 'text-orange-700 dark:text-orange-300'
    },
    {
      icon: Target,
      title: 'Marketing',
      description: 'Campaign Analytics',
      colorClass: 'text-blue-500',
      borderClass: 'border-blue-200 dark:border-blue-800',
      titleClass: 'text-blue-700 dark:text-blue-300'
    }
  ], [])



  /**
   * Render system feature box component
   * Optimized with useCallback to prevent unnecessary re-renders
   */
  const renderFeatureBox = useCallback((feature: typeof systemFeatures[0], index: number) => (
    <div 
      key={index}
      className={`text-center p-4 rounded-lg border ${feature.borderClass}`}
    >
      <feature.icon className={`h-8 w-8 ${feature.colorClass} mx-auto mb-2`} />
      <h3 className={`font-medium ${feature.titleClass}`}>{feature.title}</h3>
      <p className="text-xs text-muted-foreground">{feature.description}</p>
    </div>
  ), [])



  return (
    <>
      {/* Main container with gradient background */}
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-blue-950/20">
        
        {/* Split-screen layout container */}
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - University Branding and Information */}
          <div className="space-y-6">
            
            {/* University Header Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                
                {/* University Logo with Gradient Background */}
                <div className="p-3 bg-gradient-to-br from-orange-500 to-blue-500 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                
                {/* University Name and Tagline */}
                <>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                    ICT University
                  </h1>
                  <p className="text-sm text-muted-foreground">School Management System</p>
                </>
              </div>
              
              {/* Welcome Message */}
              <p className="text-lg text-muted-foreground mb-6">
                Welcome to our integrated platform for academic management, finance tracking, HR operations, and marketing analytics.
              </p>
            </div>

            {/* System Information Card */}
            <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-blue-50/50 dark:from-orange-950/20 dark:to-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Shield className="h-5 w-5" />
                  Secure Access
                </CardTitle>
                <CardDescription>Role-based authentication system</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {['Student Portal', 'Staff Dashboard', 'Admin Panel', 'Finance Module'].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {/* Orange dot indicator */}
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Features Grid - 2x2 layout */}
            <div className="grid grid-cols-2 gap-4">
              {systemFeatures.map(renderFeatureBox)}
            </div>
          </div>

          {/* Right Side - Login Form Card */}
          <Card className="shadow-xl border-orange-200 dark:border-orange-800">
            
            {/* Card Header with Gradient Background */}
            <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20 rounded-t-lg">
              <CardTitle className="text-orange-700 dark:text-orange-300">
                Sign In to Your Account
              </CardTitle>
              <CardDescription>Access your personalized dashboard and tools</CardDescription>
            </CardHeader>
            
            {/* Card Content - Form Fields */}
            <CardContent className="space-y-6 p-6">
              
              {/* Error Alert Display */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Input Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-orange-200 focus:border-orange-400 dark:border-orange-800"
                  disabled={loading}
                />
              </div>

              {/* Password Input Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-orange-200 focus:border-orange-400 dark:border-orange-800"
                  disabled={loading}
                />
              </div>



              {/* Login Button with Gradient Background */}
              <Button 
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Registration Link */}
              <div className="border-t pt-4">
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/register" 
                    className="text-orange-600 hover:text-orange-500 font-medium dark:text-orange-400"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
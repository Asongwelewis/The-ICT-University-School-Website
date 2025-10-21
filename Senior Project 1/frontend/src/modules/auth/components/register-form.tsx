'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Mail, Lock, User, GraduationCap, Users } from 'lucide-react'
import Link from 'next/link'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    studentId: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (!formData.role) {
      setError('Please select a role')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            student_id: formData.studentId,
            department: formData.department,
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        setSuccess('Registration successful! Please check your email to verify your account.')
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="card-shadow border-0 overflow-hidden">
        {/* Orange Header */}
        <CardHeader className="header-gradient text-white text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Join Our School</CardTitle>
          <CardDescription className="text-orange-100">
            Create your account to access the ERP System
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="First name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields */}
            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-gray-700 font-medium">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your student ID"
                  disabled={loading}
                />
              </div>
            )}

            {(formData.role === 'instructor' || formData.role === 'staff') && (
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700 font-medium">
                  Department
                </Label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your department"
                  disabled={loading}
                />
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Create a password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 text-sm">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-gray-300 text-blue-500 focus:ring-blue-500" 
                required 
              />
              <span className="text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-500 hover:text-blue-600 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-500 hover:text-blue-600 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 button-gradient text-white font-semibold hover:opacity-90 transition-opacity" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 font-medium">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="First name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Last name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Role
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Password Fields */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Create a password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full button-gradient text-white font-medium py-2.5 hover:opacity-90 transition-opacity" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
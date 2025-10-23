'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    department: '',
    studentId: '',
    employeeId: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        ...(formData.role === 'student' && { student_id: formData.studentId }),
        ...(formData.role !== 'student' && { employee_id: formData.employeeId })
      }

      await register(userData)
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Registration Successful!</h3>
        <p className="text-gray-600">
          Please check your email to verify your account before signing in.
        </p>
        <Button 
          onClick={() => router.push('/auth/login')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleRegister} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700 font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700 font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.doe@ictuniversity.edu"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-700 font-medium">
            Role
          </Label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
            required
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="academic_staff">Academic Staff</option>
            <option value="hr_personnel">HR Personnel</option>
            <option value="finance_staff">Finance Staff</option>
            <option value="marketing_team">Marketing Team</option>
            <option value="system_admin">System Administrator</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+237123456789"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-gray-700 font-medium">
            Department
          </Label>
          <Input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleInputChange}
            placeholder="Computer Science"
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        {formData.role === 'student' && (
          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-gray-700 font-medium">
              Student ID
            </Label>
            <Input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleInputChange}
              placeholder="ICT2024001"
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
        )}

        {formData.role !== 'student' && (
          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-gray-700 font-medium">
              Employee ID
            </Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="text"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="EMP2024001"
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
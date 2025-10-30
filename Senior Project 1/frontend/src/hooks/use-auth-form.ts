/**
 * Custom hook for authentication form state management
 * Provides consistent form handling across auth components
 */
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService, AuthCredentials, RegisterData } from '@/services/auth-service'
import { authValidators } from '@/lib/validation'
import { ErrorHandler } from '@/lib/error-handler'

interface UseAuthFormOptions {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  redirectTo?: string
}

interface AuthFormState {
  loading: boolean
  error: string
  success: string
}

interface LoginFormData extends AuthCredentials {}

interface RegisterFormData extends RegisterData {
  confirmPassword: string
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
  const router = useRouter()
  const [state, setState] = useState<AuthFormState>({
    loading: false,
    error: '',
    success: ''
  })

  const resetState = useCallback(() => {
    setState({ loading: false, error: '', success: '' })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }))
  }, [])

  const setSuccess = useCallback((success: string) => {
    setState(prev => ({ ...prev, success, error: '', loading: false }))
  }, [])

  const validateLoginForm = useCallback((data: LoginFormData): string | null => {
    const result = authValidators.login.validate(data)
    return result.firstError || null
  }, [])

  const validateRegisterForm = useCallback((data: RegisterFormData): string | null => {
    const validator = authValidators.register(data.confirmPassword)
    const result = validator.validate(data)
    return result.firstError || null
  }, [])

  const handleLogin = useCallback(async (data: LoginFormData) => {
    const validationError = validateLoginForm(data)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    resetState()

    try {
      const result = await authService.login(data)
      
      if (result.user) {
        options.onSuccess?.(result.user)
        router.push(options.redirectTo || '/dashboard')
        router.refresh()
      }
    } catch (err) {
      const errorMessage = ErrorHandler.getUserFriendlyMessage(err)
      setError(errorMessage)
      options.onError?.(errorMessage)
      ErrorHandler.logError(ErrorHandler.handleError(err), 'Login Form')
    }
  }, [validateLoginForm, setLoading, resetState, setError, options, router])

  const handleRegister = useCallback(async (data: RegisterFormData) => {
    const validationError = validateRegisterForm(data)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    resetState()

    try {
      const { confirmPassword, ...registerData } = data
      const result = await authService.register(registerData)
      
      if (result.user) {
        const authMode = authService.getAuthMode()
        const successMessage = authMode === 'supabase' 
          ? 'Registration successful! Please check your email to verify your account.'
          : 'Registration successful! You can now log in.'
        
        setSuccess(successMessage)
        options.onSuccess?.(result.user)
        
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err) {
      const errorMessage = ErrorHandler.getUserFriendlyMessage(err)
      setError(errorMessage)
      options.onError?.(errorMessage)
      ErrorHandler.logError(ErrorHandler.handleError(err), 'Register Form')
    }
  }, [validateRegisterForm, setLoading, resetState, setError, setSuccess, options, router])

  const handlePasswordReset = useCallback(async (email: string) => {
    if (!email) {
      setError('Email is required')
      return false
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return false
    }

    setLoading(true)
    resetState()

    try {
      await authService.resetPassword(email)
      setSuccess('Password reset instructions sent to your email')
      return true
    } catch (err) {
      const errorMessage = ErrorHandler.getUserFriendlyMessage(err)
      setError(errorMessage)
      options.onError?.(errorMessage)
      ErrorHandler.logError(ErrorHandler.handleError(err), 'Password Reset Form')
      return false
    }
  }, [setLoading, resetState, setError, setSuccess, options])

  return {
    ...state,
    authMode: authService.getAuthMode(),
    handleLogin,
    handleRegister,
    handlePasswordReset,
    resetState,
    setError,
    setSuccess
  }
}
/**
 * Centralized authentication service
 * Handles both Supabase and backend API authentication
 */
import { createClient } from '@/lib/supabase'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData extends AuthCredentials {
  firstName: string
  lastName: string
  role: string
  studentId?: string
  department?: string
}

export interface AuthResult {
  user: any
  token?: string
}

export class AuthService {
  private static instance: AuthService
  private authMode: 'supabase' | 'backend' | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private constructor() {
    this.initializeAuthMode()
  }

  private initializeAuthMode(): void {
    const supabase = createClient()
    this.authMode = supabase ? 'supabase' : 'backend'
  }

  getAuthMode(): 'supabase' | 'backend' | null {
    return this.authMode
  }

  async login(credentials: AuthCredentials): Promise<AuthResult> {
    if (this.authMode === 'supabase') {
      return this.handleSupabaseLogin(credentials)
    } else if (this.authMode === 'backend') {
      return this.handleBackendLogin(credentials)
    }
    throw new Error('Authentication system not initialized')
  }

  async register(data: RegisterData): Promise<AuthResult> {
    if (this.authMode === 'supabase') {
      return this.handleSupabaseRegister(data)
    } else if (this.authMode === 'backend') {
      return this.handleBackendRegister(data)
    }
    throw new Error('Authentication system not initialized')
  }

  async resetPassword(email: string): Promise<void> {
    if (this.authMode === 'supabase') {
      return this.handleSupabasePasswordReset(email)
    } else if (this.authMode === 'backend') {
      return this.handleBackendPasswordReset(email)
    }
    throw new Error('Authentication system not initialized')
  }

  private async handleSupabaseLogin({ email, password }: AuthCredentials): Promise<AuthResult> {
    const supabase = createClient()
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { user: data.user }
  }

  private async handleBackendLogin({ email, password }: AuthCredentials): Promise<AuthResult> {
    const response = await fetch(
      process.env.NEXT_PUBLIC_AUTH_LOGIN_URL || 'http://localhost:8000/api/v1/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(errorData.detail || 'Login failed')
    }

    const data = await response.json()
    
    // Store the token in localStorage for backend API authentication
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_data', JSON.stringify(data.user))
    }

    return { user: data.user, token: data.access_token }
  }

  private async handleSupabaseRegister(data: RegisterData): Promise<AuthResult> {
    const supabase = createClient()
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          student_id: data.studentId,
          department: data.department
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return { user: authData.user }
  }

  private async handleBackendRegister(data: RegisterData): Promise<AuthResult> {
    const response = await fetch(
      process.env.NEXT_PUBLIC_AUTH_REGISTER_URL || 'http://localhost:8000/api/v1/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
          first_name: data.firstName,
          last_name: data.lastName,
          student_id: data.studentId,
          department: data.department
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }))
      throw new Error(errorData.detail || 'Registration failed')
    }

    const responseData = await response.json()
    return { user: responseData.user }
  }

  private async handleSupabasePasswordReset(email: string): Promise<void> {
    const supabase = createClient()
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  private async handleBackendPasswordReset(email: string): Promise<void> {
    const response = await fetch(
      process.env.NEXT_PUBLIC_AUTH_RESET_URL || 'http://localhost:8000/api/v1/auth/reset-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Password reset failed' }))
      throw new Error(errorData.detail || 'Password reset failed')
    }
  }
}

export const authService = AuthService.getInstance()
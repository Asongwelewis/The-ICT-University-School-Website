import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Type definitions for better type safety
export interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface SupabaseError {
  message: string
  code?: string
  details?: any
}

export interface SupabaseResult<T> {
  data: T | null
  error: SupabaseError | null
}

// Configuration management with singleton pattern
class SupabaseConfig {
  private static instance: SupabaseConfig
  private _isConfigured: boolean | null = null
  
  private constructor() {}
  
  static getInstance(): SupabaseConfig {
    if (!SupabaseConfig.instance) {
      SupabaseConfig.instance = new SupabaseConfig()
    }
    return SupabaseConfig.instance
  }
  
  get url(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  
  get anonKey(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
  
  get isConfigured(): boolean {
    if (this._isConfigured === null) {
      this._isConfigured = !!(this.url && this.anonKey && this.isValidUrl(this.url))
    }
    return this._isConfigured
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!this.url) errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
    if (!this.anonKey) errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    if (this.url && !this.isValidUrl(this.url)) errors.push('SUPABASE_URL is not a valid URL')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Force recalculation of configuration status (useful for testing)
  refresh(): void {
    this._isConfigured = null
  }
}

// Factory pattern for client creation
class SupabaseClientFactory {
  private static client: ReturnType<typeof createClientComponentClient> | null = null
  
  static createClient() {
    const config = supabaseConfig
    
    if (!config.isConfigured) {
      const { errors } = config.validate()
      throw new Error(`Supabase configuration error: ${errors.join(', ')}`)
    }
    
    if (!this.client) {
      this.client = createClientComponentClient()
    }
    
    return this.client
  }
  
  static resetClient(): void {
    this.client = null
  }
}

// Enhanced service class with proper error handling
export class SupabaseService {
  private static instance: SupabaseService
  
  private constructor() {}
  
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }
  
  private async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    errorContext: string
  ): Promise<SupabaseResult<T>> {
    if (!supabaseConfig.isConfigured) {
      return {
        data: null,
        error: { message: 'Supabase not configured', code: 'CONFIG_ERROR' }
      }
    }
    
    try {
      const data = await operation()
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'Unknown error',
          code: 'OPERATION_ERROR',
          details: { context: errorContext }
        }
      }
    }
  }
  
  async isAuthenticated(): Promise<boolean> {
    const result = await this.executeWithErrorHandling(async () => {
      const client = createClient()
      const { data: { session } } = await client.auth.getSession()
      return !!session
    }, 'authentication_check')
    
    return result.data ?? false
  }
  
  async getCurrentUser(): Promise<SupabaseResult<SupabaseUser>> {
    return this.executeWithErrorHandling(async () => {
      const client = createClient()
      const { data, error } = await client.auth.getUser()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return data.user as SupabaseUser
    }, 'get_current_user')
  }
  
  async signOut(): Promise<SupabaseResult<void>> {
    return this.executeWithErrorHandling(async () => {
      const client = createClient()
      const { error } = await client.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Reset client after sign out
      SupabaseClientFactory.resetClient()
    }, 'sign_out')
  }
  
  async healthCheck(): Promise<boolean> {
    const result = await this.executeWithErrorHandling(async () => {
      const client = createClient()
      await client.auth.getSession()
      return true
    }, 'health_check')
    
    return result.data ?? false
  }
  
  // Additional utility methods
  async refreshSession(): Promise<SupabaseResult<any>> {
    return this.executeWithErrorHandling(async () => {
      const client = createClient()
      const { data, error } = await client.auth.refreshSession()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return data
    }, 'refresh_session')
  }
}

// Singleton instances
export const supabaseConfig = SupabaseConfig.getInstance()
export const supabaseService = SupabaseService.getInstance()

// Backward compatibility exports
export const createClient = () => SupabaseClientFactory.createClient()
export const isSupabaseConfigured = (): boolean => supabaseConfig.isConfigured

// Enhanced configuration status
export const CONFIG_STATUS = {
  get isConfigured(): boolean {
    return supabaseConfig.isConfigured
  },
  get hasUrl(): boolean {
    return !!supabaseConfig.url
  },
  get hasKey(): boolean {
    return !!supabaseConfig.anonKey
  },
  get validationErrors(): string[] {
    return supabaseConfig.validate().errors
  },
  get summary(): { configured: boolean; url: boolean; key: boolean; errors: string[] } {
    return {
      configured: this.isConfigured,
      url: this.hasUrl,
      key: this.hasKey,
      errors: this.validationErrors
    }
  }
} as const

// Backward compatibility - deprecated, use supabaseService instead
export const supabaseUtils = {
  async isAuthenticated(): Promise<boolean> {
    return supabaseService.isAuthenticated()
  },
  async getCurrentUser(): Promise<{ data: any; error: Error | null }> {
    const result = await supabaseService.getCurrentUser()
    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null
    }
  },
  async signOut(): Promise<{ data: null; error: Error | null }> {
    const result = await supabaseService.signOut()
    return {
      data: null,
      error: result.error ? new Error(result.error.message) : null
    }
  },
  async healthCheck(): Promise<boolean> {
    return supabaseService.healthCheck()
  }
}

// Database type definitions
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'student' | 'staff'
          profile: any
          permissions: string[]
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'student' | 'staff'
          profile?: any
          permissions?: string[]
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'student' | 'staff'
          profile?: any
          permissions?: string[]
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
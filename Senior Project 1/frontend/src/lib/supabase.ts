/**
 * Supabase client configuration with graceful fallback handling
 * Provides type-safe database operations and authentication utilities
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// User profile type definition
export interface UserProfile {
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  studentId?: string
  department?: string
}

// User role type
export type UserRole = 'admin' | 'student' | 'staff'

// Database type definitions with proper typing
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          profile: UserProfile | null
          permissions: string[]
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: UserRole
          profile?: UserProfile | null
          permissions?: string[]
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          profile?: UserProfile | null
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

// Supabase client type
type SupabaseClient = ReturnType<typeof createClientComponentClient<Database>>

// Configuration constants
const PLACEHOLDER_VALUES = {
  URL: 'your_supabase_url_here',
  KEY: 'your_supabase_anon_key_here'
} as const

const ENV_KEYS = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
} as const

// Error handling
export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export const ERROR_CODES = {
  NOT_CONFIGURED: 'SUPABASE_NOT_CONFIGURED',
  CLIENT_CREATION_FAILED: 'CLIENT_CREATION_FAILED',
  AUTH_OPERATION_FAILED: 'AUTH_OPERATION_FAILED'
} as const

// URL validation helper
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith('https://') || url.startsWith('http://')
  } catch {
    return false
  }
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const url = process.env[ENV_KEYS.SUPABASE_URL]
  const key = process.env[ENV_KEYS.SUPABASE_ANON_KEY]
  
  return !!(
    url && 
    key && 
    url !== PLACEHOLDER_VALUES.URL && 
    key !== PLACEHOLDER_VALUES.KEY &&
    isValidUrl(url)
  )
}

// Create Supabase client or return null if not configured
export const createClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    console.info('🔄 Supabase not configured - using backend API authentication')
    return null
  }

  try {
    return createClientComponentClient<Database>()
  } catch (error) {
    const supabaseError = new SupabaseError(
      'Failed to create Supabase client',
      ERROR_CODES.CLIENT_CREATION_FAILED,
      error
    )
    console.warn(supabaseError.message, supabaseError)
    return null
  }
}

// Configuration management with caching
class ConfigurationManager {
  private static _configStatus: {
    isConfigured: boolean
    hasUrl: boolean
    hasKey: boolean
    message: string
  } | null = null

  static get configStatus() {
    if (!this._configStatus) {
      const isConfigured = isSupabaseConfigured()
      this._configStatus = {
        isConfigured,
        hasUrl: !!process.env[ENV_KEYS.SUPABASE_URL],
        hasKey: !!process.env[ENV_KEYS.SUPABASE_ANON_KEY],
        message: isConfigured 
          ? 'Supabase configured and ready' 
          : 'Using backend API authentication'
      }
    }
    return this._configStatus
  }

  static resetCache(): void {
    this._configStatus = null
  }
}

// Configuration status for debugging
export const CONFIG_STATUS = ConfigurationManager.configStatus

// Result types for consistent API responses
export interface AuthResult<T = any> {
  data: T | null
  error: Error | null
}

// Utility class for common Supabase operations
class SupabaseUtils {
  /**
   * Higher-order function to handle client operations with consistent error handling
   */
  private static async withClient<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    fallbackValue: T,
    errorMessage: string = 'Supabase operation failed'
  ): Promise<T> {
    const client = createClient()
    if (!client) return fallbackValue
    
    try {
      return await operation(client)
    } catch (error) {
      const supabaseError = new SupabaseError(
        errorMessage,
        ERROR_CODES.AUTH_OPERATION_FAILED,
        error
      )
      console.warn(supabaseError.message, supabaseError)
      return fallbackValue
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    return this.withClient(
      async (client) => {
        const { data: { session } } = await client.auth.getSession()
        return !!session
      },
      false,
      'Failed to check authentication status'
    )
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<AuthResult> {
    return this.withClient(
      async (client) => {
        const { data: { user }, error } = await client.auth.getUser()
        return { 
          data: user, 
          error: error ? new Error(error.message) : null 
        }
      },
      { data: null, error: new SupabaseError('Supabase not configured', ERROR_CODES.NOT_CONFIGURED) },
      'Failed to get current user'
    )
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<AuthResult<null>> {
    return this.withClient(
      async (client) => {
        const { error } = await client.auth.signOut()
        return { 
          data: null, 
          error: error ? new Error(error.message) : null 
        }
      },
      { data: null, error: new SupabaseError('Supabase not configured', ERROR_CODES.NOT_CONFIGURED) },
      'Failed to sign out user'
    )
  }

  /**
   * Get user session information
   */
  static async getSession(): Promise<AuthResult> {
    return this.withClient(
      async (client) => {
        const { data: { session }, error } = await client.auth.getSession()
        return { 
          data: session, 
          error: error ? new Error(error.message) : null 
        }
      },
      { data: null, error: new SupabaseError('Supabase not configured', ERROR_CODES.NOT_CONFIGURED) },
      'Failed to get session'
    )
  }
}

// Export utilities as singleton
export const supabaseUtils = SupabaseUtils
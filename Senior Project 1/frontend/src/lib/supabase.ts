/**
 * Supabase client configuration and utilities
 * 
 * This module provides a centralized way to create and manage Supabase clients
 * with proper error handling, environment validation, and utility functions.
 * 
 * @example
 * ```typescript
 * import { createClient, supabaseUtils } from '@/lib/supabase'
 * 
 * const client = createClient()
 * const isAuth = await supabaseUtils.isAuthenticated()
 * ```
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { UserProfile, UserRole } from '@/types'

// Environment validation with proper error handling
interface SupabaseConfig {
  url: string
  anonKey: string
}

enum RuntimeEnvironment {
  CLIENT_SIDE = 'client',
  SERVER_SIDE = 'server',
  DEVELOPMENT = 'development'
}

class SupabaseConfigValidator {
  private static getEnvironmentType(): RuntimeEnvironment {
    if (typeof window !== 'undefined') return RuntimeEnvironment.CLIENT_SIDE
    if (process.env.NODE_ENV === 'development') return RuntimeEnvironment.DEVELOPMENT
    return RuntimeEnvironment.SERVER_SIDE
  }

  private static validateRequiredVars(url?: string, anonKey?: string): string[] {
    const missingVars: string[] = []
    if (!url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return missingVars
  }

  private static handleMissingVars(missingVars: string[], envType: RuntimeEnvironment): void {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    
    switch (envType) {
      case RuntimeEnvironment.DEVELOPMENT:
        console.error(`❌ Supabase Configuration Error: ${errorMessage}`)
        console.info('💡 Please check your .env.local file and ensure all Supabase variables are set')
        break
      case RuntimeEnvironment.SERVER_SIDE:
        console.warn(`⚠️ Supabase not configured during build: ${errorMessage}`)
        break
      case RuntimeEnvironment.CLIENT_SIDE:
        throw new Error(errorMessage)
    }
  }

  private static validateUrlFormat(url: string, envType: RuntimeEnvironment): boolean {
    try {
      new URL(url)
      return true
    } catch {
      if (envType === RuntimeEnvironment.CLIENT_SIDE) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
      }
      console.warn('⚠️ Invalid Supabase URL during build')
      return false
    }
  }

  static validate(): SupabaseConfig | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const envType = this.getEnvironmentType()

    const missingVars = this.validateRequiredVars(url, anonKey)
    
    if (missingVars.length > 0) {
      this.handleMissingVars(missingVars, envType)
      return envType === RuntimeEnvironment.CLIENT_SIDE ? null : null
    }

    if (!this.validateUrlFormat(url!, envType)) {
      return null
    }

    return { url: url!, anonKey: anonKey! }
  }
}

function validateEnvironment(): SupabaseConfig | null {
  return SupabaseConfigValidator.validate()
}

// Validate configuration on module load - but handle gracefully if missing
const supabaseConfig = validateEnvironment()

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => !!supabaseConfig

// Configuration constants with better structure and validation
export const SUPABASE_CONFIG = supabaseConfig ? {
  url: supabaseConfig.url,
  anonKey: supabaseConfig.anonKey,
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' as const, // More secure flow
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
      debug: process.env.NODE_ENV === 'development'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'school-erp-frontend'
      }
    }
  }
} as const : null

// Export configuration status for debugging
export const CONFIG_STATUS = {
  isConfigured: isSupabaseConfigured(),
  environment: process.env.NODE_ENV,
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  timestamp: new Date().toISOString()
} as const

// Database type definitions
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

// Type-safe client interface
type SupabaseClient = ReturnType<typeof createClientComponentClient<Database>>

// Improved Singleton Pattern with proper error handling and type safety
class SupabaseClientManager {
  private static instance: SupabaseClient | null = null
  private static initializationError: Error | null = null

  static getInstance(): SupabaseClient {
    // Return cached error if initialization previously failed
    if (this.initializationError) {
      throw this.initializationError
    }

    // Return existing instance if available
    if (this.instance) {
      return this.instance
    }

    // Validate configuration before creating client
    if (!supabaseConfig) {
      const error = new Error('Supabase configuration is not available. Please check your environment variables.')
      this.initializationError = error
      throw error
    }

    try {
      this.instance = createClientComponentClient<Database>({
        supabaseUrl: supabaseConfig.url,
        supabaseKey: supabaseConfig.anonKey,
      })
      return this.instance
    } catch (error) {
      const wrappedError = new Error(
        `Supabase client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      this.initializationError = wrappedError
      console.error('Failed to create Supabase client:', error)
      throw wrappedError
    }
  }

  static reset(): void {
    this.instance = null
    this.initializationError = null
  }

  static isInitialized(): boolean {
    return this.instance !== null && this.initializationError === null
  }
}

// Factory function for creating new clients (useful for testing)
export const createClient = (): SupabaseClient => {
  if (!supabaseConfig) {
    throw new Error('Supabase configuration is not available. Cannot create client without proper environment variables.')
  }
  
  return createClientComponentClient<Database>({
    supabaseUrl: supabaseConfig.url,
    supabaseKey: supabaseConfig.anonKey,
  })
}

// Main client getter using singleton pattern
export const getSupabaseClient = (): SupabaseClient => SupabaseClientManager.getInstance()

// Result types for better error handling
interface AuthResult<T> {
  data: T | null
  error: Error | null
}

// Utility functions for common operations with improved error handling
export const supabaseUtils = {
  /**
   * Check if user is authenticated
   * @returns Promise<boolean> - true if authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - treating as unauthenticated')
      return false
    }
    
    try {
      const client = getSupabaseClient()
      const { data: { session }, error } = await client.auth.getSession()
      
      if (error) {
        console.error('Error checking authentication status:', error)
        return false
      }
      
      return !!session
    } catch (error) {
      console.error('Failed to check authentication status:', error)
      return false
    }
  },

  /**
   * Get current user with comprehensive error handling
   * @returns Promise<AuthResult<User>> - user data or error
   */
  async getCurrentUser(): Promise<AuthResult<any>> {
    if (!isSupabaseConfigured()) {
      return {
        data: null,
        error: new Error('Supabase not configured')
      }
    }
    
    try {
      const client = getSupabaseClient()
      const { data: { user }, error } = await client.auth.getUser()
      
      return {
        data: user,
        error: error ? new Error(error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      }
    }
  },

  /**
   * Sign out with proper cleanup and error handling
   * @returns Promise<AuthResult<void>> - success status or error
   */
  async signOut(): Promise<AuthResult<void>> {
    if (!isSupabaseConfigured()) {
      return {
        data: null,
        error: new Error('Supabase not configured')
      }
    }
    
    try {
      const client = getSupabaseClient()
      SupabaseClientManager.reset() // Reset singleton
      const { error } = await client.auth.signOut()
      
      return {
        data: null,
        error: error ? new Error(error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Sign out failed')
      }
    }
  },

  /**
   * Handle auth state changes with proper error handling
   * @param callback - Function to call on auth state change
   * @returns Subscription object or null if not configured
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - auth state changes will not be monitored')
      return { data: { subscription: null } }
    }
    
    try {
      const client = getSupabaseClient()
      return client.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error('Failed to set up auth state change listener:', error)
      return { data: { subscription: null } }
    }
  },

  /**
   * Health check for Supabase connection
   * @returns Promise<boolean> - true if connection is healthy
   */
  async healthCheck(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false
    
    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.getSession()
      return !error
    } catch {
      return false
    }
  }
}
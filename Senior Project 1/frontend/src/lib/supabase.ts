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

function validateEnvironment(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const missingVars: string[] = []
  
  if (!url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Supabase Configuration Error: ${errorMessage}`)
      console.info('💡 Please check your .env.local file and ensure all Supabase variables are set')
    }
    
    throw new Error(errorMessage)
  }

  // Validate URL format
  try {
    new URL(url!)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }

  return { url: url!, anonKey: anonKey! }
}

// Validate configuration on module load
const supabaseConfig = validateEnvironment()

// Configuration constants
export const SUPABASE_CONFIG = {
  url: supabaseConfig.url,
  anonKey: supabaseConfig.anonKey,
  // Add other configuration options as needed
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
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

// Singleton client instance for better performance
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Client-side Supabase client with error handling
export const createClient = () => {
  try {
    return createClientComponentClient<Database>({
      supabaseUrl: supabaseConfig.url,
      supabaseKey: supabaseConfig.anonKey,
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw new Error('Supabase client initialization failed. Please check your configuration.')
  }
}

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}

// Utility functions for common operations
export const supabaseUtils = {
  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const client = getSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    return !!session
  },

  /**
   * Get current user with error handling
   */
  async getCurrentUser() {
    const client = getSupabaseClient()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    
    return user
  },

  /**
   * Sign out with cleanup
   */
  async signOut() {
    const client = getSupabaseClient()
    clientInstance = null // Reset singleton
    return await client.auth.signOut()
  },

  /**
   * Handle auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const client = getSupabaseClient()
    return client.auth.onAuthStateChange(callback)
  }
}
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client for use in client components
export const createClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is not available')
  }
  return createClientComponentClient()
}

// Configuration validation
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(url && key && isValidUrl(url))
}

// Helper function to validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Configuration status object
export const CONFIG_STATUS = {
  get isConfigured(): boolean {
    return isSupabaseConfigured()
  },
  get hasUrl(): boolean {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL
  },
  get hasKey(): boolean {
    return !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

// Utility functions for common Supabase operations
export const supabaseUtils = {
  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false
    }
    
    try {
      const client = createClient()
      const { data: { session } } = await client.auth.getSession()
      return !!session
    } catch {
      return false
    }
  },

  async getCurrentUser(): Promise<{ data: any; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return {
        data: null,
        error: new Error('Supabase not configured')
      }
    }

    try {
      const client = createClient()
      const { data, error } = await client.auth.getUser()
      
      return {
        data: data.user,
        error: error ? new Error(error.message) : null
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error')
      }
    }
  },

  async signOut(): Promise<{ data: null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return {
        data: null,
        error: new Error('Supabase not configured')
      }
    }

    try {
      const client = createClient()
      const { error } = await client.auth.signOut()
      
      return {
        data: null,
        error: error ? new Error(error.message) : null
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error')
      }
    }
  },

  async healthCheck(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false
    }

    try {
      const client = createClient()
      await client.auth.getSession()
      return true
    } catch {
      return false
    }
  }
}

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
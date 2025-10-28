import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  isSupabaseConfigured, 
  getConfigStatus, 
  SupabaseConfigError,
  validateSupabaseConfig 
} from './supabase-config'

/**
 * Mock Supabase client for client-side when configuration is invalid
 * Implements Null Object Pattern to prevent runtime errors
 */
const createMockClient = () => {
  const mockError = new Error('Supabase is not configured. Please check your environment variables.');
  
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: mockError }),
      getUser: () => Promise.resolve({ data: { user: null }, error: mockError }),
      signOut: () => Promise.resolve({ error: mockError }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: mockError }),
          execute: () => Promise.resolve({ data: [], error: mockError })
        }),
        execute: () => Promise.resolve({ data: [], error: mockError })
      }),
      insert: () => ({ execute: () => Promise.resolve({ data: null, error: mockError }) }),
      update: () => ({ 
        eq: () => ({ execute: () => Promise.resolve({ data: null, error: mockError }) })
      }),
      delete: () => ({ 
        eq: () => ({ execute: () => Promise.resolve({ data: null, error: mockError }) })
      }),
    }),
  };
};

/**
 * Client-side Supabase client factory with proper error handling
 * 
 * @param options Configuration options for client creation
 * @returns Configured Supabase client or mock client if configuration is invalid
 * @throws SupabaseConfigError in strict mode when configuration is invalid
 */
export const createClient = (options: { strict?: boolean } = {}) => {
  const validation = validateSupabaseConfig();
  
  if (!validation.isValid) {
    if (options.strict) {
      throw SupabaseConfigError.fromValidation(validation);
    }
    
    // Log configuration issues in development (client-side)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase Client: Configuration issues detected');
      validation.errors.forEach(error => console.warn(`  ❌ ${error}`));
      validation.warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`));
      console.warn('  🔧 Using mock client. Check your .env.local file.');
    }
    
    return createMockClient();
  }
  
  try {
    return createClientComponentClient();
  } catch (error) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('❌ Failed to create Supabase client:', error);
    }
    
    if (options.strict) {
      throw error;
    }
    
    return createMockClient();
  }
};

/**
 * Safe client that never throws errors
 * Always returns a usable client (real or mock)
 */
export const createSafeClient = () => createClient({ strict: false });

/**
 * Strict client that throws errors for invalid configuration
 * Use this when you need to ensure Supabase is properly configured
 */
export const createStrictClient = () => createClient({ strict: true });

/**
 * Configuration status object with getter methods
 * Provides detailed information about Supabase configuration
 */
export const CONFIG_STATUS = {
  get isConfigured(): boolean {
    return isSupabaseConfigured();
  },
  get details() {
    return getConfigStatus();
  },
  get hasUrl(): boolean {
    return getConfigStatus().hasUrl;
  },
  get hasValidUrl(): boolean {
    return getConfigStatus().hasValidUrl;
  },
  get hasKey(): boolean {
    return getConfigStatus().hasAnonKey;
  },
  get errors(): string[] {
    return getConfigStatus().errors;
  },
  get warnings(): string[] {
    return getConfigStatus().warnings;
  }
};

/**
 * Enhanced utility functions for common Supabase operations
 * Provides consistent error handling and better type safety
 */
export const supabaseUtils = {
  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const client = createSafeClient();
      const { data: { session }, error } = await client.auth.getSession();
      return !!session && !error;
    } catch {
      return false;
    }
  },

  /**
   * Get current authenticated user with enhanced error handling
   */
  async getCurrentUser(): Promise<{ 
    data: any; 
    error: Error | null;
    isConfigured: boolean;
  }> {
    const configStatus = getConfigStatus();
    
    if (!configStatus.isConfigured) {
      return {
        data: null,
        error: new SupabaseConfigError(
          'Supabase not configured',
          configStatus.errors,
          configStatus.warnings
        ),
        isConfigured: false
      };
    }

    try {
      const client = createSafeClient();
      const { data, error } = await client.auth.getUser();
      
      return {
        data: data.user,
        error: error ? new Error(error.message) : null,
        isConfigured: true
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error'),
        isConfigured: true
      };
    }
  },

  /**
   * Sign out user with proper cleanup
   */
  async signOut(): Promise<{ 
    data: null; 
    error: Error | null;
    isConfigured: boolean;
  }> {
    const configStatus = getConfigStatus();
    
    if (!configStatus.isConfigured) {
      return {
        data: null,
        error: new SupabaseConfigError(
          'Supabase not configured',
          configStatus.errors,
          configStatus.warnings
        ),
        isConfigured: false
      };
    }

    try {
      const client = createSafeClient();
      const { error } = await client.auth.signOut();
      
      return {
        data: null,
        error: error ? new Error(error.message) : null,
        isConfigured: true
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error'),
        isConfigured: true
      };
    }
  },

  /**
   * Comprehensive health check with detailed status
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    isConfigured: boolean;
    canConnect: boolean;
    errors: string[];
    warnings: string[];
    latency?: number;
  }> {
    const startTime = Date.now();
    const configStatus = getConfigStatus();
    
    if (!configStatus.isConfigured) {
      return {
        isHealthy: false,
        isConfigured: false,
        canConnect: false,
        errors: configStatus.errors,
        warnings: configStatus.warnings
      };
    }

    try {
      const client = createSafeClient();
      const { error } = await client.auth.getSession();
      const latency = Date.now() - startTime;
      
      const canConnect = !error;
      
      return {
        isHealthy: canConnect,
        isConfigured: true,
        canConnect,
        errors: canConnect ? [] : [error?.message || 'Connection failed'],
        warnings: configStatus.warnings,
        latency
      };
    } catch (err) {
      return {
        isHealthy: false,
        isConfigured: true,
        canConnect: false,
        errors: [err instanceof Error ? err.message : 'Unknown connection error'],
        warnings: configStatus.warnings,
        latency: Date.now() - startTime
      };
    }
  },

  /**
   * Get configuration diagnostics for debugging
   */
  getDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...getConfigStatus(),
    };
  }
};

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
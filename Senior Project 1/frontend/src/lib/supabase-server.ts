import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { 
  isSupabaseConfigured, 
  getConfigStatus, 
  SupabaseConfigError,
  validateSupabaseConfig 
} from './supabase-config'

/**
 * Mock Supabase client for when configuration is invalid
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
    // Add other commonly used methods as needed
  };
};

/**
 * Server-side Supabase client factory with proper error handling
 * 
 * @returns Configured Supabase client or mock client if configuration is invalid
 * @throws SupabaseConfigError in strict mode when configuration is invalid
 */
export const createServerClient = (options: { strict?: boolean } = {}) => {
  const validation = validateSupabaseConfig();
  
  if (!validation.isValid) {
    if (options.strict) {
      throw SupabaseConfigError.fromValidation(validation);
    }
    
    // Log configuration issues in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase Server Client: Configuration issues detected');
      validation.errors.forEach(error => console.warn(`  ❌ ${error}`));
      validation.warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`));
      console.warn('  🔧 Using mock client. Check your .env.local file.');
    }
    
    return createMockClient();
  }
  
  try {
    return createServerComponentClient({ cookies });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Failed to create Supabase server client:', error);
    }
    
    if (options.strict) {
      throw error;
    }
    
    return createMockClient();
  }
};

/**
 * Safe server client that never throws errors
 * Always returns a usable client (real or mock)
 */
export const createSafeServerClient = () => createServerClient({ strict: false });

/**
 * Strict server client that throws errors for invalid configuration
 * Use this when you need to ensure Supabase is properly configured
 */
export const createStrictServerClient = () => createServerClient({ strict: true });

/**
 * Check if Supabase is properly configured
 */
export const isConfigured = isSupabaseConfigured();

/**
 * Get detailed configuration status
 */
export const configStatus = getConfigStatus();

/**
 * Validate server-side Supabase setup
 * Useful for health checks and debugging
 */
export const validateServerSetup = async () => {
  const validation = validateSupabaseConfig();
  
  if (!validation.isValid) {
    return {
      isValid: false,
      canConnect: false,
      ...validation,
    };
  }
  
  try {
    const client = createServerClient({ strict: true });
    
    // Test basic connectivity
    const { error } = await client.auth.getSession();
    
    return {
      isValid: true,
      canConnect: !error,
      connectionError: error?.message,
      ...validation,
    };
  } catch (error) {
    return {
      isValid: false,
      canConnect: false,
      connectionError: error instanceof Error ? error.message : 'Unknown error',
      ...validation,
    };
  }
};
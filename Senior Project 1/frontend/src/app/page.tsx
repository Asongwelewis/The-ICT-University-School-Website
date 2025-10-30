import { redirect } from 'next/navigation'
import { ServerAuthUtils, AuthRoutes } from '@/lib/auth-utils'

/**
 * Home page component that handles authentication routing
 * 
 * This component serves as the entry point and redirects users based on:
 * 1. Supabase configuration status
 * 2. Current authentication state
 * 
 * @returns Redirects to appropriate route based on auth status
 */
export default async function Home() {
  // Check authentication status with comprehensive error handling
  const authResult = await ServerAuthUtils.checkAuthentication({
    fallbackToBackendAuth: true,
    logErrors: true
  })
  
  // Handle authentication errors gracefully
  if (authResult.error && authResult.error !== 'Supabase not configured') {
    console.warn('Authentication check failed, redirecting to login:', authResult.error)
  }

  // Redirect to appropriate route based on authentication status
  const redirectUrl = AuthRoutes.getRedirectUrl(authResult.isAuthenticated)
  redirect(redirectUrl)
}
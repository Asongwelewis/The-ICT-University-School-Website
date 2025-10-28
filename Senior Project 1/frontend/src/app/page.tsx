import { redirect } from 'next/navigation'
import { createServerClient, isConfigured } from '@/lib/supabase-server'

export default async function Home() {
  // If Supabase is not configured, redirect to login
  if (!isConfigured) {
    redirect('/auth/login')
    return
  }

  const supabase = createServerClient()
  
  // If supabase client couldn't be created, redirect to login
  if (!supabase) {
    redirect('/auth/login')
    return
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect('/dashboard')
    } else {
      redirect('/auth/login')
    }
  } catch (error) {
    // If there's an error with Supabase, redirect to login
    console.warn('Supabase error:', error)
    redirect('/auth/login')
  }
}
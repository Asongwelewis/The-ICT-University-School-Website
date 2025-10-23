'use client'

import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * Development component to check environment configuration
 * Only shows in development mode
 */
export function EnvCheck() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || isConfigured === null) {
    return null
  }

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✅ Supabase configuration is valid
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        ⚠️ Supabase not configured. Please check your environment variables:
        <ul className="mt-2 ml-4 list-disc">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
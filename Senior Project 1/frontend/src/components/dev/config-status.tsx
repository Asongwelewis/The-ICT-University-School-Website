'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CONFIG_STATUS } from '@/lib/supabase'

export function ConfigStatus() {
  const [status, setStatus] = useState({
    supabaseConfigured: false,
    hasUrl: false,
    hasKey: false,
    apiUrl: '',
    environment: ''
  })

  useEffect(() => {
    setStatus({
      supabaseConfigured: CONFIG_STATUS.isConfigured,
      hasUrl: CONFIG_STATUS.hasUrl,
      hasKey: CONFIG_STATUS.hasKey,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not configured',
      environment: process.env.NODE_ENV || 'unknown'
    })
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configuration Status</CardTitle>
        <CardDescription>
          Current application configuration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Environment</h4>
            <p className="text-sm text-muted-foreground">{status.environment}</p>
          </div>
          <div>
            <h4 className="font-medium">API URL</h4>
            <p className="text-sm text-muted-foreground">{status.apiUrl}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Supabase Configuration</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.hasUrl ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Supabase URL: {status.hasUrl ? 'Configured' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.hasKey ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Supabase Key: {status.hasKey ? 'Configured' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.supabaseConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Overall Status: {status.supabaseConfigured ? 'Ready' : 'Not Ready'}</span>
            </div>
          </div>
        </div>

        {!status.supabaseConfigured && (
          <Alert>
            <AlertDescription>
              Supabase is not properly configured. Please update your .env.local file with valid Supabase credentials.
              The application will use the backend API for authentication instead.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
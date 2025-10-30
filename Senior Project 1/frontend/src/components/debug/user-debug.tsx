'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw, 
  User, 
  Shield, 
  Clock,
  AlertTriangle 
} from 'lucide-react'

interface UserDebugProps {
  /**
   * Whether to show sensitive information like tokens
   * @default false
   */
  showSensitiveData?: boolean
  /**
   * Whether the component is collapsible
   * @default true
   */
  collapsible?: boolean
  /**
   * Custom CSS classes
   */
  className?: string
}

/**
 * Enhanced UserDebug component for development and debugging
 * 
 * Features:
 * - Secure data display with sensitive data masking
 * - Copy to clipboard functionality
 * - Refresh user data capability
 * - Better loading and error states
 * - Structured data presentation
 * - TypeScript support
 */
export function UserDebug({ 
  showSensitiveData = false, 
  collapsible = true,
  className = "" 
}: UserDebugProps) {
  const { user, loading, error, refreshUser } = useAuth()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showSensitive, setShowSensitive] = useState(showSensitiveData)
  const [copySuccess, setCopySuccess] = useState(false)

  // Sanitize user data for display
  const sanitizedUserData = useMemo(() => {
    if (!user) return null

    const sanitized = { ...user }
    
    // Mask sensitive fields unless explicitly shown
    if (!showSensitive) {
      const sensitiveFields = ['access_token', 'refresh_token', 'password', 'jwt']
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '***HIDDEN***'
        }
      })
    }

    return sanitized
  }, [user, showSensitive])

  // Copy user data to clipboard
  const handleCopyToClipboard = async () => {
    if (!sanitizedUserData) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(sanitizedUserData, null, 2))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Refresh user data
  const handleRefresh = async () => {
    if (refreshUser) {
      await refreshUser()
    }
  }

  // Loading state with better UX
  if (loading) {
    return (
      <Card className={`border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading User Data...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            Debug: User Data Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load user data: {error.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <User className="h-4 w-4" />
            Debug: User Data
            {user && (
              <Badge variant="outline" className="ml-2">
                {user.role || 'No Role'}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Sensitive data toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
              className="h-8 w-8 p-0"
              title={showSensitive ? 'Hide sensitive data' : 'Show sensitive data'}
            >
              {showSensitive ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            {/* Copy to clipboard */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyToClipboard}
              className="h-8 w-8 p-0"
              title="Copy to clipboard"
              disabled={!sanitizedUserData}
            >
              <Copy className="h-4 w-4" />
            </Button>

            {/* Refresh data */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
              title="Refresh user data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Collapse toggle */}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '−' : '+'}
              </Button>
            )}
          </div>
        </div>

        {/* Status indicators */}
        {user && (
          <div className="flex items-center gap-4 mt-2 text-sm text-yellow-700 dark:text-yellow-400">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Role: {user.role || 'Unknown'}</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Email: {user.email}</span>
              </div>
            )}
            {user.last_sign_in_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last Login: {new Date(user.last_sign_in_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Copy success feedback */}
          {copySuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                User data copied to clipboard!
              </AlertDescription>
            </Alert>
          )}

          {/* No user data state */}
          {!user ? (
            <Alert>
              <AlertDescription>
                No user data available. User may not be authenticated.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Sensitive data warning */}
              {showSensitive && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Sensitive data is visible. Do not share this information.
                  </AlertDescription>
                </Alert>
              )}

              {/* User data display */}
              <div className="space-y-4">
                {/* Structured key information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">User ID</h4>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{user.id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Email</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Role</h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{user.role || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Status</h4>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Full JSON data */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Complete User Object
                  </h4>
                  <pre className="text-xs text-yellow-700 dark:text-yellow-400 whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-lg border overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(sanitizedUserData, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
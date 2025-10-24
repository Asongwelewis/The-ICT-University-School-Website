'use client'

import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Badge } from '@/components/ui/badge'
import { UserRole, DashboardUtils } from '@/components/dashboard/DashboardFactory'
import { useDashboardDataByRole } from '@/hooks/useDashboardDataByRole'
import { DashboardLayout, DashboardLoading, DashboardError } from '@/components/dashboard/DashboardComponents'
import { ReactNode, memo, useCallback } from 'react'

// Constants for better maintainability
const DASHBOARD_CONFIG = {
  DEFAULT_ROLE: 'student' as UserRole,
  LOADING_MESSAGE: 'Loading your personalized dashboard...',
  ERROR_MESSAGE: 'Dashboard data not available',
  UNIVERSITY_NAME: 'ICT University',
  SYSTEM_NAME: 'School Management System',
  FALLBACK_USER_NAME: 'User'
} as const

// Type definitions for better type safety
interface User {
  id: string
  email: string
  full_name?: string
  role: UserRole
  // Add other user properties as needed
}

/**
 * Main dashboard page component that renders role-specific dashboard content
 * 
 * Features:
 * - Role-based dashboard rendering
 * - Loading and error state handling
 * - Responsive layout with header
 * - Memoized components for performance
 * 
 * @returns JSX.Element - The dashboard page with appropriate content based on user role
 */
export default function DashboardPage() {
  const { user } = useAuth()
  
  // Validate and get user role with proper type safety and error handling
  const userRole = (() => {
    try {
      if (user?.role && DashboardUtils.hasRoleDashboard(user.role)) {
        return user.role as UserRole
      }
      // Log fallback for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[DashboardPage] Invalid or missing user role: ${user?.role}, falling back to 'student'`)
      }
      return DASHBOARD_CONFIG.DEFAULT_ROLE
    } catch (error) {
      console.error('[DashboardPage] Error validating user role:', error)
      return DASHBOARD_CONFIG.DEFAULT_ROLE
    }
  })()
  
  // Get dashboard data for the user's role
  const { data: dashboardData, loading, error, refreshData } = useDashboardDataByRole(userRole)

  // Memoize content rendering to prevent unnecessary re-renders
  const renderContent = useCallback((): ReactNode => {
    if (loading) {
      return <DashboardLoading message={DASHBOARD_CONFIG.LOADING_MESSAGE} />
    }

    if (error) {
      return <DashboardError error={error} onRetry={refreshData} />
    }

    if (!dashboardData) {
      return (
        <DashboardError 
          error={DASHBOARD_CONFIG.ERROR_MESSAGE} 
          onRetry={refreshData} 
        />
      )
    }

    return (
      <DashboardLayout
        title={dashboardData.title}
        description={dashboardData.description}
        stats={dashboardData.stats}
        actions={dashboardData.actions}
      />
    )
  }, [loading, error, dashboardData, refreshData])

  return (
    <DashboardPageLayout user={user}>
      {renderContent()}
    </DashboardPageLayout>
  )
}

/**
 * Props for the DashboardPageLayout component
 */
interface DashboardPageLayoutProps {
  /** The current authenticated user */
  user: User | null
  /** Child components to render in the main content area */
  children: ReactNode
}

/**
 * Layout wrapper component that provides consistent page structure
 * Eliminates code duplication by wrapping common layout elements
 * 
 * @param props - Component props
 * @returns JSX.Element - The page layout with header and main content area
 */
const DashboardPageLayout = memo(function DashboardPageLayout({ user, children }: DashboardPageLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
})

/**
 * Utility function to format user role for display
 * Converts snake_case to Title Case (e.g., "system_admin" -> "System Admin")
 * 
 * @param role - The role string to format
 * @returns Formatted role string
 */
const formatRole = (role: string): string => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Props for the DashboardHeader component
 */
interface DashboardHeaderProps {
  /** The current authenticated user */
  user: User | null
}

/**
 * Dashboard header component displaying university branding and user info
 * Shows welcome message and user role badge
 * 
 * @param props - Component props
 * @returns JSX.Element - The dashboard header
 */
const DashboardHeader = memo(function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold">{DASHBOARD_CONFIG.UNIVERSITY_NAME}</h1>
            <p className="text-orange-100">{DASHBOARD_CONFIG.SYSTEM_NAME}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-orange-100 block">
                Welcome, {user?.full_name || user?.email || DASHBOARD_CONFIG.FALLBACK_USER_NAME}
              </span>
              <Badge 
                variant="secondary" 
                size="sm" 
                className="mt-1 bg-white/20 text-white border-white/30"
              >
                {user?.role ? formatRole(user.role) : 'Unknown Role'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})
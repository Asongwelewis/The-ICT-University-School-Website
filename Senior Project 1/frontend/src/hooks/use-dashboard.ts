'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import type { IconName } from '@/lib/icons'

// Configuration constants with better organization
const DASHBOARD_CONFIG = {
  // Performance settings
  SIMULATED_DELAY: 500, // ms - for realistic loading behavior
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in ms
  
  // UI limits
  MAX_RECENT_ACTIVITIES: 10,
  MAX_QUICK_ACTIONS: 6,
  
  // Error handling
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
  
  // Data freshness
  STALE_TIME: 2 * 60 * 1000, // 2 minutes - when to show stale data warning
} as const

// Role-specific configuration
const ROLE_CONFIG = {
  student: {
    maxQuickActions: 4,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  },
  academic_staff: {
    maxQuickActions: 6,
    refreshInterval: 3 * 60 * 1000, // 3 minutes
  },
  system_admin: {
    maxQuickActions: 8,
    refreshInterval: 1 * 60 * 1000, // 1 minute
  },
} as const

// Utility to get role-specific configuration
const getRoleConfig = (role: UserRole) => {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.student
}

// Enhanced type definitions with better constraints
interface DashboardStat {
  value: string | number
  label: string
  change?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
}

interface DashboardStats {
  [key: string]: DashboardStat
}

interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: IconName  // ✅ Type-safe icon names
  color: 'orange' | 'blue' | 'green' | 'red'
  disabled?: boolean
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: ActivityItem[]
  quickActions: QuickAction[]
}

// User role type for better type safety
type UserRole = 'student' | 'academic_staff' | 'staff' | 'system_admin' | 'admin' | 'hr_personnel' | 'finance_staff' | 'marketing_team'

// Hook return type
// Enhanced error types for better error handling
interface DashboardError {
  type: 'network' | 'auth' | 'permission' | 'data' | 'unknown'
  message: string
  code?: string
  retryable: boolean
}

interface UseDashboardReturn {
  data: DashboardData | null
  loading: boolean
  error: DashboardError | null
  refreshData: () => Promise<void>
  userRole: UserRole | undefined
  isStale: boolean  // Indicates if data is older than STALE_TIME
  lastUpdated: Date | null
}

/**
 * Custom hook for managing dashboard data based on user role
 * 
 * Features:
 * - Role-based dashboard content
 * - Automatic caching with configurable duration
 * - Loading states and error handling
 * - Optimized re-renders with memoization
 * 
 * @returns {UseDashboardReturn} Dashboard data, loading state, error state, and refresh function
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, loading, error, refreshData } = useDashboard()
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage message={error} />
 *   if (!data) return <EmptyState />
 *   
 *   return <DashboardContent data={data} onRefresh={refreshData} />
 * }
 * ```
 */
export function useDashboard(): UseDashboardReturn {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<DashboardError | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Enhanced cache with metadata
  const cacheRef = useRef<{
    data: DashboardData | null
    timestamp: number
    role: UserRole | null
    retryCount: number
  }>({ data: null, timestamp: 0, role: null, retryCount: 0 })

  // Auto-refresh timer ref
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate if data is stale
  const isStale = lastUpdated 
    ? Date.now() - lastUpdated.getTime() > DASHBOARD_CONFIG.STALE_TIME
    : false

  // Utility function to create typed errors
  const createError = useCallback((type: DashboardError['type'], message: string, retryable = true): DashboardError => ({
    type,
    message,
    retryable
  }), [])

  // Debug utility for development-only logging
  const debugLog = useCallback((message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Dashboard Hook] ${message}`, data)
    }
  }, [])

  // Setup auto-refresh based on role configuration
  const setupAutoRefresh = useCallback((role: UserRole) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
    }

    const roleConfig = getRoleConfig(role)
    refreshTimerRef.current = setInterval(() => {
      debugLog('Auto-refreshing dashboard data', { role, interval: roleConfig.refreshInterval })
      fetchDashboardData(role, true)
    }, roleConfig.refreshInterval)
  }, [])

  // Cleanup auto-refresh on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [])

  // Enhanced fetch function with retry logic
  const fetchDashboardData = useCallback(async (role: UserRole, forceRefresh = false) => {
    // Check cache first
    const now = Date.now()
    const isCacheValid = 
      !forceRefresh &&
      cacheRef.current.role === role &&
      cacheRef.current.data &&
      (now - cacheRef.current.timestamp) < DASHBOARD_CONFIG.CACHE_DURATION

    if (isCacheValid) {
      debugLog('Using cached dashboard data', { role, cacheAge: now - cacheRef.current.timestamp })
      setData(cacheRef.current.data)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const attemptFetch = async (attempt: number): Promise<void> => {
      try {
        debugLog('Fetching dashboard data', { role, attempt, forceRefresh })
        
        // Simulate API delay for realistic behavior
        await new Promise(resolve => setTimeout(resolve, DASHBOARD_CONFIG.SIMULATED_DELAY))
        
        const dashboardData = getDashboardDataByRole(role)
        
        // Apply role-specific limits
        const roleConfig = getRoleConfig(role)
        if (dashboardData.quickActions.length > roleConfig.maxQuickActions) {
          dashboardData.quickActions = dashboardData.quickActions.slice(0, roleConfig.maxQuickActions)
        }
        
        // Update cache with reset retry count
        cacheRef.current = {
          data: dashboardData,
          timestamp: now,
          role,
          retryCount: 0
        }
        
        setData(dashboardData)
        setLastUpdated(new Date())
        setError(null)
        
        debugLog('Dashboard data loaded successfully', { role, dataKeys: Object.keys(dashboardData) })
        
        // Setup auto-refresh for this role
        setupAutoRefresh(role)
        
      } catch (err) {
        const errorType = err instanceof Error && err.name === 'NetworkError' ? 'network' : 'data'
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
        
        debugLog('Dashboard data fetch failed', { role, attempt, error: errorMessage })
        
        // Retry logic
        if (attempt < DASHBOARD_CONFIG.MAX_RETRY_ATTEMPTS) {
          debugLog('Retrying dashboard data fetch', { role, nextAttempt: attempt + 1 })
          await new Promise(resolve => setTimeout(resolve, DASHBOARD_CONFIG.RETRY_DELAY * attempt))
          return attemptFetch(attempt + 1)
        }
        
        // Max retries reached
        setError(createError(errorType, errorMessage))
        cacheRef.current.retryCount = attempt
        throw err
      }
    }

    try {
      await attemptFetch(1)
    } catch (err) {
      debugLog('All retry attempts failed', { role, error: err })
    } finally {
      setLoading(false)
    }
  }, [debugLog, createError, setupAutoRefresh])

  // Memoize refresh function with force refresh option
  const refreshData = useCallback(async () => {
    if (!user?.role) {
      setError(createError('auth', 'User role not available', false))
      return
    }
    
    try {
      await fetchDashboardData(user.role as UserRole, true) // Force refresh
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh dashboard data'
      setError(createError('unknown', errorMessage))
    }
  }, [user?.role, fetchDashboardData, createError])

  // Effect for initial data loading
  useEffect(() => {
    console.log('Dashboard Hook - User data received:', { userEmail: user?.email, role: user?.role })
    
    if (!user) {
      console.log('Dashboard Hook - No user found, keeping loading state')
      return
    }
    
    if (!user?.role) {
      console.log('Dashboard Hook - No user role found, setting error state')
      setLoading(false)
      setData(null)
      setError(createError('auth', 'User role not available', false))
      return
    }

    console.log('Dashboard Hook - Fetching dashboard data for role:', user.role)
    fetchDashboardData(user.role as UserRole)
  }, [user, fetchDashboardData, createError])

  return {
    data,
    loading,
    error,
    refreshData,
    userRole: user?.role as UserRole | undefined,
    isStale,
    lastUpdated
  }
}

// Dashboard data strategies for different user roles
interface DashboardStrategy {
  getStats(): DashboardStats
  getRecentActivity(): DashboardData['recentActivity']
  getQuickActions(): DashboardData['quickActions']
}

// Utility functions for creating dashboard items
const createActivity = (
  id: string,
  title: string,
  description: string,
  timestamp: string,
  type: ActivityItem['type'] = 'info',
  actionUrl?: string
): ActivityItem => ({
  id,
  title,
  description,
  timestamp,
  type,
  actionUrl
})

const createQuickAction = (
  id: string,
  title: string,
  description: string,
  href: string,
  icon: IconName,
  color: QuickAction['color'],
  disabled = false
): QuickAction => ({
  id,
  title,
  description,
  href,
  icon,
  color,
  disabled
})

class BaseDashboardStrategy implements DashboardStrategy {
  protected getBaseActivity(): ActivityItem[] {
    return [
      createActivity(
        '1',
        'System notification',
        'Welcome to ICT University dashboard',
        '2 hours ago',
        'info'
      )
    ]
  }

  getStats(): DashboardStats {
    return {}
  }

  getRecentActivity(): DashboardData['recentActivity'] {
    return this.getBaseActivity()
  }

  getQuickActions(): DashboardData['quickActions'] {
    return []
  }
}

class StudentDashboardStrategy extends BaseDashboardStrategy {
  getStats(): DashboardStats {
    return {
      gpa: { value: '3.85', label: 'Current GPA', change: 'Out of 4.0', trend: 'up' },
      courses: { value: 6, label: 'Enrolled Courses', change: 'This semester', trend: 'neutral' },
      attendance: { value: '94%', label: 'Attendance', change: 'Overall rate', trend: 'up' },
      fees: { value: '$0', label: 'Pending Fees', change: 'All paid up', trend: 'neutral' }
    }
  }

  getRecentActivity(): DashboardData['recentActivity'] {
    return [
      ...this.getBaseActivity(),
      createActivity(
        '2',
        'New assignment posted',
        'Mathematics assignment due next week',
        '1 day ago',
        'info',
        '/assignments/math-101'
      ),
      createActivity(
        '3',
        'Grade updated',
        'Physics midterm grade is now available',
        '3 days ago',
        'success',
        '/grades'
      )
    ]
  }

  getQuickActions(): DashboardData['quickActions'] {
    return [
      createQuickAction('1', 'My Courses', 'Access course materials', '/courses', 'bookOpen', 'orange'),
      createQuickAction('2', 'My Grades', 'View academic performance', '/grades', 'award', 'blue'),
      createQuickAction('3', 'Assignments', 'View pending assignments', '/assignments', 'fileText', 'green'),
      createQuickAction('4', 'Schedule', 'View class schedule', '/schedule', 'calendar', 'red'),
      createQuickAction('5', 'Timetable', 'View timetables and exam schedules', '/timetable', 'calendar', 'blue'),
      createQuickAction('6', 'Announcements', 'Read important announcements', '/announcements', 'bell', 'orange')
    ]
  }
}

class StaffDashboardStrategy extends BaseDashboardStrategy {
  getStats(): DashboardStats {
    return {
      courses: { value: 8, label: 'My Courses', change: 'Active this semester', trend: 'neutral' },
      students: { value: 234, label: 'Total Students', change: 'Across all courses', trend: 'up' },
      pending: { value: 15, label: 'Pending Grades', change: 'Assignments to grade', trend: 'down' },
      exams: { value: 3, label: 'Upcoming Exams', change: 'Next 2 weeks', trend: 'neutral' }
    }
  }

  getRecentActivity(): DashboardData['recentActivity'] {
    return [
      ...this.getBaseActivity(),
      createActivity(
        '2',
        'Grade submission reminder',
        'Mathematics midterm grades due tomorrow',
        '3 hours ago',
        'warning',
        '/grades/submit'
      ),
      createActivity(
        '3',
        'New student enrollment',
        'John Doe enrolled in CS101',
        '1 day ago',
        'info',
        '/courses/cs101/students'
      )
    ]
  }

  getQuickActions(): DashboardData['quickActions'] {
    return [
      createQuickAction('1', 'Course Management', 'Manage course content', '/courses', 'bookOpen', 'orange'),
      createQuickAction('2', 'Grade Management', 'Enter student grades', '/grades', 'award', 'blue'),
      createQuickAction('3', 'Attendance', 'Track student attendance', '/attendance', 'checkCircle', 'green'),
      createQuickAction('4', 'Reports', 'Generate course reports', '/reports', 'barChart3', 'red')
    ]
  }
}

class AdminDashboardStrategy extends BaseDashboardStrategy {
  getStats(): DashboardStats {
    return {
      users: { value: '1,247', label: 'Total Users', change: '+12 new this week', trend: 'up' },
      health: { value: '98.5%', label: 'System Health', change: 'All systems operational', trend: 'up' },
      sessions: { value: 342, label: 'Active Sessions', change: 'Current active users', trend: 'neutral' },
      alerts: { value: 2, label: 'Security Alerts', change: 'Require attention', trend: 'down' }
    }
  }

  getRecentActivity(): DashboardData['recentActivity'] {
    return [
      ...this.getBaseActivity(),
      createActivity(
        '2',
        'Security alert',
        'Multiple failed login attempts detected',
        '30 minutes ago',
        'error',
        '/admin/security/alerts'
      ),
      createActivity(
        '3',
        'System backup completed',
        'Daily backup completed successfully',
        '2 hours ago',
        'success',
        '/admin/system/backups'
      )
    ]
  }

  getQuickActions(): DashboardData['quickActions'] {
    return [
      createQuickAction('1', 'User Management', 'Manage system users', '/admin/users', 'users', 'orange'),
      createQuickAction('2', 'System Reports', 'Generate reports', '/admin/reports', 'barChart3', 'blue'),
      createQuickAction('3', 'Security Center', 'Monitor security', '/admin/security', 'shield', 'red'),
      createQuickAction('4', 'System Settings', 'Configure system', '/admin/settings', 'settings', 'green')
    ]
  }
}

// Factory for creating dashboard strategies with lazy initialization
class DashboardStrategyFactory {
  private static strategies = new Map<string, DashboardStrategy>()
  
  private static createStrategy(role: string): DashboardStrategy {
    switch (role) {
      case 'student':
        return new StudentDashboardStrategy()
      case 'academic_staff':
      case 'staff':
        return new StaffDashboardStrategy()
      case 'system_admin':
      case 'admin':
        return new AdminDashboardStrategy()
      case 'hr_personnel':
        return new StaffDashboardStrategy() // HR uses staff dashboard for now
      case 'finance_staff':
        return new StaffDashboardStrategy() // Finance uses staff dashboard for now
      case 'marketing_team':
        return new StaffDashboardStrategy() // Marketing uses staff dashboard for now
      default:
        return new BaseDashboardStrategy()
    }
  }

  static getStrategy(role: string): DashboardStrategy {
    if (!this.strategies.has(role)) {
      this.strategies.set(role, this.createStrategy(role))
    }
    return this.strategies.get(role)!
  }

  // Method to clear cache if needed (useful for testing)
  static clearCache(): void {
    this.strategies.clear()
  }
}

// Improved data generator using strategy pattern
function getDashboardDataByRole(role: string): DashboardData {
  const strategy = DashboardStrategyFactory.getStrategy(role)
  
  return {
    stats: strategy.getStats(),
    recentActivity: strategy.getRecentActivity(),
    quickActions: strategy.getQuickActions()
  }
}
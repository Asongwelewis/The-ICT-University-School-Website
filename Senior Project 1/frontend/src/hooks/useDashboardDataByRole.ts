'use client'

import { useState, useEffect } from 'react'
import { UserRole } from '@/components/dashboard/DashboardFactory'

// Base interfaces for dashboard data
export interface DashboardStat {
  id: string
  title: string
  value: string | number
  change?: string
  icon: string
  color: 'orange' | 'blue' | 'green' | 'red'
  trend?: 'up' | 'down' | 'stable'
}

export interface DashboardAction {
  id: string
  title: string
  description: string
  icon: string
  color: 'orange' | 'blue'
  progress?: number
  buttonText: string
  onClick?: () => void
}

export interface RoleDashboardData {
  stats: DashboardStat[]
  actions: DashboardAction[]
  title: string
  description: string
}

// Mock data generators for each role
const generateSystemAdminData = (): RoleDashboardData => ({
  title: 'System Administration Dashboard',
  description: 'Comprehensive system management and oversight',
  stats: [
    {
      id: 'total-users',
      title: 'Total Users',
      value: 1247,
      change: '+12 new this week',
      icon: 'Users',
      color: 'orange'
    },
    {
      id: 'system-health',
      title: 'System Health',
      value: '98.5%',
      change: 'All systems operational',
      icon: 'CheckCircle',
      color: 'blue'
    },
    {
      id: 'active-sessions',
      title: 'Active Sessions',
      value: 342,
      change: 'Current active users',
      icon: 'Clock',
      color: 'orange'
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      value: 2,
      change: 'Require attention',
      icon: 'Shield',
      color: 'blue'
    }
  ],
  actions: [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: 'Users',
      color: 'orange',
      progress: 85,
      buttonText: 'Manage Users'
    },
    {
      id: 'system-config',
      title: 'System Configuration',
      description: 'Configure system settings and preferences',
      icon: 'Settings',
      color: 'blue',
      progress: 95,
      buttonText: 'Configure System'
    },
    {
      id: 'system-reports',
      title: 'System Reports',
      description: 'Generate comprehensive system reports',
      icon: 'BarChart3',
      color: 'orange',
      progress: 78,
      buttonText: 'Generate Reports'
    }
  ]
})

const generateStudentData = (): RoleDashboardData => ({
  title: 'Student Portal',
  description: 'Access your academic information and services',
  stats: [
    {
      id: 'current-gpa',
      title: 'Current GPA',
      value: '3.85',
      change: 'Out of 4.0',
      icon: 'Award',
      color: 'orange'
    },
    {
      id: 'enrolled-courses',
      title: 'Enrolled Courses',
      value: 6,
      change: 'This semester',
      icon: 'BookOpen',
      color: 'blue'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      value: '94%',
      change: 'Overall rate',
      icon: 'CheckCircle',
      color: 'orange'
    },
    {
      id: 'pending-fees',
      title: 'Pending Fees',
      value: '$0',
      change: 'All paid up',
      icon: 'DollarSign',
      color: 'blue'
    }
  ],
  actions: [
    {
      id: 'my-courses',
      title: 'My Courses',
      description: 'Access course materials and content',
      icon: 'BookOpen',
      color: 'orange',
      buttonText: 'View Courses'
    },
    {
      id: 'my-grades',
      title: 'My Grades',
      description: 'View your academic performance',
      icon: 'Award',
      color: 'blue',
      buttonText: 'View Grades'
    },
    {
      id: 'fee-payments',
      title: 'Fee Payments',
      description: 'Manage your tuition and fees',
      icon: 'DollarSign',
      color: 'orange',
      buttonText: 'Manage Payments'
    }
  ]
})

// Add other role data generators...
const generateAcademicStaffData = (): RoleDashboardData => ({
  title: 'Academic Staff Dashboard',
  description: 'Manage your courses, students, and academic activities',
  stats: [
    {
      id: 'my-courses',
      title: 'My Courses',
      value: 8,
      change: 'Active this semester',
      icon: 'BookOpen',
      color: 'orange'
    },
    {
      id: 'total-students',
      title: 'Total Students',
      value: 234,
      change: 'Across all courses',
      icon: 'Users',
      color: 'blue'
    },
    {
      id: 'pending-grades',
      title: 'Pending Grades',
      value: 15,
      change: 'Assignments to grade',
      icon: 'Award',
      color: 'orange'
    },
    {
      id: 'upcoming-exams',
      title: 'Upcoming Exams',
      value: 3,
      change: 'Next 2 weeks',
      icon: 'Calendar',
      color: 'blue'
    }
  ],
  actions: [
    {
      id: 'course-management',
      title: 'Course Management',
      description: 'Manage your course content and materials',
      icon: 'BookOpen',
      color: 'orange',
      buttonText: 'Manage Courses'
    },
    {
      id: 'student-performance',
      title: 'Student Performance',
      description: 'Track and analyze student progress',
      icon: 'BarChart3',
      color: 'blue',
      buttonText: 'View Analytics'
    },
    {
      id: 'grade-management',
      title: 'Grade Management',
      description: 'Enter and manage student grades',
      icon: 'Award',
      color: 'orange',
      buttonText: 'Manage Grades'
    }
  ]
})

// Data factory
const ROLE_DATA_GENERATORS: Record<UserRole, () => RoleDashboardData> = {
  system_admin: generateSystemAdminData,
  academic_staff: generateAcademicStaffData,
  student: generateStudentData,
  hr_personnel: generateSystemAdminData, // Placeholder - implement specific data
  finance_staff: generateSystemAdminData, // Placeholder - implement specific data
  marketing_team: generateSystemAdminData // Placeholder - implement specific data
}

export function useDashboardDataByRole(role: UserRole) {
  const [data, setData] = useState<RoleDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Get data generator for role
      const dataGenerator = ROLE_DATA_GENERATORS[role]
      
      if (!dataGenerator) {
        throw new Error(`No data generator found for role: ${role}`)
      }
      
      // In a real app, this would be an API call:
      // const response = await apiClient.getDashboardData(role)
      // setData(response.data)
      
      const dashboardData = dataGenerator()
      setData(dashboardData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [role])

  const refreshData = async () => {
    await fetchDashboardData()
  }

  return {
    data,
    loading,
    error,
    refreshData
  }
}

// Utility functions
export const DashboardDataUtils = {
  /**
   * Format stat value for display
   */
  formatStatValue(value: string | number): string {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value
  },

  /**
   * Get icon color classes
   */
  getIconColorClass(color: DashboardStat['color']): string {
    const colorMap = {
      orange: 'text-orange-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
      red: 'text-red-500'
    }
    return colorMap[color]
  },

  /**
   * Get border color classes
   */
  getBorderColorClass(color: DashboardStat['color']): string {
    const colorMap = {
      orange: 'border-orange-200 dark:border-orange-800',
      blue: 'border-blue-200 dark:border-blue-800',
      green: 'border-green-200 dark:border-green-800',
      red: 'border-red-200 dark:border-red-800'
    }
    return colorMap[color]
  },

  /**
   * Get value color classes for stat values
   */
  getValueColorClass(color: DashboardStat['color']): string {
    const colorMap = {
      orange: 'text-orange-600 dark:text-orange-400',
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      red: 'text-red-600 dark:text-red-400'
    }
    return colorMap[color]
  },

  /**
   * Get text color classes for action cards
   */
  getTextColorClass(color: DashboardAction['color']): string {
    const colorMap = {
      orange: 'text-orange-700 dark:text-orange-300',
      blue: 'text-blue-700 dark:text-blue-300'
    }
    return colorMap[color]
  },

  /**
   * Get button color classes for action cards
   */
  getButtonColorClass(color: DashboardAction['color']): string {
    const colorMap = {
      orange: 'bg-orange-500 hover:bg-orange-600',
      blue: 'bg-blue-500 hover:bg-blue-600'
    }
    return colorMap[color]
  }
}
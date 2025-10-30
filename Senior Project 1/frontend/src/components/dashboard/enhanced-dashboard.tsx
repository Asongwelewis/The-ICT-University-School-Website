'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/use-dashboard'
import { statIcons, getIcon } from '@/lib/icons'
import { Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { UserDebug } from '@/components/debug/user-debug'

// Role-based configuration using Strategy pattern
const ROLE_CONFIG = {
  student: {
    title: 'Student Portal',
    description: 'Access your academic information and services',
    theme: 'orange',
    headerGradient: 'from-orange-50 to-blue-50',
    borderColor: 'border-orange-200',
    titleColor: 'text-orange-700'
  },
  academic_staff: {
    title: 'Academic Staff Dashboard',
    description: 'Manage your courses, students, and academic activities',
    theme: 'blue',
    headerGradient: 'from-blue-50 to-green-50',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-700'
  },
  staff: {
    title: 'Staff Dashboard',
    description: 'Access your work tools and information',
    theme: 'blue',
    headerGradient: 'from-blue-50 to-green-50',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-700'
  },
  system_admin: {
    title: 'System Administration Dashboard',
    description: 'Comprehensive system management and oversight',
    theme: 'red',
    headerGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-700'
  },
  admin: {
    title: 'Administration Dashboard',
    description: 'System management and administrative tools',
    theme: 'red',
    headerGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-700'
  },
  hr_personnel: {
    title: 'HR Management Dashboard',
    description: 'Employee management and HR operations',
    theme: 'green',
    headerGradient: 'from-green-50 to-blue-50',
    borderColor: 'border-green-200',
    titleColor: 'text-green-700'
  },
  finance_staff: {
    title: 'Finance Dashboard',
    description: 'Financial management and reporting',
    theme: 'purple',
    headerGradient: 'from-purple-50 to-blue-50',
    borderColor: 'border-purple-200',
    titleColor: 'text-purple-700'
  },
  marketing_team: {
    title: 'Marketing Dashboard',
    description: 'Campaign management and analytics',
    theme: 'pink',
    headerGradient: 'from-pink-50 to-orange-50',
    borderColor: 'border-pink-200',
    titleColor: 'text-pink-700'
  }
} as const

type UserRole = keyof typeof ROLE_CONFIG

// Utility function to get role configuration with fallback
const getRoleConfig = (role: string | undefined) => {
  if (!role) return ROLE_CONFIG.student
  return ROLE_CONFIG[role as UserRole] || ROLE_CONFIG.student
}

export function EnhancedDashboard() {
  const { data, loading, error, refreshData, userRole } = useDashboard()
  const roleConfig = getRoleConfig(userRole)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    )
  }

  // Role configuration is now handled by getRoleConfig utility

  return (
    <div className="space-y-6">
      {/* Debug Component - Only show in development */}
      {process.env.NODE_ENV === 'development' && <UserDebug />}
      
      {/* Header */}
      <div className={`bg-gradient-to-r ${roleConfig.headerGradient} p-6 rounded-lg border ${roleConfig.borderColor}`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-bold ${roleConfig.titleColor}`}>{roleConfig.title}</h1>
            <p className="text-gray-600">{roleConfig.description}</p>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {Object.keys(data.stats).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.stats).map(([key, stat], index) => {
            const isOrange = index % 2 === 0
            const borderColor = isOrange ? 'border-orange-200' : 'border-blue-200'
            const iconColor = isOrange ? 'text-orange-500' : 'text-blue-500'
            const valueColor = isOrange ? 'text-orange-600' : 'text-blue-600'
            
            // Get the appropriate icon for this stat with proper fallback
            const IconComponent = getIcon(key as any) || getIcon('barChart3')
            
            return (
              <Card key={key} className={borderColor}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${valueColor}`}>{stat.value}</div>
                  {stat.change && (
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      {data.quickActions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.quickActions.map((action) => {
            // Use role-based theming for better consistency
            const themeColors = {
              orange: { border: 'border-orange-200', title: 'text-orange-700' },
              blue: { border: 'border-blue-200', title: 'text-blue-700' },
              green: { border: 'border-green-200', title: 'text-green-700' },
              red: { border: 'border-red-200', title: 'text-red-700' }
            }
            
            const colors = themeColors[action.color] || themeColors.orange
            const IconComponent = getIcon(action.icon) || getIcon('bookOpen')
            
            return (
              <Link key={action.id} href={action.href}>
                <Card className={`${colors.border} hover:shadow-md transition-shadow cursor-pointer`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${colors.title}`}>
                      <IconComponent className="h-5 w-5" />
                      {action.title}
                    </CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Recent Activity */}
      {data.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="bg-orange-500 text-white rounded-t-lg">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.recentActivity.map((activity) => {
                const dotColor = {
                  info: 'bg-blue-500',
                  success: 'bg-green-500',
                  warning: 'bg-orange-500',
                  error: 'bg-red-500'
                }[activity.type]

                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${dotColor} rounded-full`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
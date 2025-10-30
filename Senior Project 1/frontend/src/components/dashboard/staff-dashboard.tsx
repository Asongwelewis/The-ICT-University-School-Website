'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Award, Calendar, LucideIcon } from 'lucide-react'
import Link from 'next/link'

/**
 * Staff dashboard statistics interface
 */
interface StaffStats {
  myCourses: number
  totalStudents: number
  pendingGrades: number
  upcomingExams: number
}

/**
 * Props for the StaffDashboard component
 */
interface StaffDashboardProps {
  stats?: StaffStats
  loading?: boolean
  className?: string
}

/**
 * Props for individual stat cards
 */
interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  variant: 'orange' | 'blue'
  loading?: boolean
}

/**
 * Props for quick action cards
 */
interface QuickActionCardProps {
  href: string
  title: string
  description: string
  icon: LucideIcon
  variant: 'orange' | 'blue'
}

/**
 * Configuration for dashboard statistics
 */
const STAFF_STATS_CONFIG: Array<{
  key: keyof StaffStats
  title: string
  description: string
  icon: LucideIcon
  variant: 'orange' | 'blue'
}> = [
  {
    key: 'myCourses',
    title: 'My Courses',
    description: 'Active this semester',
    icon: BookOpen,
    variant: 'orange'
  },
  {
    key: 'totalStudents',
    title: 'Total Students',
    description: 'Across all courses',
    icon: Users,
    variant: 'blue'
  },
  {
    key: 'pendingGrades',
    title: 'Pending Grades',
    description: 'Assignments to grade',
    icon: Award,
    variant: 'orange'
  },
  {
    key: 'upcomingExams',
    title: 'Upcoming Exams',
    description: 'Next 2 weeks',
    icon: Calendar,
    variant: 'blue'
  }
]

/**
 * Configuration for quick action cards
 */
const QUICK_ACTIONS_CONFIG: QuickActionCardProps[] = [
  {
    href: '/courses',
    title: 'Course Management',
    description: 'Manage your course content and materials',
    icon: BookOpen,
    variant: 'orange'
  },
  {
    href: '/students',
    title: 'Student Performance',
    description: 'Track and analyze student progress',
    icon: Users,
    variant: 'blue'
  },
  {
    href: '/grades',
    title: 'Grade Management',
    description: 'Enter and manage student grades',
    icon: Award,
    variant: 'orange'
  }
]

/**
 * Color configuration for different variants
 */
const COLOR_VARIANTS = {
  orange: {
    border: 'border-orange-200',
    icon: 'text-orange-500',
    value: 'text-orange-600',
    title: 'text-orange-700'
  },
  blue: {
    border: 'border-blue-200',
    icon: 'text-blue-500',
    value: 'text-blue-600',
    title: 'text-blue-700'
  }
} as const

/**
 * Individual statistic card component
 */
const StatCard = memo<StatCardProps>(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant,
  loading = false 
}) => {
  const colors = COLOR_VARIANTS[variant]

  return (
    <Card className={colors.border}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colors.icon}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        ) : (
          <>
            <div className={`text-2xl font-bold ${colors.value}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

/**
 * Quick action card component
 */
const QuickActionCard = memo<QuickActionCardProps>(({ 
  href, 
  title, 
  description, 
  icon: Icon, 
  variant 
}) => {
  const colors = COLOR_VARIANTS[variant]

  return (
    <Link href={href}>
      <Card className={`${colors.border} hover:shadow-md transition-shadow cursor-pointer`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${colors.title}`}>
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
})

QuickActionCard.displayName = 'QuickActionCard'

/**
 * Dashboard header component
 */
const DashboardHeader = memo(() => (
  <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-lg border border-orange-200">
    <h1 className="text-2xl font-bold text-orange-700">Academic Staff Dashboard</h1>
    <p className="text-gray-600">Manage your courses, students, and academic activities</p>
  </div>
))

DashboardHeader.displayName = 'DashboardHeader'

/**
 * Loading skeleton for the dashboard
 */
const StaffDashboardSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-96" />
    </div>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
))

StaffDashboardSkeleton.displayName = 'StaffDashboardSkeleton'

/**
 * Main Staff Dashboard Component
 * 
 * Displays key statistics and quick actions for academic staff members.
 * Supports loading states and customizable statistics.
 * 
 * @param stats - Dashboard statistics (optional, defaults to zeros)
 * @param loading - Loading state indicator
 * @param className - Additional CSS classes
 */
export const StaffDashboard = memo<StaffDashboardProps>(({ 
  stats, 
  loading = false, 
  className = '' 
}) => {
  // Default stats when none provided
  const defaultStats: StaffStats = {
    myCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    upcomingExams: 0
  }

  const displayStats = stats || defaultStats

  // Memoize stat cards to prevent unnecessary re-renders
  const statCards = useMemo(() => 
    STAFF_STATS_CONFIG.map((config) => (
      <StatCard
        key={config.key}
        title={config.title}
        value={displayStats[config.key]}
        description={config.description}
        icon={config.icon}
        variant={config.variant}
        loading={loading}
      />
    )), [displayStats, loading]
  )

  // Memoize action cards (static content)
  const actionCards = useMemo(() => 
    QUICK_ACTIONS_CONFIG.map((action) => (
      <QuickActionCard key={action.href} {...action} />
    )), []
  )

  // Show skeleton during loading
  if (loading && !stats) {
    return <StaffDashboardSkeleton />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <DashboardHeader />

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actionCards}
      </div>
    </div>
  )
})

StaffDashboard.displayName = 'StaffDashboard'
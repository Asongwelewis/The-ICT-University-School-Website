'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Shield } from 'lucide-react'
import { DashboardStat, DashboardAction, DashboardDataUtils } from '@/hooks/useDashboardDataByRole'
import { getIcon } from './IconMap'

interface DashboardHeaderProps {
  /** The main title to display in the header */
  title: string
  /** A brief description or subtitle */
  description: string
  /** Additional CSS classes to apply */
  className?: string
}

/**
 * Dashboard header component that displays the main title and description
 * with consistent styling and theming support.
 * 
 * @example
 * ```tsx
 * <DashboardHeader 
 *   title="Student Dashboard" 
 *   description="Welcome to your academic portal" 
 * />
 * ```
 */
export function DashboardHeader({ title, description, className = '' }: DashboardHeaderProps) {
  return (
    <div className={`bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800 ${className}`}>
      <h1 className="text-orange-700 dark:text-orange-300 text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

interface DashboardStatCardProps {
  stat: DashboardStat
  className?: string
}

// Add prop validation for better development experience
const validateDashboardStat = (stat: DashboardStat): boolean => {
  const requiredFields = ['id', 'title', 'value', 'icon', 'color'] as const
  return requiredFields.every(field => stat[field] !== undefined && stat[field] !== null)
}

export const DashboardStatCard = React.memo(({ stat, className = '' }: DashboardStatCardProps) => {
  // Validate stat data in development
  if (process.env.NODE_ENV === 'development' && !validateDashboardStat(stat)) {
    console.error('[DashboardStatCard] Invalid stat data:', stat)
    return null
  }

  const IconComponent = getIcon(stat.icon)
  const iconColorClass = DashboardDataUtils.getIconColorClass(stat.color)
  const borderColorClass = DashboardDataUtils.getBorderColorClass(stat.color)

  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[DashboardStatCard] Icon "${stat.icon}" not found, component will not render`)
    }
    return null
  }

  return (
    <Card className={`${borderColorClass} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <IconComponent className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${DashboardDataUtils.getValueColorClass(stat.color)}`}>
          {DashboardDataUtils.formatStatValue(stat.value)}
        </div>
        {stat.change && (
          <p className="text-xs text-muted-foreground">{stat.change}</p>
        )}
        {stat.trend && (
          <div className="flex items-center mt-1">
            <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === 'up' ? 'text-green-500' :
              stat.trend === 'down' ? 'text-red-500' :
                'text-gray-500'
              }`} />
            <span className="text-xs text-muted-foreground">
              {stat.trend === 'up' ? 'Trending up' :
                stat.trend === 'down' ? 'Trending down' :
                  'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface DashboardStatsGridProps {
  stats: DashboardStat[]
  className?: string
}

export const DashboardStatsGrid = React.memo(({ stats, className = '' }: DashboardStatsGridProps) => {
  // For large datasets, consider implementing virtualization
  const shouldVirtualize = stats.length > 20

  if (shouldVirtualize && process.env.NODE_ENV === 'development') {
    console.info('[DashboardStatsGrid] Large dataset detected. Consider implementing virtualization for better performance.')
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {stats.map((stat) => (
        <DashboardStatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
})

interface DashboardActionCardProps {
  action: DashboardAction
  className?: string
}

export const DashboardActionCard = React.memo(({ action, className = '' }: DashboardActionCardProps) => {
  const IconComponent = getIcon(action.icon)
  const borderColorClass = DashboardDataUtils.getBorderColorClass(action.color)
  const textColorClass = DashboardDataUtils.getTextColorClass(action.color)
  const buttonColorClass = DashboardDataUtils.getButtonColorClass(action.color)

  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[DashboardActionCard] Icon "${action.icon}" not found, component will not render`)
    }
    return null
  }

  return (
    <Card className={`${borderColorClass} hover:shadow-md transition-shadow cursor-pointer ${className}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${textColorClass}`}>
          <IconComponent className="h-5 w-5" />
          {action.title}
        </CardTitle>
        <CardDescription>{action.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {action.progress !== undefined && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{action.progress}%</span>
            </div>
            <Progress value={action.progress} className="h-2" />
          </div>
        )}
        <Button
          className={`w-full ${buttonColorClass} text-white`}
          onClick={action.onClick}
          aria-label={`${action.title}: ${action.description}`}
        >
          {action.buttonText}
        </Button>
      </CardContent>
    </Card>
  )
})

interface DashboardActionsGridProps {
  actions: DashboardAction[]
  className?: string
}

export const DashboardActionsGrid = React.memo(({ actions, className = '' }: DashboardActionsGridProps) => {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {actions.map((action) => (
        <DashboardActionCard key={action.id} action={action} />
      ))}
    </div>
  )
})

interface DashboardLayoutProps {
  title: string
  description: string
  stats: DashboardStat[]
  actions: DashboardAction[]
  children?: React.ReactNode
  className?: string
}

export function DashboardLayout({
  title,
  description,
  stats,
  actions,
  children,
  className = ''
}: DashboardLayoutProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <DashboardHeader title={title} description={description} />
      <DashboardStatsGrid stats={stats} />
      <DashboardActionsGrid actions={actions} />
      {children}
    </div>
  )
}

// Loading and Error states
interface DashboardLoadingProps {
  message?: string
}

export function DashboardLoading({ message = 'Loading dashboard...' }: DashboardLoadingProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">{message}</div>
      </div>
    </div>
  )
}

interface DashboardErrorProps {
  error: string
  onRetry?: () => void
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <div className="space-y-6">
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
          <CardDescription>
            Failed to load dashboard data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
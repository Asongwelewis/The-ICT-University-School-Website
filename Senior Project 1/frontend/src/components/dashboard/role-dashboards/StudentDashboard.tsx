'use client'

import { useDashboardDataByRole } from '@/hooks/useDashboardDataByRole'
import { DashboardLayout, DashboardLoading, DashboardError } from '../DashboardComponents'

export function StudentDashboard() {
  const { data, loading, error, refreshData } = useDashboardDataByRole('student')

  if (loading) {
    return <DashboardLoading message="Loading your student portal..." />
  }

  if (error) {
    return <DashboardError error={error} onRetry={refreshData} />
  }

  if (!data) {
    return <DashboardError error="Student dashboard data not available" onRetry={refreshData} />
  }

  return (
    <DashboardLayout
      title={data.title}
      description={data.description}
      stats={data.stats}
      actions={data.actions}
    />
  )
}
'use client'

import { useDashboardDataByRole } from '@/hooks/useDashboardDataByRole'
import { DashboardLayout, DashboardLoading, DashboardError } from '../DashboardComponents'

export function HRDashboard() {
  const { data, loading, error, refreshData } = useDashboardDataByRole('hr_personnel')

  if (loading) {
    return <DashboardLoading message="Loading HR management dashboard..." />
  }

  if (error) {
    return <DashboardError error={error} onRetry={refreshData} />
  }

  if (!data) {
    return <DashboardError error="HR dashboard data not available" onRetry={refreshData} />
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
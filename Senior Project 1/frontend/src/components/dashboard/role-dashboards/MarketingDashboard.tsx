'use client'

import { useDashboardDataByRole } from '@/hooks/useDashboardDataByRole'
import { DashboardLayout, DashboardLoading, DashboardError } from '../DashboardComponents'

export function MarketingDashboard() {
  const { data, loading, error, refreshData } = useDashboardDataByRole('marketing_team')

  if (loading) {
    return <DashboardLoading message="Loading marketing dashboard..." />
  }

  if (error) {
    return <DashboardError error={error} onRetry={refreshData} />
  }

  if (!data) {
    return <DashboardError error="Marketing dashboard data not available" onRetry={refreshData} />
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
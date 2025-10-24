'use client'

import { useDashboardDataByRole } from '@/hooks/useDashboardDataByRole'
import { DashboardLayout, DashboardLoading, DashboardError } from '../DashboardComponents'

export function FinanceDashboard() {
  const { data, loading, error, refreshData } = useDashboardDataByRole('finance_staff')

  if (loading) {
    return <DashboardLoading message="Loading finance management dashboard..." />
  }

  if (error) {
    return <DashboardError error={error} onRetry={refreshData} />
  }

  if (!data) {
    return <DashboardError error="Finance dashboard data not available" onRetry={refreshData} />
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
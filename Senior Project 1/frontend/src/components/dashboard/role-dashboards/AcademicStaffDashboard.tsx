'use client'

import { useDashboardDataByRole } from '@/hooks/useDashboardDataByRole'
import { DashboardLayout, DashboardLoading, DashboardError } from '../DashboardComponents'

export function AcademicStaffDashboard() {
  const { data, loading, error, refreshData } = useDashboardDataByRole('academic_staff')

  if (loading) {
    return <DashboardLoading message="Loading your academic dashboard..." />
  }

  if (error) {
    return <DashboardError error={error} onRetry={refreshData} />
  }

  if (!data) {
    return <DashboardError error="Academic staff dashboard data not available" onRetry={refreshData} />
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
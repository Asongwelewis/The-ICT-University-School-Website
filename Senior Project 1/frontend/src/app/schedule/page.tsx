'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ScheduleView } from '@/components/academic/schedule-view'

export default function SchedulePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ScheduleView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
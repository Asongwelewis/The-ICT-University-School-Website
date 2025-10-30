'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { TimetableView } from '@/components/academic/timetable-view'

export default function TimetablePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TimetableView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { GradesView } from '@/components/academic/grades-view'

export default function GradesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <GradesView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
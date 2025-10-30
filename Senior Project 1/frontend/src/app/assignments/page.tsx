'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AssignmentsView } from '@/components/academic/assignments-view'

export default function AssignmentsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AssignmentsView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
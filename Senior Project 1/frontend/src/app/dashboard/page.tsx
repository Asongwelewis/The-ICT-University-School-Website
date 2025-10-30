'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <EnhancedDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
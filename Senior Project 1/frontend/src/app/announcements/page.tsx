'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AnnouncementsView } from '@/components/academic/announcements-view'

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AnnouncementsView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
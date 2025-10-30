'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { CourseNotesView } from '@/components/academic/course-notes-view'

interface CourseNotesPageProps {
  params: {
    courseId: string
  }
}

export default function CourseNotesPage({ params }: CourseNotesPageProps) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CourseNotesView courseId={params.courseId} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
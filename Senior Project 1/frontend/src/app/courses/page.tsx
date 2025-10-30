'use client'

import { Suspense } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { CoursesView } from '@/components/academic/courses-view'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Loading component for better UX
function CoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error fallback component
function CoursesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="text-gray-600">
          We encountered an error while loading your courses. Please try again.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Courses Page Component
 * 
 * Features:
 * - Role-based access control
 * - Error boundary for graceful error handling
 * - Suspense for loading states
 * - Responsive layout with dashboard integration
 */
export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ErrorBoundary fallback={CoursesError}>
          <Suspense fallback={<CoursesLoading />}>
            <CoursesView />
          </Suspense>
        </ErrorBoundary>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
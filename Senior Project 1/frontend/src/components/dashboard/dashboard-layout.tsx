'use client'

import { DashboardHeader } from './components/dashboard-header'
import { SidebarNavigation } from './components/sidebar-navigation'
import { DashboardLayoutProps } from './types/dashboard-types'
<<<<<<< Updated upstream
import { ChatWidget } from '@/components/ai/chat-widget'


=======
import { AIProvider } from './providers/ai-provider'
import { DashboardErrorBoundary } from './components/dashboard-error-boundary-enhanced'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import { usePerformanceMonitor, useLifecycleMonitor } from '@/hooks/use-performance-monitor'
>>>>>>> Stashed changes

/**
 * Main dashboard layout component with enterprise-grade architecture
 * 
 * Features:
 * - Fixed header with user info and logout
 * - Slide-out sidebar navigation
 * - Responsive design with mobile-first approach
 * - Keyboard navigation support
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Separated AI functionality for better maintainability
 * - Performance optimized with custom hook and memoization
 * - Error boundary for graceful error handling
 * - Performance monitoring in development
 * 
 * Architecture:
 * - Single Responsibility: Layout structure only
 * - Composition: AI features handled by AIProvider
 * - Custom Hook: Logic extracted to useDashboardLayout
 * - Error Handling: Wrapped in error boundary
 * - Performance: Memoized expensive computations + monitoring
 * - Accessibility: Proper ARIA labels and roles
 * - Maintainability: Clean separation of concerns
 * - Observability: Performance and lifecycle monitoring
 */
export function DashboardLayout({ 
  children, 
  className = "",
  headerClassName = "",
  mainClassName = ""
}: DashboardLayoutProps) {
  // Performance monitoring (development only)
  usePerformanceMonitor('DashboardLayout')
  useLifecycleMonitor('DashboardLayout')

  // Extract all layout logic to custom hook
  const {
    layoutClasses,
    headerProps,
    sidebarProps
  } = useDashboardLayout(className, mainClassName)

  return (
    <DashboardErrorBoundary>
      <AIProvider>
        <div className={layoutClasses.container}>
          <DashboardHeader
            {...headerProps}
            className={headerClassName}
          />

          <SidebarNavigation
            {...sidebarProps}
          />

<<<<<<< Updated upstream
      {/* Main Content with top padding for fixed header */}
      <main 
        className={`pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mainClassName}`}
        role="main"
        aria-label="Dashboard content"
      >
        {children}
      </main>

      {/* AI Chat Widget - Available on all dashboard pages */}
      <ChatWidget />
    </div>
=======
          {/* Main Content Area */}
          <main 
            className={layoutClasses.main}
            role="main"
            aria-label="Dashboard content"
            id="main-content"
          >
            {children}
          </main>
        </div>
      </AIProvider>
    </DashboardErrorBoundary>
>>>>>>> Stashed changes
  )
}

// Export enhanced version with additional features
export { DashboardLayout as default }
'use client'

import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/hooks/use-navigation'
import { useSidebarMenu } from '@/hooks/use-sidebar-menu'
import { useLogout } from '@/hooks/use-logout'
import { DashboardHeader } from './components/dashboard-header'
import { SidebarNavigation } from './components/sidebar-navigation'
import { DashboardLayoutProps } from './types/dashboard-types'



/**
 * Main dashboard layout component with fixed header and sidebar navigation
 * 
 * Features:
 * - Fixed header with user info and logout
 * - Slide-out sidebar navigation
 * - Responsive design
 * - Keyboard navigation support
 * - Accessibility compliant
 */
export function DashboardLayout({ 
  children, 
  className = "",
  headerClassName = "",
  mainClassName = ""
}: DashboardLayoutProps) {
  const { user } = useAuth()
  const { handleLogout, isLoggingOut } = useLogout()
  const { 
    isMenuOpen, 
    menuRef, 
    toggleMenu, 
    closeMenu, 
    handleMenuKeyDown 
  } = useSidebarMenu()

  // Memoize user display values to prevent unnecessary re-renders
  const userDisplayInfo = useMemo(() => ({
    displayName: user?.full_name || user?.email || 'User',
    roleDisplay: user?.role?.replace('_', ' ') || 'Unknown'
  }), [user?.full_name, user?.email, user?.role])

  // Get navigation items using the custom hook
  const navigationItems = useNavigation(user?.role)

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <DashboardHeader
        displayName={userDisplayInfo.displayName}
        roleDisplay={userDisplayInfo.roleDisplay}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        className={headerClassName}
      />

      <SidebarNavigation
        isMenuOpen={isMenuOpen}
        navigationItems={navigationItems}
        menuRef={menuRef}
        onToggleMenu={toggleMenu}
        onCloseMenu={closeMenu}
        onMenuKeyDown={handleMenuKeyDown}
      />

      {/* Main Content with top padding for fixed header */}
      <main 
        className={`pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mainClassName}`}
        role="main"
        aria-label="Dashboard content"
      >
        {children}
      </main>
    </div>
  )
}
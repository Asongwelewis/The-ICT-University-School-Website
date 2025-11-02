'use client'

import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/hooks/use-navigation'
import { useSidebarMenu } from '@/hooks/use-sidebar-menu'
import { useLogout } from '@/hooks/use-logout'
import { UserDisplayInfo, LayoutClasses } from '@/components/dashboard/types/dashboard-types'

/**
 * Custom hook for dashboard layout logic
 * Encapsulates all layout-related state and computations
 * 
 * Benefits:
 * - Separation of concerns
 * - Reusable logic
 * - Easier testing
 * - Better performance with memoization
 */
export function useDashboardLayout(className?: string, mainClassName?: string) {
  // Core hooks
  const { user } = useAuth()
  const { handleLogout, isLoggingOut } = useLogout()
  const sidebarMenu = useSidebarMenu()
  const navigationItems = useNavigation(user?.role)

  // Memoized user display information
  const userDisplayInfo = useMemo<UserDisplayInfo>(() => ({
    displayName: user?.full_name || user?.email || 'User',
    roleDisplay: formatRoleDisplay(user?.role)
  }), [user?.full_name, user?.email, user?.role])

  // Memoized CSS classes
  const layoutClasses = useMemo<LayoutClasses>(() => ({
    container: `min-h-screen bg-white ${className || ''}`.trim(),
    main: `pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mainClassName || ''}`.trim()
  }), [className, mainClassName])

  // Header props object
  const headerProps = useMemo(() => ({
    displayName: userDisplayInfo.displayName,
    roleDisplay: userDisplayInfo.roleDisplay,
    isLoggingOut,
    onLogout: handleLogout
  }), [userDisplayInfo.displayName, userDisplayInfo.roleDisplay, isLoggingOut, handleLogout])

  // Sidebar props object
  const sidebarProps = useMemo(() => ({
    isMenuOpen: sidebarMenu.isMenuOpen,
    navigationItems,
    menuRef: sidebarMenu.menuRef,
    onToggleMenu: sidebarMenu.toggleMenu,
    onCloseMenu: sidebarMenu.closeMenu,
    onMenuKeyDown: sidebarMenu.handleMenuKeyDown
  }), [sidebarMenu, navigationItems])

  return {
    user,
    userDisplayInfo,
    layoutClasses,
    headerProps,
    sidebarProps,
    // Expose individual values for flexibility
    isLoggingOut,
    handleLogout,
    navigationItems,
    ...sidebarMenu
  }
}

/**
 * Utility function to format user role for display
 * Converts snake_case to Title Case and handles edge cases
 */
function formatRoleDisplay(role?: string): string {
  if (!role) return 'Unknown'
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Type guard to check if user has specific role
 */
export function hasRole(user: any, role: string): boolean {
  return user?.role === role
}

/**
 * Type guard to check if user is admin
 */
export function isAdmin(user: any): boolean {
  return hasRole(user, 'system_admin') || hasRole(user, 'hr_personnel')
}

/**
 * Type guard to check if user is staff
 */
export function isStaff(user: any): boolean {
  const staffRoles = ['academic_staff', 'hr_personnel', 'finance_staff', 'marketing_team', 'system_admin']
  return staffRoles.includes(user?.role)
}
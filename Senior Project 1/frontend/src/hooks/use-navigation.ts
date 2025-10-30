/**
 * Navigation hook for role-based menu items
 * Provides type-safe navigation items based on user role
 */

import { useMemo } from 'react'
import { Calendar, Bell, BookOpen, FileText, Users, BarChart3 } from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  description?: string
}

/**
 * Static navigation configuration
 * Centralized place to manage all navigation items
 */
const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: Bell,
    description: 'Important announcements and notices'
  },
  {
    name: 'My Courses',
    href: '/courses',
    icon: BookOpen,
    roles: ['student'],
    description: 'Your enrolled courses and materials'
  },
  {
    name: 'My Grades',
    href: '/grades',
    icon: FileText,
    roles: ['student'],
    description: 'Your academic performance and grades'
  },
  {
    name: 'Assignments',
    href: '/assignments',
    icon: FileText,
    roles: ['student'],
    description: 'Course assignments and submissions'
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: Calendar,
    roles: ['student'],
    description: 'Your class schedule and timetables'
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: BookOpen,
    roles: ['academic_staff', 'system_admin', 'hr_personnel', 'finance_staff'],
    description: 'Manage courses and curriculum'
  },
  {
    name: 'Students',
    href: '/students',
    icon: Users,
    roles: ['academic_staff', 'system_admin', 'hr_personnel'],
    description: 'Student management and records'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['academic_staff', 'system_admin', 'hr_personnel', 'finance_staff'],
    description: 'Analytics and reporting'
  },
]

/**
 * Hook to get navigation items based on user role
 * 
 * @param userRole - Current user's role
 * @returns Array of navigation items filtered by role
 */
export function useNavigation(userRole?: string): NavigationItem[] {
  return useMemo(() => {
    if (!userRole) return []
    
    return NAVIGATION_CONFIG.filter(item => 
      !item.roles || item.roles.includes(userRole)
    )
  }, [userRole])
}

/**
 * Get all available navigation items (for admin purposes)
 */
export function getAllNavigationItems(): NavigationItem[] {
  return NAVIGATION_CONFIG
}

/**
 * Get navigation items for a specific role
 */
export function getNavigationItemsForRole(role: string): NavigationItem[] {
  return NAVIGATION_CONFIG.filter(item => 
    !item.roles || item.roles.includes(role)
  )
}

/**
 * Check if a user has access to a specific navigation item
 */
export function hasAccessToItem(item: NavigationItem, userRole?: string): boolean {
  if (!userRole) return false
  return !item.roles || item.roles.includes(userRole)
}
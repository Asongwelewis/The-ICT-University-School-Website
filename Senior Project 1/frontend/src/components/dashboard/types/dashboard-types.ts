import { ReactNode } from 'react'

/**
 * Base props for dashboard layout components
 */
export interface BaseLayoutProps {
  className?: string
  children?: ReactNode
}

/**
 * Props for the main dashboard layout component
 */
export interface DashboardLayoutProps extends BaseLayoutProps {
  headerClassName?: string
  mainClassName?: string
}

/**
 * Props for dashboard header component
 */
export interface DashboardHeaderProps {
  displayName: string
  roleDisplay: string
  isLoggingOut: boolean
  onLogout: () => void
  className?: string
}

/**
 * Props for sidebar navigation component
 */
export interface SidebarNavigationProps {
  isMenuOpen: boolean
  navigationItems: NavigationItem[]
  menuRef: React.RefObject<HTMLDivElement>
  onToggleMenu: () => void
  onCloseMenu: () => void
  onMenuKeyDown: (event: React.KeyboardEvent) => void
}

/**
 * Navigation item structure
 */
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

/**
 * User display information
 */
export interface UserDisplayInfo {
  displayName: string
  roleDisplay: string
}

/**
 * Menu state and handlers
 */
export interface MenuState {
  isMenuOpen: boolean
  menuRef: React.RefObject<HTMLDivElement>
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  handleMenuKeyDown: (event: React.KeyboardEvent) => void
}

/**
 * Logout state and handlers
 */
export interface LogoutState {
  isLoggingOut: boolean
  handleLogout: () => Promise<void>
}
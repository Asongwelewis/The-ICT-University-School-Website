'use client'

import { SystemAdminDashboard } from './role-dashboards/SystemAdminDashboard'
import { AcademicStaffDashboard } from './role-dashboards/AcademicStaffDashboard'
import { StudentDashboard } from './role-dashboards/StudentDashboard'
import { HRDashboard } from './role-dashboards/HRDashboard'
import { FinanceDashboard } from './role-dashboards/FinanceDashboard'
import { MarketingDashboard } from './role-dashboards/MarketingDashboard'

export type UserRole = 
  | 'system_admin'
  | 'academic_staff'
  | 'student'
  | 'hr_personnel'
  | 'finance_staff'
  | 'marketing_team'

interface DashboardConfig {
  component: React.ComponentType
  title: string
  description: string
}

// Dashboard registry - easy to extend with new roles
const DASHBOARD_REGISTRY: Record<UserRole, DashboardConfig> = {
  system_admin: {
    component: SystemAdminDashboard,
    title: 'System Administration',
    description: 'Comprehensive system management and oversight'
  },
  academic_staff: {
    component: AcademicStaffDashboard,
    title: 'Academic Staff Portal',
    description: 'Manage your courses, students, and academic activities'
  },
  student: {
    component: StudentDashboard,
    title: 'Student Portal',
    description: 'Access your academic information and services'
  },
  hr_personnel: {
    component: HRDashboard,
    title: 'HR Management',
    description: 'Comprehensive human resource management and operations'
  },
  finance_staff: {
    component: FinanceDashboard,
    title: 'Finance Management',
    description: 'Financial operations, reporting, and budget management'
  },
  marketing_team: {
    component: MarketingDashboard,
    title: 'Marketing Team',
    description: 'Campaign management, lead tracking, and performance analytics'
  }
}

interface DashboardFactoryProps {
  userRole: UserRole
  fallbackRole?: UserRole
}

export function DashboardFactory({ userRole, fallbackRole = 'student' }: DashboardFactoryProps) {
  // Get dashboard config with fallback
  const dashboardConfig = DASHBOARD_REGISTRY[userRole] || DASHBOARD_REGISTRY[fallbackRole]
  
  if (!dashboardConfig) {
    console.warn(`No dashboard found for role: ${userRole}, using student dashboard`)
    return <StudentDashboard />
  }

  const DashboardComponent = dashboardConfig.component
  
  return <DashboardComponent />
}

// Utility functions for dashboard management
export const DashboardUtils = {
  /**
   * Get available roles for dashboard
   */
  getAvailableRoles(): UserRole[] {
    return Object.keys(DASHBOARD_REGISTRY) as UserRole[]
  },

  /**
   * Check if role has dashboard
   */
  hasRoleDashboard(role: string): role is UserRole {
    return role in DASHBOARD_REGISTRY
  },

  /**
   * Get dashboard metadata
   */
  getDashboardInfo(role: UserRole): DashboardConfig | null {
    return DASHBOARD_REGISTRY[role] || null
  },

  /**
   * Register new dashboard (for extensibility)
   */
  registerDashboard(role: UserRole, config: DashboardConfig): void {
    DASHBOARD_REGISTRY[role] = config
  }
}
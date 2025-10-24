// Icon mapping for dashboard components
// This file centralizes all icon imports and provides fallbacks for missing icons

import { 
  Users, 
  CheckCircle, 
  Clock, 
  Shield, 
  Settings, 
  BarChart3, 
  BookOpen, 
  Award, 
  Calendar, 
  DollarSign, 
  FileText, 
  Target,
  TrendingUp,
  LineChart,
  Activity,
  PieChart,
  BarChart,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckSquare,
  XCircle
} from 'lucide-react'

// Primary icon mapping
export const ICON_MAP = {
  // User & People
  Users,
  
  // Status & State
  CheckCircle,
  Clock,
  Shield,
  CheckSquare,
  XCircle,
  AlertTriangle,
  Info,
  
  // System & Settings
  Settings,
  
  // Charts & Analytics
  BarChart3,
  LineChart,
  PieChart,
  BarChart,
  Activity,
  
  // Academic & Learning
  BookOpen,
  Award,
  
  // Time & Calendar
  Calendar,
  
  // Finance
  DollarSign,
  
  // Documents
  FileText,
  
  // Marketing & Goals
  Target,
  
  // Trends
  TrendingUp,
  TrendingDown
} as const

export type IconName = keyof typeof ICON_MAP

// Icon fallback mapping - provides alternatives if primary icon doesn't exist
export const ICON_FALLBACKS: Record<string, IconName> = {
  'ChartLine': 'LineChart',
  'Chart': 'BarChart3',
  'Analytics': 'Activity',
  'Performance': 'TrendingUp',
  'Reports': 'FileText',
  'Dashboard': 'BarChart3',
  'Metrics': 'Activity',
  'Statistics': 'PieChart'
}

/**
 * Get icon component with fallback support
 * @param iconName - Name of the icon to retrieve
 * @returns Icon component or null if not found
 */
export function getIcon(iconName: string): React.ComponentType<any> | null {
  // Try direct mapping first
  if (iconName in ICON_MAP) {
    return ICON_MAP[iconName as IconName]
  }
  
  // Try fallback mapping
  const fallbackName = ICON_FALLBACKS[iconName]
  if (fallbackName && fallbackName in ICON_MAP) {
    console.warn(`Icon "${iconName}" not found, using fallback "${fallbackName}"`)
    return ICON_MAP[fallbackName]
  }
  
  // Default fallback
  console.warn(`Icon "${iconName}" not found, using default fallback`)
  return Activity // Generic activity icon as ultimate fallback
}

/**
 * Validate if icon exists in the mapping
 * @param iconName - Name of the icon to check
 * @returns boolean indicating if icon exists
 */
export function hasIcon(iconName: string): boolean {
  return iconName in ICON_MAP || iconName in ICON_FALLBACKS
}

/**
 * Get all available icon names
 * @returns Array of available icon names
 */
export function getAvailableIcons(): string[] {
  return [...Object.keys(ICON_MAP), ...Object.keys(ICON_FALLBACKS)]
}
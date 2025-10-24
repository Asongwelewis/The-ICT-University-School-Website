/**
 * Dashboard configuration constants
 * Centralizes configurable values for easy maintenance
 */

export const DASHBOARD_CONFIG = {
  // Grid configurations
  STATS_GRID: {
    DEFAULT_COLUMNS: 'md:grid-cols-2 lg:grid-cols-4',
    LARGE_DATASET_THRESHOLD: 20,
    GAP: 'gap-4'
  },
  
  ACTIONS_GRID: {
    DEFAULT_COLUMNS: 'md:grid-cols-2 lg:grid-cols-3',
    GAP: 'gap-4'
  },

  // Animation and transition settings
  ANIMATIONS: {
    CARD_HOVER: 'hover:shadow-md transition-shadow',
    PROGRESS_TRANSITION: 'transition-all',
    DURATION: {
      FAST: '150ms',
      NORMAL: '300ms',
      SLOW: '500ms'
    }
  },

  // Accessibility settings
  A11Y: {
    FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
    SCREEN_READER_ONLY: 'sr-only'
  },

  // Icon settings
  ICONS: {
    STAT_CARD_SIZE: 'h-4 w-4',
    ACTION_CARD_SIZE: 'h-5 w-5',
    TREND_SIZE: 'h-3 w-3'
  },

  // Typography
  TYPOGRAPHY: {
    STAT_VALUE: 'text-2xl font-bold',
    CARD_TITLE: 'text-sm font-medium',
    CARD_DESCRIPTION: 'text-xs text-muted-foreground'
  },

  // Layout spacing
  SPACING: {
    CARD_PADDING: 'p-6',
    HEADER_PADDING: 'py-4', // Reduced from py-6 for more compact header
    CONTENT_MARGIN: 'mt-1',
    PROGRESS_MARGIN: 'mb-4'
  }
} as const

/**
 * Theme-specific configurations
 */
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: 'orange',
    SECONDARY: 'blue',
    SUCCESS: 'green',
    DANGER: 'red'
  },
  
  GRADIENTS: {
    HEADER: 'bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20'
  }
} as const

/**
 * Performance optimization settings
 */
export const PERFORMANCE_CONFIG = {
  VIRTUALIZATION_THRESHOLD: 50,
  DEBOUNCE_DELAY: 300,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CONCURRENT_REQUESTS: 3
} as const
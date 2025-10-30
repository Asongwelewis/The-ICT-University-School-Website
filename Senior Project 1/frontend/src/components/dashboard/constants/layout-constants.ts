/**
 * Dashboard layout constants for consistent styling and behavior
 */

export const LAYOUT_CONSTANTS = {
  // Z-index layers for proper stacking
  Z_INDEX: {
    HEADER: 40,
    SIDEBAR: 40,
    MENU_BUTTON: 50,
    OVERLAY: 30,
  },
  
  // Spacing and sizing
  SPACING: {
    HEADER_HEIGHT: 'pt-24', // Top padding for main content
    SIDEBAR_WIDTH: 'w-80',
    MENU_BUTTON_SIZE: 'p-3',
  },
  
  // Animation durations
  ANIMATION: {
    SIDEBAR_TRANSITION: 'duration-300',
    BUTTON_TRANSITION: 'transition-colors',
  },
  
  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: 'sm:',
    TABLET: 'md:',
    DESKTOP: 'lg:',
  },
  
  // Color scheme
  COLORS: {
    PRIMARY_GRADIENT: 'from-orange-500 to-orange-600',
    BUTTON_HOVER: 'hover:bg-orange-600',
    OVERLAY: 'bg-black bg-opacity-50',
  },
  
  // Accessibility
  A11Y: {
    FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-orange-300',
    SCREEN_READER_ONLY: 'sr-only',
  }
} as const

export const LAYOUT_CLASSES = {
  // Header classes
  HEADER_BASE: `fixed top-0 left-0 right-0 bg-gradient-to-r ${LAYOUT_CONSTANTS.COLORS.PRIMARY_GRADIENT} text-white shadow-lg z-${LAYOUT_CONSTANTS.Z_INDEX.HEADER}`,
  
  // Sidebar classes
  SIDEBAR_BASE: `fixed top-0 right-0 h-screen ${LAYOUT_CONSTANTS.SPACING.SIDEBAR_WIDTH} bg-white shadow-2xl border-l border-gray-200 z-${LAYOUT_CONSTANTS.Z_INDEX.SIDEBAR} transform transition-transform ${LAYOUT_CONSTANTS.ANIMATION.SIDEBAR_TRANSITION} ease-in-out`,
  
  // Menu button classes
  MENU_BUTTON_BASE: `fixed top-4 right-4 bg-orange-500 ${LAYOUT_CONSTANTS.COLORS.BUTTON_HOVER} text-white ${LAYOUT_CONSTANTS.SPACING.MENU_BUTTON_SIZE} rounded-full shadow-lg ${LAYOUT_CONSTANTS.ANIMATION.BUTTON_TRANSITION} z-${LAYOUT_CONSTANTS.Z_INDEX.MENU_BUTTON} ${LAYOUT_CONSTANTS.A11Y.FOCUS_RING}`,
  
  // Overlay classes
  OVERLAY_BASE: `fixed inset-0 ${LAYOUT_CONSTANTS.COLORS.OVERLAY} z-${LAYOUT_CONSTANTS.Z_INDEX.OVERLAY}`,
  
  // Main content classes
  MAIN_BASE: `${LAYOUT_CONSTANTS.SPACING.HEADER_HEIGHT} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`,
} as const
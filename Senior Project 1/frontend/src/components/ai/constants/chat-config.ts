export const CHAT_CONFIG = {
  // Message limits
  MAX_CONTEXT_MESSAGES: 5,
  MAX_SUGGESTIONS: 3,
  
  // UI dimensions
  BUTTON_SIZE: 'h-14 w-14',
  
  // Animation delays
  LOADING_ANIMATION_DELAYS: ['0s', '0.1s', '0.2s'],
  
  // Size configurations
  SIZE_CONFIG: {
    small: { width: 'w-80', height: 'h-96' },
    medium: { width: 'w-96', height: 'h-[500px]' },
    large: { width: 'w-[500px]', height: 'h-[600px]' }
  },
  
  // Status colors
  STATUS_COLORS: {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    checking: 'bg-yellow-500'
  },
  
  // Welcome messages by context
  WELCOME_MESSAGES: {
    assignments: "Hi! I'm here to help you understand your assignments. What would you like to know?",
    courses: "Hello! I can help explain course content and answer questions about your classes.",
    grades: "Hi there! I can help you understand your grades and suggest ways to improve.",
    default: "Hello! I'm your AI study assistant. I can help with assignments, explain concepts, and answer questions about your courses."
  },
  
  // Error messages
  ERROR_MESSAGES: {
    connection: "Sorry, I'm having trouble connecting right now. Please make sure the AI service is running and try again.",
    offline: "AI service is offline. Please check your internet connection and Gemini API key.",
    generic: "Something went wrong. Please try again."
  }
} as const;

export type ChatSize = keyof typeof CHAT_CONFIG.SIZE_CONFIG;
export type AIStatus = keyof typeof CHAT_CONFIG.STATUS_COLORS;
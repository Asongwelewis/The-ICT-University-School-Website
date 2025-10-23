/**
 * Centralized error handling utilities for consistent error management.
 */

export interface APIError {
  code: string
  message: string
  details?: any
  statusCode?: number
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Parse and normalize errors from different sources
 */
export function parseError(error: unknown): APIError {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode
    }
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as any
    return {
      code: supabaseError.code || 'SUPABASE_ERROR',
      message: supabaseError.message || 'An error occurred',
      details: supabaseError,
      statusCode: supabaseError.status || 400
    }
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      statusCode: 0
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: 'GENERIC_ERROR',
      message: error.message,
      statusCode: 500
    }
  }

  // Handle unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error,
    statusCode: 500
  }
}

/**
 * Get user-friendly error messages
 */
export function getUserFriendlyMessage(error: APIError): string {
  const errorMessages: Record<string, string> = {
    // Authentication & Authorization
    'NETWORK_ERROR': 'Please check your internet connection and try again.',
    'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
    'USER_NOT_FOUND': 'No account found with this email address.',
    'EMAIL_ALREADY_EXISTS': 'An account with this email already exists.',
    'WEAK_PASSWORD': 'Password must be at least 6 characters with letters and numbers.',
    'INVALID_EMAIL': 'Please enter a valid email address.',
    'SESSION_EXPIRED': 'Your session has expired. Please sign in again.',
    'PERMISSION_DENIED': 'You do not have permission to perform this action.',
    
    // Academic System Specific
    'COURSE_NOT_FOUND': 'The requested course could not be found.',
    'COURSE_FULL': 'This course is at maximum capacity.',
    'ENROLLMENT_CLOSED': 'Enrollment for this course is closed.',
    'GRADE_ALREADY_EXISTS': 'A grade for this assessment already exists.',
    'INVALID_GRADE': 'Please enter a valid grade value.',
    'ATTENDANCE_ALREADY_RECORDED': 'Attendance for this date has already been recorded.',
    
    // Financial System Specific
    'PAYMENT_FAILED': 'Payment processing failed. Please try again.',
    'INSUFFICIENT_FUNDS': 'Insufficient funds for this transaction.',
    'INVOICE_NOT_FOUND': 'Invoice not found.',
    'PAYMENT_ALREADY_PROCESSED': 'This payment has already been processed.',
    
    // General System
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'SERVER_ERROR': 'Server error. Please try again later.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
    'MAINTENANCE_MODE': 'System is under maintenance. Please try again later.'
  }

  return errorMessages[error.code] || error.message || 'An unexpected error occurred'
}

/**
 * Log errors for debugging (in development) or monitoring (in production)
 */
export function logError(error: APIError, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode
    })
  }

  // In production, you might want to send to a monitoring service
  // Example: Sentry, LogRocket, etc.
}

/**
 * Retry mechanism for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      const parsedError = parseError(error)
      
      // Don't retry for certain error types
      if (parsedError.code === 'INVALID_CREDENTIALS' || 
          parsedError.code === 'PERMISSION_DENIED' ||
          parsedError.statusCode === 401 ||
          parsedError.statusCode === 403) {
        throw error
      }

      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}
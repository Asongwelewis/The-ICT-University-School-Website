/**
 * AI Service Configuration
 * Centralized configuration for AI-related services and features
 */

export const AI_CONFIG = {
  // Service Information
  SERVICE_NAME: 'Gemini 1.5 Flash',
  MODELS: ['gemini-1.5-flash'],
  
  // Request Configuration
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Status Check Configuration
  STATUS_CHECK_INTERVAL: 30000, // 30 seconds
  STATUS_CACHE_TTL: 60000, // 1 minute
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  BURST_LIMIT: 10,
  
  // Feature Flags
  ENABLE_CACHING: true,
  ENABLE_METRICS: process.env.NODE_ENV === 'production',
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
} as const;

export const ENV_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  AI_STATUS_ENDPOINT: '/api/v1/ai/status',
  AI_CHAT_ENDPOINT: '/api/v1/ai/chat',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Type-safe configuration access
export type AIConfigKey = keyof typeof AI_CONFIG;
export type EnvConfigKey = keyof typeof ENV_CONFIG;

// Configuration validator
export class ConfigValidator {
  static validateAIConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!AI_CONFIG.SERVICE_NAME) {
      errors.push('SERVICE_NAME is required');
    }
    
    if (!AI_CONFIG.MODELS.length) {
      errors.push('At least one model must be configured');
    }
    
    if (AI_CONFIG.DEFAULT_TIMEOUT <= 0) {
      errors.push('DEFAULT_TIMEOUT must be positive');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateEnvConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!ENV_CONFIG.BACKEND_URL) {
      errors.push('BACKEND_URL is required');
    }
    
    try {
      new URL(ENV_CONFIG.BACKEND_URL);
    } catch {
      errors.push('BACKEND_URL must be a valid URL');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
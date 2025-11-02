/**
 * Type definitions for AI Status API
 * Provides type safety for AI status-related operations
 */

export interface AIStatusRequest {
  authToken?: string;
}

export interface AIStatusResponse {
  status: 'online' | 'offline';
  service: string;
  models: string[];
  lastChecked: string;
  error?: string;
  metadata?: AIStatusMetadata;
}

export interface AIStatusMetadata {
  latency?: number;
  version?: string;
  region?: string;
  uptime?: number;
  requestCount?: number;
  errorRate?: number;
}

export interface BackendAIStatusResponse {
  status: string;
  models?: string[];
  metadata?: Record<string, any>;
  service?: string;
  error?: string;
}

// Error types for better error handling
export enum AIStatusErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN'
}

export interface AIStatusError {
  code: AIStatusErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  retryable: boolean;
}

// Health check types
export interface AIHealthCheck {
  isHealthy: boolean;
  status: AIStatusResponse;
  checks: {
    connectivity: boolean;
    authentication: boolean;
    models: boolean;
  };
  timestamp: string;
}

// Configuration types
export interface AIStatusConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

// Utility types
export type AIServiceStatus = AIStatusResponse['status'];
export type AIStatusHandler = (status: AIStatusResponse) => void;
export type AIErrorHandler = (error: AIStatusError) => void;
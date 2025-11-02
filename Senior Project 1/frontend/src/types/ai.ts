/**
 * Type definitions for AI chat functionality
 * Provides better type safety and IntelliSense support
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
  };
}

export interface ChatContext {
  current_page?: string;
  course_id?: string;
  assignment_id?: string;
  user_id?: string;
  session_id?: string;
  [key: string]: any;
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
  metadata?: {
    model: string;
    tokens: number;
    processingTime: number;
  };
  error?: string;
}

export interface ChatRequest {
  message: string;
  context?: ChatContext;
  conversation_history?: Omit<ChatMessage, 'id' | 'status'>[];
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export type AIServiceStatus = 'online' | 'offline' | 'checking' | 'error';

export interface AIStatusInfo {
  status: AIServiceStatus;
  service: string;
  models: string[];
  lastChecked?: string;
  error?: string;
  metadata?: {
    version?: string;
    region?: string;
    latency?: number;
  };
}

export interface AIError extends Error {
  code?: string;
  status?: number;
  retryable?: boolean;
  context?: Record<string, any>;
}

// Error types for better error handling
export enum AIErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export class AIServiceError extends Error implements AIError {
  public readonly code: AIErrorCode;
  public readonly status?: number;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: AIErrorCode = AIErrorCode.UNKNOWN,
    status?: number,
    retryable = false,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.context = context;
  }

  static fromResponse(response: Response, context?: Record<string, any>): AIServiceError {
    let code = AIErrorCode.UNKNOWN;
    let retryable = false;

    switch (response.status) {
      case 401:
        code = AIErrorCode.API_KEY_INVALID;
        break;
      case 429:
        code = AIErrorCode.RATE_LIMIT_EXCEEDED;
        retryable = true;
        break;
      case 503:
        code = AIErrorCode.SERVICE_UNAVAILABLE;
        retryable = true;
        break;
      case 408:
        code = AIErrorCode.TIMEOUT;
        retryable = true;
        break;
      default:
        if (response.status >= 500) {
          retryable = true;
        }
    }

    return new AIServiceError(
      `HTTP ${response.status}: ${response.statusText}`,
      code,
      response.status,
      retryable,
      context
    );
  }

  static fromNetworkError(error: Error, context?: Record<string, any>): AIServiceError {
    return new AIServiceError(
      `Network error: ${error.message}`,
      AIErrorCode.NETWORK_ERROR,
      undefined,
      true,
      context
    );
  }
}

// Utility types for better API integration
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    processingTime?: number;
  };
}

export interface ChatWidgetConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  maxMessages?: number;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  enableRetry?: boolean;
  statusCheckInterval?: number;
  placeholder?: string;
  welcomeMessage?: string;
}
import { NextRequest, NextResponse } from 'next/server';
import { AIStatusResponse, BackendAIStatusResponse } from '@/types/ai-status';

// Configuration constants
const AI_CONFIG = {
  SERVICE_NAME: 'Gemini 1.5 Flash',
  MODELS: ['gemini-1.5-flash'],
  DEFAULT_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

const ENV_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  AI_STATUS_ENDPOINT: '/api/v1/ai/status',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Response factory for consistent response structure
class AIStatusResponseFactory {
  static createResponse(
    status: 'online' | 'offline',
    error?: string,
    backendData?: BackendAIStatusResponse
  ): AIStatusResponse {
    return {
      status,
      service: AI_CONFIG.SERVICE_NAME,
      models: status === 'online' ? AI_CONFIG.MODELS : [],
      lastChecked: new Date().toISOString(),
      ...(error && { error }),
      ...(backendData?.metadata && { metadata: backendData.metadata }),
    };
  }
}

// HTTP client with timeout and error handling
class AIHttpClient {
  private timeout: number;

  constructor(timeout = AI_CONFIG.DEFAULT_TIMEOUT) {
    this.timeout = timeout;
  }

  async get(url: string, headers: Record<string, string> = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Error handling strategies
interface ErrorStrategy {
  handle(error: unknown): NextResponse;
}

class NetworkErrorStrategy implements ErrorStrategy {
  handle(error: unknown): NextResponse {
    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.error('AI Status Network Error:', error);
    }
    
    return NextResponse.json(
      AIStatusResponseFactory.createResponse('offline', 'Connection failed'),
      { status: 503 }
    );
  }
}

class BackendErrorStrategy implements ErrorStrategy {
  handle(response: Response): NextResponse {
    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.warn(`Backend AI service returned ${response.status}: ${response.statusText}`);
    }
    
    return NextResponse.json(
      AIStatusResponseFactory.createResponse('offline', 'Backend AI service unavailable'),
      { status: 502 }
    );
  }
}

class ErrorHandler {
  private networkStrategy = new NetworkErrorStrategy();
  private backendStrategy = new BackendErrorStrategy();

  handleNetworkError(error: unknown): NextResponse {
    return this.networkStrategy.handle(error);
  }

  handleBackendError(response: Response): NextResponse {
    return this.backendStrategy.handle(response);
  }
}

// Main service class
class AIStatusService {
  private httpClient: AIHttpClient;
  private errorHandler: ErrorHandler;

  constructor() {
    this.httpClient = new AIHttpClient();
    this.errorHandler = new ErrorHandler();
  }

  private extractAuthToken(request: NextRequest): string | undefined {
    return request.headers.get('authorization') || undefined;
  }

  private buildHeaders(authToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = authToken;
    }

    return headers;
  }

  private buildBackendUrl(): string {
    return `${ENV_CONFIG.BACKEND_URL}${ENV_CONFIG.AI_STATUS_ENDPOINT}`;
  }

  async checkStatus(request: NextRequest): Promise<NextResponse> {
    try {
      const authToken = this.extractAuthToken(request);
      const headers = this.buildHeaders(authToken);
      const url = this.buildBackendUrl();

      const response = await this.httpClient.get(url, headers);

      if (!response.ok) {
        return this.errorHandler.handleBackendError(response);
      }

      const backendData: BackendAIStatusResponse = await response.json();
      
      return NextResponse.json(
        AIStatusResponseFactory.createResponse('online', undefined, backendData),
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    } catch (error) {
      return this.errorHandler.handleNetworkError(error);
    }
  }
}

// Route handler
const aiStatusService = new AIStatusService();

export async function GET(request: NextRequest): Promise<NextResponse> {
  return aiStatusService.checkStatus(request);
}

// Health check endpoint for monitoring
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const response = await aiStatusService.checkStatus(request);
    return new NextResponse(null, { 
      status: response.status,
      headers: response.headers 
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
import { ChatMessage, ChatContext } from '../types/chat-types';

/**
 * Test utilities for AI Chat Widget
 */

export const createMockMessage = (
  role: 'user' | 'assistant' = 'user',
  content: string = 'Test message',
  timestamp?: string
): ChatMessage => ({
  role,
  content,
  timestamp: timestamp || new Date().toISOString(),
  id: Math.random().toString(36).substr(2, 9)
});

export const createMockContext = (overrides: Partial<ChatContext> = {}): ChatContext => ({
  current_page: 'assignments',
  course_id: 'course-123',
  assignment_id: 'assignment-456',
  user_id: 'user-789',
  ...overrides
});

export const createMockMessages = (count: number = 3): ChatMessage[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockMessage(
      index % 2 === 0 ? 'user' : 'assistant',
      `Test message ${index + 1}`
    )
  );
};

export const mockAPIResponse = {
  success: {
    response: 'This is a mock AI response',
    suggestions: ['Follow up question 1', 'Follow up question 2'],
    metadata: {
      model: 'gemini-pro',
      tokens_used: 150,
      response_time: 1200
    }
  },
  error: {
    message: 'API Error',
    code: 'RATE_LIMIT_EXCEEDED',
    details: { retry_after: 60 }
  }
};

export const mockFetch = (response: any, ok: boolean = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
    })
  ) as jest.Mock;
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    },
    writable: true,
  });
};

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const triggerKeyboardEvent = (element: HTMLElement, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keypress', { key, ...options });
  element.dispatchEvent(event);
};
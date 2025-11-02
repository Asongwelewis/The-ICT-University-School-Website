import { ChatMessage } from '../types/chat-types';

/**
 * Utility functions for chat operations
 */

export const createMessage = (
  role: 'user' | 'assistant',
  content: string
): ChatMessage => ({
  role,
  content,
  timestamp: new Date().toISOString()
});

export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const truncateMessages = (
  messages: ChatMessage[], 
  maxLength: number
): ChatMessage[] => {
  return messages.slice(-maxLength);
};

/**
 * Debounce function for API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
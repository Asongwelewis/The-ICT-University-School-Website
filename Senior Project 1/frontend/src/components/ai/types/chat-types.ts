/**
 * Type definitions for AI Chat Widget
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  id?: string;
  metadata?: {
    error?: boolean;
    retryable?: boolean;
    [key: string]: any;
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

export interface AIChatWidgetProps {
  context?: ChatContext;
  className?: string;
  initialMessages?: ChatMessage[];
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export type ChatSize = 'small' | 'medium' | 'large';
export type AIStatus = 'online' | 'offline' | 'checking';

export interface ChatUIState {
  isOpen: boolean;
  isMinimized: boolean;
  chatSize: ChatSize;
}

export interface APIResponse {
  response: string;
  suggestions?: string[];
  metadata?: {
    model?: string;
    tokens_used?: number;
    response_time?: number;
  };
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  aiStatus: AIStatus;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface ChatHeaderProps {
  aiStatus: AIStatus;
  chatSize: ChatSize;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onSizeChange: () => void;
  title?: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  className?: string;
}

export interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  maxSuggestions?: number;
  className?: string;
}
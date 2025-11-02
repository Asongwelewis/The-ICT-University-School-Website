import { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  suggestions: string[];
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export function useAIChat(context?: Record<string, any>): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  const createUserMessage = useCallback((content: string): ChatMessage => ({
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  }), []);

  const createAssistantMessage = useCallback((content: string): ChatMessage => ({
    role: 'assistant',
    content,
    timestamp: new Date().toISOString()
  }), []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = createUserMessage(message);
    addMessage(userMessage);
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          context,
          conversation_history: messages.slice(-5)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage = createAssistantMessage(data.response);
      addMessage(assistantMessage);
      setSuggestions(data.suggestions || []);

    } catch (error) {
      const errorMessage = createAssistantMessage(
        'Sorry, I\'m having trouble connecting right now. Please make sure the AI service is running and try again.'
      );
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, context, messages, addMessage, createUserMessage, createAssistantMessage]);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    addMessage,
    clearMessages
  };
}
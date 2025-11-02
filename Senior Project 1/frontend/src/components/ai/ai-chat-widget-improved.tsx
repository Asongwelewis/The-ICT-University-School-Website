'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Bot, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIChat, type ChatContext } from '@/hooks/use-ai-chat';
import { useAIStatus } from '@/hooks/use-ai-status';
import { ChatMessage } from './components/chat-message';
import { ChatInput } from './components/chat-input';
import { ChatStatusIndicator } from './components/chat-status-indicator';

interface AIChatWidgetProps {
  context?: ChatContext;
  className?: string;
  defaultOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Improved AI Chat Widget with better architecture and performance
 * 
 * Features:
 * - Separated concerns with custom hooks
 * - Memoized components to prevent unnecessary re-renders
 * - Better error handling and retry mechanisms
 * - Improved accessibility
 * - Modern event handling (no deprecated APIs)
 * - Configurable positioning and behavior
 */
export function AIChatWidget({ 
  context, 
  className = '',
  defaultOpen = false,
  position = 'bottom-right'
}: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks for chat functionality
  const { 
    messages, 
    isLoading, 
    suggestions, 
    sendMessage, 
    clearMessages,
    retryLastMessage 
  } = useAIChat({ context, maxHistoryLength: 20 });
  
  const { 
    status: aiStatus, 
    service, 
    isOnline, 
    forceCheck,
    lastChecked,
    error: statusError
  } = useAIStatus({ checkInterval: 30000 });

  // Memoized position classes
  const positionClasses = useMemo(() => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    return positions[position];
  }, [position]);

  // Memoized welcome message based on context
  const welcomeMessage = useMemo(() => {
    const page = context?.current_page || '';
    if (page.includes('assignments')) {
      return "Hi! I'm here to help you understand your assignments. What would you like to know?";
    } else if (page.includes('courses')) {
      return "Hello! I can help explain course content and answer questions about your classes.";
    } else if (page.includes('grades')) {
      return "Hi there! I can help you understand your grades and suggest ways to improve.";
    }
    return "Hello! I'm your AI study assistant. I can help with assignments, explain concepts, and answer questions about your courses.";
  }, [context?.current_page]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle message sending
  const handleSendMessage = useCallback(async (message: string) => {
    await sendMessage(message);
    setInputMessage('');
  }, [sendMessage]);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  // Handle widget toggle
  const handleToggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Handle minimize toggle
  const handleToggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // Handle retry for failed messages
  const handleRetryMessage = useCallback(() => {
    retryLastMessage();
  }, [retryLastMessage]);

  // Chat widget button (when closed)
  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses} z-50 ${className}`}>
        <Button
          onClick={handleToggleOpen}
          className="h-14 w-14 rounded-full bg-orange-primary hover:bg-orange-600 shadow-lg transition-all duration-200 hover:scale-105"
          size="icon"
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <ChatStatusIndicator
          status={aiStatus}
          service={service}
          compact
        />
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50 ${className}`}>
      <Card className={`w-96 bg-white shadow-xl border-orange-200 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-orange-50">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-primary" />
            <span className="font-medium text-orange-800">AI Study Assistant</span>
            <ChatStatusIndicator
              status={aiStatus}
              service={service}
              compact
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMinimize}
              className="h-8 w-8 text-orange-600 hover:bg-orange-100"
              aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleOpen}
              className="h-8 w-8 text-orange-600 hover:bg-orange-100"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4 h-80"
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-orange-300" />
                  <p className="text-sm">{welcomeMessage}</p>
                </div>
              )}
              
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={message.status === 'error' ? handleRetryMessage : undefined}
                  showRetry={message.status === 'error'}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1" aria-label="AI is typing">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-gray-600">Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={`${suggestion}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-7 border-orange-200 text-orange-700 hover:bg-orange-50"
                      disabled={isLoading || !isOnline}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Section */}
            <div className="p-4 border-t border-gray-100">
              <ChatInput
                value={inputMessage}
                onChange={setInputMessage}
                onSend={handleSendMessage}
                disabled={isLoading || !isOnline}
                placeholder={!isOnline ? `${service} is offline...` : 'Ask me anything...'}
                autoFocus={isOpen && !isMinimized}
                maxLength={1000}
              />
              
              {!isOnline && (
                <div className="mt-2">
                  <ChatStatusIndicator
                    status={aiStatus}
                    service={service}
                    lastChecked={lastChecked}
                    error={statusError}
                    onRetry={forceCheck}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
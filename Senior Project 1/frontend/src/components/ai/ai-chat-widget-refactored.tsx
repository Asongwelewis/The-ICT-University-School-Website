'use client';

import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Hooks
import { useAIChat } from '@/hooks/use-ai-chat-widget';
import { useChatUI } from '@/hooks/use-chat-ui';
import { useAIStatus } from '@/hooks/use-ai-status';

// Components
import { ChatHeader } from './components/chat-header';
import { ChatMessage } from './components/chat-message';
import { ChatInput } from './components/chat-input';
import { ChatSuggestions } from './components/chat-suggestions';

// Constants and types
import { CHAT_CONFIG, type ChatSize, type AIStatus } from './constants/chat-config';

interface AIChatWidgetProps {
  context?: {
    current_page?: string;
    course_id?: string;
    assignment_id?: string;
    [key: string]: any;
  };
}

export function AIChatWidget({ context }: AIChatWidgetProps) {
  // Custom hooks for separation of concerns
  const { messages, isLoading, suggestions, sendMessage } = useAIChat(context);
  const { isOpen, isMinimized, chatSize, toggleOpen, toggleMinimized, cycleChatSize, closeChat } = useChatUI();
  const { aiStatus, checkAIStatus } = useAIStatus();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    checkAIStatus();
  }, [checkAIStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = (): string => {
    const page = context?.current_page || '';
    
    if (page.includes('assignments')) return CHAT_CONFIG.WELCOME_MESSAGES.assignments;
    if (page.includes('courses')) return CHAT_CONFIG.WELCOME_MESSAGES.courses;
    if (page.includes('grades')) return CHAT_CONFIG.WELCOME_MESSAGES.grades;
    
    return CHAT_CONFIG.WELCOME_MESSAGES.default;
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Render chat button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleOpen}
          className={`${CHAT_CONFIG.BUTTON_SIZE} rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg transition-all duration-200 hover:scale-105`}
          size="icon"
          aria-label="Open AI Chat Assistant"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        
        {aiStatus === 'offline' && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -left-2 text-xs"
            aria-label="AI Assistant is offline"
          >
            Offline
          </Badge>
        )}
      </div>
    );
  }

  // Render chat widget when open
  const sizeConfig = CHAT_CONFIG.SIZE_CONFIG[chatSize];
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card 
        className={`${sizeConfig.width} bg-white shadow-xl border-orange-200 transition-all duration-300 ${
          isMinimized ? 'h-16' : sizeConfig.height
        }`}
        role="dialog"
        aria-label="AI Chat Assistant"
      >
        <ChatHeader
          aiStatus={aiStatus}
          chatSize={chatSize}
          isMinimized={isMinimized}
          onMinimize={toggleMinimized}
          onClose={closeChat}
          onSizeChange={cycleChatSize}
        />

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4" 
              style={{ height: 'calc(100% - 140px)' }}
              role="log"
              aria-label="Chat messages"
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <div className="h-12 w-12 mx-auto mb-4 text-orange-300 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <p className="text-sm">{getWelcomeMessage()}</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <ChatMessage
                  key={`${message.timestamp}-${index}`}
                  message={message}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      {CHAT_CONFIG.LOADING_ANIMATION_DELAYS.map((delay, index) => (
                        <div
                          key={index}
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: delay }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <ChatSuggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              maxSuggestions={CHAT_CONFIG.MAX_SUGGESTIONS}
            />

            <ChatInput
              ref={inputRef}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              aiStatus={aiStatus}
            />
          </>
        )}
      </Card>
    </div>
  );
}
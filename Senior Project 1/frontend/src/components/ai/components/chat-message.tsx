'use client';

import React, { memo } from 'react';
import { Bot, User, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage as ChatMessageType } from '@/hooks/use-ai-chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  showRetry?: boolean;
}

// Memoized time formatter to prevent recalculation
const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Memoized message component to prevent unnecessary re-renders
export const ChatMessage = memo<ChatMessageProps>(({ 
  message, 
  onRetry, 
  showRetry = false 
}) => {
  const isUser = message.role === 'user';
  const hasError = message.status === 'error';
  const isSending = message.status === 'sending';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      {!isUser && (
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${hasError ? 'bg-red-100' : 'bg-orange-100'}
        `}>
          {hasError ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <Bot className="h-4 w-4 text-orange-600" />
          )}
        </div>
      )}
      
      <div className="max-w-[80%] space-y-1">
        <div
          className={`
            rounded-lg p-3 transition-colors
            ${isUser
              ? 'bg-blue-500 text-white'
              : hasError
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }
            ${isSending ? 'opacity-70' : ''}
          `}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <time 
              className={`text-xs ${
                isUser 
                  ? 'text-blue-100' 
                  : hasError 
                    ? 'text-red-500' 
                    : 'text-gray-500'
              }`}
              dateTime={message.timestamp}
            >
              {formatTime(message.timestamp)}
            </time>
            
            {hasError && showRetry && onRetry && (
              <Button
                onClick={onRetry}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-red-600 hover:bg-red-100"
                aria-label="Retry sending message"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-blue-600" />
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
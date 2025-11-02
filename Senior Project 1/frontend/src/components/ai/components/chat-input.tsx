'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Ask me anything...',
  maxLength = 1000,
  autoFocus = false
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard events with modern approach
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend(value.trim());
      }
    }
  }, [value, disabled, onSend]);

  const handleSendClick = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  }, [value, disabled, onSend]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  }, [onChange, maxLength]);

  // Auto-focus when enabled
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const isValid = value.trim().length > 0 && !disabled;
  const remainingChars = maxLength - value.length;
  const showCharCount = remainingChars < 100;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
              ${disabled ? 'border-gray-200' : 'border-gray-300 hover:border-gray-400'}
            `}
            aria-label="Chat message input"
            aria-describedby={showCharCount ? 'char-count' : undefined}
          />
          {showCharCount && (
            <div 
              id="char-count"
              className={`absolute -bottom-5 right-0 text-xs ${
                remainingChars < 20 ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {remainingChars} characters remaining
            </div>
          )}
        </div>
        <Button
          onClick={handleSendClick}
          disabled={!isValid}
          className="bg-orange-primary hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          size="icon"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
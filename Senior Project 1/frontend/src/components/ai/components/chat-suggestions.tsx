'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  maxSuggestions?: number;
}

export function ChatSuggestions({ 
  suggestions, 
  onSuggestionClick, 
  maxSuggestions = 3 
}: ChatSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-orange-500" />
        <span className="text-xs text-gray-600">Suggestions:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs h-7 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
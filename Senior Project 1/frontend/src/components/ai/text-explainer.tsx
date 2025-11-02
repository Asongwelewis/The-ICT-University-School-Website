'use client';

import React, { useState } from 'react';
import { HelpCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TextExplainerProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function TextExplainer({ selectedText, position, onClose }: TextExplainerProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasExplanation, setHasExplanation] = useState(false);

  const getExplanation = async () => {
    if (!selectedText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/explain-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          context: {
            task: 'text_explanation',
            source: 'text_selection'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data = await response.json();
      setExplanation(data.explanation);
      setHasExplanation(true);
    } catch (error) {
      setExplanation('Sorry, I couldn\'t explain this text right now. Please try again later.');
      setHasExplanation(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      className="fixed z-50 w-80 bg-white shadow-xl border-orange-200"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 200),
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">AI Explanation</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Selected text:</p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded">
            <p className="text-sm text-gray-700 italic">"{selectedText}"</p>
          </div>
        </div>

        {!hasExplanation && !isLoading && (
          <Button
            onClick={getExplanation}
            className="w-full bg-orange-primary hover:bg-orange-600 text-sm"
            size="sm"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Explain This
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="ml-2 text-sm text-gray-600">Getting explanation...</span>
          </div>
        )}

        {hasExplanation && explanation && (
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
            </div>
            <Button
              onClick={() => {
                setHasExplanation(false);
                setExplanation('');
              }}
              variant="outline"
              size="sm"
              className="w-full text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Ask Another Question
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
'use client';

import React from 'react';
import { Bot, Minimize2, Maximize2, X, Expand, Shrink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChatSize = 'small' | 'medium' | 'large';
type AIStatus = 'online' | 'offline' | 'checking';

interface ChatHeaderProps {
  aiStatus: AIStatus;
  chatSize: ChatSize;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onSizeChange: () => void;
}

export function ChatHeader({
  aiStatus,
  chatSize,
  isMinimized,
  onMinimize,
  onClose,
  onSizeChange
}: ChatHeaderProps) {
  const getSizeIcon = () => {
    return chatSize === 'small' ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    switch (aiStatus) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-orange-50">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-orange-600" />
        <span className="font-medium text-orange-800">AI Study Assistant</span>
        <div 
          className={`w-2 h-2 rounded-full ${getStatusColor()}`}
          title={`Status: ${aiStatus}`}
        />
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSizeChange}
          className="h-8 w-8 text-orange-600 hover:bg-orange-100"
          title={`Current size: ${chatSize}. Click to change.`}
        >
          {getSizeIcon()}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-orange-600 hover:bg-orange-100"
          title={isMinimized ? 'Maximize' : 'Minimize'}
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-orange-600 hover:bg-orange-100"
          title="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
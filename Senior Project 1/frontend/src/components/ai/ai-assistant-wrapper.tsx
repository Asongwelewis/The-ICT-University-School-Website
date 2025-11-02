'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Dynamically import AI components to avoid SSR issues
const AIChatWidget = dynamic(() => import('./ai-chat-widget').then(mod => ({ default: mod.AIChatWidget })), {
  ssr: false,
  loading: () => null
});

const TextExplainer = dynamic(() => import('./text-explainer').then(mod => ({ default: mod.TextExplainer })), {
  ssr: false,
  loading: () => null
});

interface AIAssistantWrapperProps {
  isAuthenticated: boolean;
}

export function AIAssistantWrapper({ isAuthenticated }: AIAssistantWrapperProps) {
  const pathname = usePathname();
  const [selectedText, setSelectedText] = useState<string>('');
  const [textSelectionPosition, setTextSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Only mount on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate context based on current page
  const getAIContext = () => {
    const context = {
      current_page: pathname,
      page_type: 'general' as string
    };

    if (pathname.includes('/courses')) {
      context.page_type = 'courses';
    } else if (pathname.includes('/assignments')) {
      context.page_type = 'assignments';
    } else if (pathname.includes('/grades')) {
      context.page_type = 'grades';
    } else if (pathname.includes('/schedule')) {
      context.page_type = 'schedule';
    } else if (pathname.includes('/dashboard')) {
      context.page_type = 'dashboard';
    }

    return context;
  };

  // Handle text selection for explanation
  useEffect(() => {
    if (!isMounted || !isAuthenticated) return;

    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selectedText = selection.toString().trim();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selectedText);
        setTextSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10
        });
      } else {
        setSelectedText('');
        setTextSelectionPosition(null);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, [isMounted, isAuthenticated]);

  // Clear text selection when page changes
  useEffect(() => {
    setSelectedText('');
    setTextSelectionPosition(null);
  }, [pathname]);

  const clearTextSelection = () => {
    setSelectedText('');
    setTextSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  // Don't render anything if not mounted or not authenticated
  if (!isMounted || !isAuthenticated) {
    return null;
  }

  const context = getAIContext();

  return (
    <>
      {/* AI Chat Widget */}
      <AIChatWidget context={context} />
      
      {/* Text Explainer */}
      {selectedText && textSelectionPosition && (
        <TextExplainer
          selectedText={selectedText}
          position={textSelectionPosition}
          onClose={clearTextSelection}
        />
      )}
    </>
  );
}
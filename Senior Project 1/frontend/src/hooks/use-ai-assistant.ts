'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface AIContext {
  current_page: string;
  page_type: string;
  course_id?: string;
  assignment_id?: string;
  user_context?: any;
}

interface AIStatus {
  status: 'online' | 'offline' | 'checking';
  service: string;
  models: string[];
}

export function useAIAssistant() {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    status: 'checking',
    service: 'Gemini 1.5 Flash',
    models: ['gemini-1.5-flash']
  });
  const [selectedText, setSelectedText] = useState<string>('');
  const [textSelectionPosition, setTextSelectionPosition] = useState<{ x: number; y: number } | null>(null);

  // Generate context based on current page
  const getAIContext = useCallback((): AIContext => {
    const context: AIContext = {
      current_page: pathname,
      page_type: 'general'
    };

    if (pathname.includes('/courses')) {
      context.page_type = 'courses';
      // Extract course ID from URL if present
      const courseMatch = pathname.match(/\/courses\/([^\/]+)/);
      if (courseMatch) {
        context.course_id = courseMatch[1];
      }
    } else if (pathname.includes('/assignments')) {
      context.page_type = 'assignments';
      // Extract assignment ID from URL if present
      const assignmentMatch = pathname.match(/\/assignments\/([^\/]+)/);
      if (assignmentMatch) {
        context.assignment_id = assignmentMatch[1];
      }
    } else if (pathname.includes('/grades')) {
      context.page_type = 'grades';
    } else if (pathname.includes('/schedule')) {
      context.page_type = 'schedule';
    } else if (pathname.includes('/dashboard')) {
      context.page_type = 'dashboard';
    }

    return context;
  }, [pathname]);

  // Check AI service status
  const checkAIStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data);
      } else {
        setAiStatus(prev => ({ ...prev, status: 'offline' }));
      }
    } catch (error) {
      setAiStatus(prev => ({ ...prev, status: 'offline' }));
    }
  }, []);

  // Handle text selection for explanation
  const handleTextSelection = useCallback(() => {
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
  }, []);

  // Set up text selection listener
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, [handleTextSelection]);

  // Check AI status on mount and periodically
  useEffect(() => {
    checkAIStatus();
    const interval = setInterval(checkAIStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkAIStatus]);

  // Clear text selection when page changes
  useEffect(() => {
    setSelectedText('');
    setTextSelectionPosition(null);
  }, [pathname]);

  const clearTextSelection = useCallback(() => {
    setSelectedText('');
    setTextSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return {
    aiStatus,
    context: getAIContext(),
    selectedText,
    textSelectionPosition,
    clearTextSelection,
    checkAIStatus
  };
}
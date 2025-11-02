'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type AIServiceStatus = 'online' | 'offline' | 'checking' | 'error';

export interface AIStatusInfo {
  status: AIServiceStatus;
  service: string;
  models: string[];
  lastChecked?: string;
  error?: string;
}

interface UseAIStatusOptions {
  checkInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useAIStatus({ 
  checkInterval = 30000, 
  retryAttempts = 3,
  retryDelay = 1000 
}: UseAIStatusOptions = {}) {
  const [statusInfo, setStatusInfo] = useState<AIStatusInfo>({
    status: 'checking',
    service: 'Gemini Pro',
    models: ['gemini-pro']
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkStatus = useCallback(async (attempt = 1): Promise<void> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setStatusInfo(prev => ({ ...prev, status: 'checking' }));

      const response = await fetch('/api/ai/status', {
        method: 'GET',
        signal: abortControllerRef.current.signal,
        // Add cache busting to ensure fresh status
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response.ok) {
        const data = await response.json();
        setStatusInfo({
          ...data,
          lastChecked: new Date().toISOString(),
          error: undefined
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt < retryAttempts) {
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        retryTimeoutRef.current = setTimeout(() => {
          checkStatus(attempt + 1);
        }, delay);
      } else {
        setStatusInfo(prev => ({
          ...prev,
          status: 'offline',
          error: errorMessage,
          lastChecked: new Date().toISOString()
        }));
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [retryAttempts, retryDelay]);

  const startPeriodicCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(checkStatus, checkInterval);
  }, [checkStatus, checkInterval]);

  const stopPeriodicCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const forceCheck = useCallback(() => {
    stopPeriodicCheck();
    checkStatus();
    startPeriodicCheck();
  }, [checkStatus, startPeriodicCheck, stopPeriodicCheck]);

  // Start checking on mount
  useEffect(() => {
    checkStatus();
    startPeriodicCheck();

    return stopPeriodicCheck;
  }, [checkStatus, startPeriodicCheck, stopPeriodicCheck]);

  // Handle visibility change to pause/resume checking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPeriodicCheck();
      } else {
        forceCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [forceCheck, stopPeriodicCheck]);

  return {
    ...statusInfo,
    isOnline: statusInfo.status === 'online',
    isOffline: statusInfo.status === 'offline',
    isChecking: statusInfo.status === 'checking',
    hasError: statusInfo.status === 'error',
    forceCheck,
    stopPeriodicCheck
  };
}
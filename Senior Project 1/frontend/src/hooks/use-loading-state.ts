/**
 * Loading state management hook
 * Provides optimized loading state handling with debouncing
 */
import { useState, useCallback, useRef, useEffect } from 'react'

interface LoadingStateOptions {
  minLoadingTime?: number // Minimum time to show loading (prevents flashing)
  debounceTime?: number   // Debounce rapid state changes
}

export function useLoadingState(options: LoadingStateOptions = {}) {
  const { minLoadingTime = 300, debounceTime = 100 } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string>('')
  
  const loadingStartTime = useRef<number | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const minTimeTimer = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback((message = '') => {
    // Clear any existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setIsLoading(true)
      setLoadingMessage(message)
      loadingStartTime.current = Date.now()
    }, debounceTime)
  }, [debounceTime])

  const stopLoading = useCallback(() => {
    // Clear debounce timer if loading hasn't started yet
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
      return
    }

    const now = Date.now()
    const elapsedTime = loadingStartTime.current ? now - loadingStartTime.current : 0
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

    if (remainingTime > 0) {
      // Ensure minimum loading time
      minTimeTimer.current = setTimeout(() => {
        setIsLoading(false)
        setLoadingMessage('')
        loadingStartTime.current = null
      }, remainingTime)
    } else {
      setIsLoading(false)
      setLoadingMessage('')
      loadingStartTime.current = null
    }
  }, [minLoadingTime])

  const updateMessage = useCallback((message: string) => {
    setLoadingMessage(message)
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      if (minTimeTimer.current) {
        clearTimeout(minTimeTimer.current)
      }
    }
  }, [])

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    updateMessage
  }
}
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

/**
 * Custom hook for monitoring component performance
 * Useful for identifying performance bottlenecks in development
 */
export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  const totalRenderTime = useRef<number>(0)

  // Start timing before render
  const startTiming = useCallback(() => {
    if (!enabled) return
    renderStartTime.current = performance.now()
  }, [enabled])

  // End timing after render
  const endTiming = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return
    
    const renderTime = performance.now() - renderStartTime.current
    renderCount.current += 1
    totalRenderTime.current += renderTime
    
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    }

    // Log slow renders (> 16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        averageRenderTime: `${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`
      })
    }

    // Log performance metrics every 10 renders in development
    if (renderCount.current % 10 === 0) {
      console.log(`📊 Performance metrics for ${componentName}:`, {
        totalRenders: renderCount.current,
        averageRenderTime: `${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`,
        totalRenderTime: `${totalRenderTime.current.toFixed(2)}ms`
      })
    }

    renderStartTime.current = 0
  }, [enabled, componentName])

  // Start timing on every render
  useEffect(() => {
    startTiming()
    return endTiming
  })

  // Return performance data
  return {
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0,
    totalRenderTime: totalRenderTime.current
  }
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as any).memory
      if (memory) {
        console.log(`🧠 Memory usage for ${componentName}:`, {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        })
      }
    }

    const interval = setInterval(checkMemory, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [componentName, enabled])
}

/**
 * Hook for monitoring component mount/unmount cycles
 */
export function useLifecycleMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  useEffect(() => {
    if (!enabled) return

    console.log(`🟢 ${componentName} mounted`)
    
    return () => {
      console.log(`🔴 ${componentName} unmounted`)
    }
  }, [componentName, enabled])
}
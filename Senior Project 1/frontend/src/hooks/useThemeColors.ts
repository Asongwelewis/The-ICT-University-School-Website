/**
 * Custom hook for managing theme colors across dashboard components
 * Centralizes color logic and provides consistent theming
 */

import { useMemo } from 'react'
import { DashboardStat, DashboardAction } from './useDashboardDataByRole'

type ColorVariant = DashboardStat['color'] | DashboardAction['color']

interface ColorClasses {
  icon: string
  border: string
  text: string
  value: string
  button: string
}

export const useThemeColors = (color: ColorVariant): ColorClasses => {
  return useMemo(() => {
    const colorMaps = {
      orange: {
        icon: 'text-orange-500',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-700 dark:text-orange-300',
        value: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-500 hover:bg-orange-600'
      },
      blue: {
        icon: 'text-blue-500',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        value: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      green: {
        icon: 'text-green-500',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        value: 'text-green-600 dark:text-green-400',
        button: 'bg-green-500 hover:bg-green-600'
      },
      red: {
        icon: 'text-red-500',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
        value: 'text-red-600 dark:text-red-400',
        button: 'bg-red-500 hover:bg-red-600'
      }
    }

    return colorMaps[color] || colorMaps.blue // fallback to blue
  }, [color])
}

/**
 * Hook for trend-specific colors
 */
export const useTrendColors = (trend?: 'up' | 'down' | 'stable') => {
  return useMemo(() => {
    const trendColors = {
      up: 'text-green-500',
      down: 'text-red-500',
      stable: 'text-gray-500'
    }
    
    return trendColors[trend || 'stable']
  }, [trend])
}

/**
 * Hook for getting semantic color classes
 */
export const useSemanticColors = () => {
  return useMemo(() => ({
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  }), [])
}
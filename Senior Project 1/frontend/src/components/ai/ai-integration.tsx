/**
 * AI Integration Wrapper
 * Provides comprehensive AI assistance including chat widget and text selection AI
 */

import React from 'react'
import { ChatWidget } from '@/components/ai/chat-widget'
import { AITextSelectionProvider } from '@/components/ai/text-selection-ai'
import { useAuth } from '@/hooks/useAuth'

interface AIIntegrationProps {
  children: React.ReactNode
  className?: string
}

export const AIIntegration: React.FC<AIIntegrationProps> = ({ 
  children, 
  className = "" 
}) => {
  const { user } = useAuth()
  const userRole = user?.role || 'student'

  return (
    <AITextSelectionProvider userRole={userRole}>
      <div className={`relative ${className}`}>
        {children}
        <ChatWidget />
      </div>
    </AITextSelectionProvider>
  )
}

// Higher-order component for pages that need AI integration
export const withAIIntegration = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const AIEnhancedComponent = (props: P) => {
    return (
      <AIIntegration>
        <Component {...props} />
      </AIIntegration>
    )
  }

  AIEnhancedComponent.displayName = `withAIIntegration(${Component.displayName || Component.name})`
  return AIEnhancedComponent
}

// Context data attributes helper for marking content types
export const getContextDataAttributes = (contentType: string) => ({
  'data-context-type': contentType,
  'data-ai-selectable': 'true'
})

// Ready-to-use context markers
export const AI_CONTEXT_MARKERS = {
  announcement: getContextDataAttributes('announcement'),
  note: getContextDataAttributes('note'),
  course: getContextDataAttributes('course'),
  assignment: getContextDataAttributes('assignment'),
  grade: getContextDataAttributes('grade'),
  schedule: getContextDataAttributes('schedule'),
  general: getContextDataAttributes('general')
}
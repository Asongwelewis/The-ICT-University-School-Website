'use client'

import { ReactNode } from 'react'
import { AIChatWidget } from '@/components/ai/ai-chat-widget'
import { TextExplainer } from '@/components/ai/text-explainer'
import { useAIAssistant } from '@/hooks/use-ai-assistant'

interface AIProviderProps {
  children: ReactNode
}

/**
 * AI Provider component that handles AI-related functionality
 * Separates AI concerns from the main dashboard layout
 */
export function AIProvider({ children }: AIProviderProps) {
  const {
    context,
    selectedText,
    textSelectionPosition,
    clearTextSelection
  } = useAIAssistant()

  return (
    <>
      {children}
      
      {/* AI Assistant Components */}
      <AIChatWidget context={context} />
      
      {selectedText && textSelectionPosition && (
        <TextExplainer
          selectedText={selectedText}
          position={textSelectionPosition}
          onClose={clearTextSelection}
        />
      )}
    </>
  )
}
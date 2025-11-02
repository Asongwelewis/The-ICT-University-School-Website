/**
 * Text Selection AI Assistant
 * Appears when users highlight text on announcements, notes, or other content
 */

import React, { useState, useEffect, useCallback } from 'react'
import { MessageCircle, X, Lightbulb, BookOpen, HelpCircle } from 'lucide-react'

interface TextSelectionAIProps {
  selectedText: string
  position: { x: number; y: number }
  onClose: () => void
  userRole: string
  contextType: 'announcement' | 'note' | 'course' | 'assignment' | 'general'
}

interface AIQuickAction {
  icon: React.ReactNode
  label: string
  action: string
  description: string
}

export const TextSelectionAI: React.FC<TextSelectionAIProps> = ({
  selectedText,
  position,
  onClose,
  userRole,
  contextType
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [quickActions, setQuickActions] = useState<AIQuickAction[]>([])

  useEffect(() => {
    setIsVisible(true)
    setQuickActions(getQuickActionsForContext(contextType, userRole))
  }, [contextType, userRole])

  const getQuickActionsForContext = (type: string, role: string): AIQuickAction[] => {
    const baseActions: AIQuickAction[] = [
      {
        icon: <HelpCircle className="w-4 h-4" />,
        label: 'Explain This',
        action: 'explain',
        description: 'Get a simple explanation of this content'
      },
      {
        icon: <Lightbulb className="w-4 h-4" />,
        label: 'Quick Summary',
        action: 'summarize',
        description: 'Get key points from this text'
      }
    ]

    // Add context-specific actions based on content type
    switch (type) {
      case 'announcement':
        baseActions.push({
          icon: <MessageCircle className="w-4 h-4" />,
          label: 'What Does This Mean?',
          action: 'announcement_meaning',
          description: 'Understand what this announcement means for you'
        })
        break
      
      case 'course':
        baseActions.push({
          icon: <BookOpen className="w-4 h-4" />,
          label: 'Course Help',
          action: 'course_guidance',
          description: 'Get guidance related to this course content'
        })
        break
      
      case 'assignment':
        if (role === 'student') {
          baseActions.push({
            icon: <BookOpen className="w-4 h-4" />,
            label: 'Study Tips',
            action: 'study_tips',
            description: 'Get tips for this assignment topic'
          })
        }
        break
    }

    return baseActions
  }

  const handleQuickAction = useCallback(async (action: string) => {
    const prompts = {
      explain: `Please explain this text in simple terms that a university ${userRole} can understand: "${selectedText}"`,
      summarize: `Summarize the key points from this text: "${selectedText}"`,
      announcement_meaning: `This is an announcement from my university. What does this mean for me as a ${userRole}? Text: "${selectedText}"`,
      course_guidance: `This is course-related content. Can you provide guidance or clarification about: "${selectedText}"`,
      study_tips: `This is from an assignment. Can you give me study tips or guidance related to: "${selectedText}"`
    }

    const prompt = prompts[action as keyof typeof prompts] || prompts.explain

    // Trigger the main AI chat with this prompt
    window.dispatchEvent(new CustomEvent('aiTextSelection', {
      detail: { prompt, selectedText, contextType }
    }))

    onClose()
  }, [selectedText, userRole, contextType, onClose])

  if (!isVisible) return null

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[320px]"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 340),
        top: Math.min(position.y, window.innerHeight - 200)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Ask AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected text preview */}
      <div className="bg-gray-50 rounded-md p-2 mb-3">
        <p className="text-xs text-gray-600 mb-1">Selected text:</p>
        <p className="text-sm text-gray-800 line-clamp-2">
          {selectedText.length > 80 ? `${selectedText.substring(0, 80)}...` : selectedText}
        </p>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-2">What would you like to know?</p>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.action)}
            className="w-full flex items-center gap-3 p-2 text-left hover:bg-blue-50 rounded-md transition-colors group"
          >
            <div className="text-blue-600 group-hover:text-blue-700">
              {action.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                {action.label}
              </p>
              <p className="text-xs text-gray-500">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick input */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            const customPrompt = prompt(`Ask about the selected text: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`)
            if (customPrompt) {
              window.dispatchEvent(new CustomEvent('aiTextSelection', {
                detail: { prompt: customPrompt, selectedText, contextType }
              }))
              onClose()
            }
          }}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ask custom question...
        </button>
      </div>
    </div>
  )
}

// Hook for text selection detection
export const useTextSelection = () => {
  const [selection, setSelection] = useState<{
    text: string
    position: { x: number; y: number }
    contextType: string
  } | null>(null)

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selectedText = window.getSelection()?.toString().trim()
      
      if (selectedText && selectedText.length > 5) {
        // Get context type from the nearest data attribute or class
        const target = e.target as HTMLElement
        const contextElement = target.closest('[data-context-type]')
        const contextType = contextElement?.getAttribute('data-context-type') || 'general'
        
        setSelection({
          text: selectedText,
          position: { x: e.clientX, y: e.clientY },
          contextType
        })
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (selection && !(e.target as HTMLElement).closest('.text-selection-ai')) {
        setSelection(null)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [selection])

  return {
    selection,
    clearSelection: () => setSelection(null)
  }
}

// Context wrapper component to enable text selection AI
export const AITextSelectionProvider: React.FC<{ 
  children: React.ReactNode
  userRole: string
}> = ({ children, userRole }) => {
  const { selection, clearSelection } = useTextSelection()

  return (
    <>
      {children}
      {selection && (
        <TextSelectionAI
          selectedText={selection.text}
          position={selection.position}
          contextType={selection.contextType as any}
          userRole={userRole}
          onClose={clearSelection}
        />
      )}
    </>
  )
}
import { useState, useCallback, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ComprehensiveAIAgent } from '@/lib/comprehensive-ai-agent'
import { useAuth } from '@/hooks/useAuth'
import { useCourses } from '@/hooks/use-courses'
import { useAnnouncements } from '@/hooks/use-announcements'
import { useAssignments } from '@/hooks/use-assignments'
import { useGrades } from '@/hooks/use-grades'
import { chatCache, CachedMessage, saveChatMessage, loadChatHistory } from '@/lib/chat-cache'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface UseAIChatReturn {
  messages: Message[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  cacheStats: {
    messageCount: number
    lastUpdated: Date | null
    cacheSize: number
  }
}

// Initialize Gemini AI
const initializeGemini = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured. Using intelligent agent responses.')
    return null
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    return genAI.getGenerativeModel({ model: 'gemini-pro' })
  } catch (error) {
    console.error('Failed to initialize Gemini:', error)
    return null
  }
}

// Initialize the model
const model = initializeGemini()

export const useAIChat = (): UseAIChatReturn => {
  const { user } = useAuth()
  const coursesHook = useCourses()
  const announcementsHook = useAnnouncements()
  const assignmentsHook = useAssignments()
  const gradesHook = useGrades()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load cached messages on mount
  useEffect(() => {
    if (user?.id) {
      const cachedMessages = loadChatHistory(user.id)
      
      if (cachedMessages.length > 0) {
        // Convert cached messages to current format
        const convertedMessages: Message[] = cachedMessages.map(cached => ({
          id: cached.id,
          content: cached.content,
          sender: cached.sender,
          timestamp: cached.timestamp
        }))
        setMessages(convertedMessages)
      } else {
        // Set initial welcome message
        const welcomeMessage: Message = {
          id: '1',
          content: '👋 Hey there! I\'m your intelligent AI assistant for ICT University. I can access your real academic data - assignments, courses, grades, and more! What would you like to know?',
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
        
        // Save welcome message to cache
        if (user?.id) {
          saveChatMessage({
            ...welcomeMessage,
            userId: user.id,
            metadata: { queryType: 'welcome', dataSource: 'system' }
          }, user.id)
        }
      }
    }
  }, [user?.id])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !user?.id) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Save user message to cache
    saveChatMessage({
      ...userMessage,
      userId: user.id,
      metadata: { queryType: 'user_input', dataSource: 'user' }
    }, user.id)

    try {
      const startTime = Date.now()
      
      const response = await callAIAgent(content, {
        user,
        courses: coursesHook.filteredCourses || [],
        announcements: announcementsHook.announcements || [],
        assignments: assignmentsHook.filteredAssignments || [],
        grades: gradesHook.filteredGrades || []
      })
      
      const processingTime = Date.now() - startTime
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
      
      // Save AI response to cache with metadata
      saveChatMessage({
        ...aiResponse,
        userId: user.id,
        metadata: { 
          queryType: detectQueryType(content),
          dataSource: 'ai_agent',
          processingTime
        }
      }, user.id)
      
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Save error message to cache
      if (user?.id) {
        saveChatMessage({
          ...errorMessage,
          userId: user.id,
          metadata: { queryType: 'error', dataSource: 'system' }
        }, user.id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, user, coursesHook.filteredCourses, announcementsHook.announcements, assignmentsHook.filteredAssignments, gradesHook.filteredGrades])

  const clearMessages = useCallback(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: '👋 Hey there! I\'m your intelligent AI assistant for ICT University. I can access your real academic data - assignments, courses, grades, and more! What would you like to know?',
      sender: 'ai',
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
    
    // Clear cache and save new welcome message
    if (user?.id) {
      chatCache.clearCache()
      saveChatMessage({
        ...welcomeMessage,
        userId: user.id,
        metadata: { queryType: 'welcome', dataSource: 'system' }
      }, user.id)
    }
  }, [user?.id])

  // Get cache statistics
  const cacheStats = user?.id ? chatCache.getCacheStats(user.id) : {
    messageCount: 0,
    lastUpdated: null,
    cacheSize: 0
  }

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    cacheStats
  }
}

// Detect query type for metadata
function detectQueryType(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('assignment')) return 'assignments'
  if (lowerMessage.includes('course')) return 'courses'
  if (lowerMessage.includes('grade')) return 'grades'
  if (lowerMessage.includes('schedule')) return 'schedule'
  if (lowerMessage.includes('notes')) return 'notes'
  if (['hi', 'hello', 'hey'].some(g => lowerMessage.includes(g))) return 'greeting'
  if (['bye', 'goodbye'].some(g => lowerMessage.includes(g))) return 'goodbye'
  
  return 'general'
}

// AI Agent integration with real data and Gemini Pro enhancement
async function callAIAgent(prompt: string, userData: any): Promise<string> {
  try {
    // Create Comprehensive AI Agent with user's real data
    const agent = new ComprehensiveAIAgent({
      userData: {
        courses: userData.courses || [],
        assignments: userData.assignments || [],
        grades: userData.grades || [],
        announcements: userData.announcements || [],
        profile: userData.user,
        schedule: [],
        notes: []
      },
      currentPage: 'dashboard',
      timestamp: new Date().toISOString(),
      userRole: userData.user?.role || 'student'
    })

    // Process the message using the comprehensive agent
    const agentResponse = await agent.processMessage(prompt)
    
    // If we have Gemini Pro available, enhance the response
    if (model) {
      try {
        const context = `You are an AI assistant for ICT University ERP System. The user asked: "${prompt}"
        
        Here's what our comprehensive AI agent found from their real data:
        ${agentResponse}
        
        Please provide a more natural, conversational response based on this information. Keep the factual data but make it sound more friendly and helpful. If the agent response looks good already, you can enhance it slightly or return it as-is.
        
        Important: 
        - If the agent says data isn't available, don't make up fake data. Keep the honest response about data availability.
        - Maintain all specific details like course names, grades, dates, etc.
        - Add helpful context or suggestions when appropriate.`

        const result = await model.generateContent(context)
        const response = await result.response
        const text = response.text()
        
        if (text && text.trim().length > 0) {
          return text
        }
      } catch (error) {
        console.error('Gemini enhancement failed:', error)
      }
    }
    
    // Return agent response if Gemini fails or isn't available
    return agentResponse
    
  } catch (error) {
    console.error('Comprehensive AI Agent Error:', error)
    
    // Final fallback to simple responses
    return getFallbackResponse(prompt)
  }
}

// Simple fallback responses
function getFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('hi') || lowerPrompt.includes('hello') || lowerPrompt.includes('yo')) {
    return `Hey there! 👋 I'm having trouble accessing your data right now, but I'm here to help! What can I assist you with?`
  }
  
  return `I understand you're asking about "${prompt}". I'm having trouble accessing your specific data right now, but I can still help guide you to the right section of your dashboard. What would you like to do?`
}
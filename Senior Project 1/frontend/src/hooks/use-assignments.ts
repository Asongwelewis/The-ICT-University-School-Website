import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export interface Assignment {
  id: string
  title: string
  description?: string
  courseId: string
  courseName: string
  courseCode: string
  dueDate: string
  submissionDate?: string
  status: 'pending' | 'submitted' | 'graded' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  maxScore: number
  receivedScore?: number
  feedback?: string
  attachments?: string[]
  submissionType: 'online' | 'physical' | 'presentation'
  createdAt: string
  updatedAt: string
}

interface AssignmentsState {
  assignments: Assignment[]
  loading: boolean
  error: string | null
  filter: 'all' | 'pending' | 'submitted' | 'graded' | 'overdue'
}

/**
 * Custom hook for managing student assignments
 * 
 * Features:
 * - Automatic data fetching for current user
 * - Real-time status updates
 * - Filtering and sorting capabilities
 * - Due date calculations and urgency indicators
 */
export function useAssignments() {
  const [state, setState] = useState<AssignmentsState>({
    assignments: [],
    loading: true,
    error: null,
    filter: 'all'
  })
  const { user } = useAuth()

  const fetchAssignments = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, assignments: [] }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.request<Assignment[]>('/academic/assignments')
      
      // For now, return empty array to indicate no real data available
      // This will make the AI say "no assignments available" instead of using mock data
      
      // Check if we should use real API or indicate no data
      const hasRealAPI = false // Set to true when backend API is ready
      
      if (!hasRealAPI) {
        setState(prev => ({
          ...prev,
          assignments: [],
          loading: false,
          error: null
        }))
        return
      }

      // Real API call would go here
      // const assignments = await apiClient.request<Assignment[]>('/academic/assignments')
      
      setState(prev => ({
        ...prev,
        assignments: [], // Real data would go here
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch assignments',
        loading: false,
        assignments: []
      }))
    }
  }, [user])

  const setFilter = useCallback((filter: AssignmentsState['filter']) => {
    setState(prev => ({ ...prev, filter }))
  }, [])

  const filteredAssignments = state.assignments.filter(assignment => {
    if (state.filter === 'all') return true
    
    // Handle overdue status
    if (state.filter === 'overdue') {
      const now = new Date()
      const dueDate = new Date(assignment.dueDate)
      return assignment.status === 'pending' && dueDate < now
    }
    
    return assignment.status === state.filter
  })

  // Calculate urgent assignments (due within 3 days)
  const urgentAssignments = state.assignments.filter(assignment => {
    if (assignment.status !== 'pending') return false
    
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    
    return daysUntilDue <= 3 && daysUntilDue >= 0
  })

  // Statistics for dashboard
  const stats = {
    total: state.assignments.length,
    pending: state.assignments.filter(a => a.status === 'pending').length,
    submitted: state.assignments.filter(a => a.status === 'submitted').length,
    graded: state.assignments.filter(a => a.status === 'graded').length,
    overdue: state.assignments.filter(a => {
      if (a.status !== 'pending') return false
      const now = new Date()
      const dueDate = new Date(a.dueDate)
      return dueDate < now
    }).length,
    urgent: urgentAssignments.length,
    averageScore: (() => {
      const gradedAssignments = state.assignments.filter(a => a.receivedScore !== undefined)
      if (gradedAssignments.length === 0) return undefined
      
      const totalScore = gradedAssignments.reduce((sum, a) => sum + (a.receivedScore || 0), 0)
      const totalMaxScore = gradedAssignments.reduce((sum, a) => sum + a.maxScore, 0)
      
      return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0
    })()
  }

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  return {
    ...state,
    filteredAssignments,
    urgentAssignments,
    stats,
    setFilter,
    refetch: fetchAssignments,
    hasRealData: state.assignments.length > 0
  }
}

export type { AssignmentsState }
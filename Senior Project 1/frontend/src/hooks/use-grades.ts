import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export interface Grade {
  id: string
  studentId: string
  courseId: string
  courseName: string
  courseCode: string
  assessmentType: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation'
  assessmentName: string
  receivedScore: number
  maxScore: number
  percentage: number
  letterGrade?: string
  gpaPoints?: number
  weight: number // Weight of this assessment in final grade (0-1)
  feedback?: string
  gradedDate: string
  submissionDate?: string
  instructor: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CourseGrade {
  courseId: string
  courseName: string
  courseCode: string
  credits: number
  currentGrade?: number
  letterGrade?: string
  gpaPoints?: number
  grades: Grade[]
  instructor: string
  semester: string
  status: 'in_progress' | 'completed'
}

export interface AcademicSummary {
  currentGPA: number
  cumulativeGPA: number
  totalCredits: number
  completedCredits: number
  currentSemesterCredits: number
  academicStanding: 'good' | 'probation' | 'warning' | 'honors'
  semester: string
  academicYear: string
}

interface GradesState {
  grades: Grade[]
  courseGrades: CourseGrade[]
  academicSummary: AcademicSummary | null
  loading: boolean
  error: string | null
  filter: 'all' | 'recent' | 'assignments' | 'exams'
}

/**
 * Custom hook for managing student grades and academic performance
 * 
 * Features:
 * - Comprehensive grade tracking across all courses
 * - GPA calculations and academic standing
 * - Performance analytics and trends
 * - Filtering and sorting capabilities
 */
export function useGrades() {
  const [state, setState] = useState<GradesState>({
    grades: [],
    courseGrades: [],
    academicSummary: null,
    loading: true,
    error: null,
    filter: 'all'
  })
  const { user } = useAuth()

  const fetchGrades = useCallback(async () => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        grades: [],
        courseGrades: [],
        academicSummary: null
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // TODO: Replace with actual API calls when backend is ready
      // const gradesResponse = await apiClient.request<Grade[]>('/academic/grades')
      // const summaryResponse = await apiClient.request<AcademicSummary>('/academic/summary')
      
      // For now, return empty data to indicate no real data available
      // This will make the AI say "no grades available" instead of using mock data
      
      const hasRealAPI = false // Set to true when backend API is ready
      
      if (!hasRealAPI) {
        setState(prev => ({
          ...prev,
          grades: [],
          courseGrades: [],
          academicSummary: null,
          loading: false,
          error: null
        }))
        return
      }

      // Real API calls would go here
      setState(prev => ({
        ...prev,
        grades: [], // Real data would go here
        courseGrades: [], // Real data would go here
        academicSummary: null, // Real data would go here
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch grades',
        loading: false,
        grades: [],
        courseGrades: [],
        academicSummary: null
      }))
    }
  }, [user])

  const setFilter = useCallback((filter: GradesState['filter']) => {
    setState(prev => ({ ...prev, filter }))
  }, [])

  const filteredGrades = state.grades.filter(grade => {
    switch (state.filter) {
      case 'recent':
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        return new Date(grade.gradedDate) >= twoWeeksAgo
      case 'assignments':
        return grade.assessmentType === 'assignment' || grade.assessmentType === 'project'
      case 'exams':
        return grade.assessmentType === 'midterm' || grade.assessmentType === 'final' || grade.assessmentType === 'quiz'
      default:
        return true
    }
  })

  // Performance statistics
  const stats = {
    totalGrades: state.grades.length,
    averageScore: state.grades.length > 0 
      ? Math.round(state.grades.reduce((sum, g) => sum + g.percentage, 0) / state.grades.length)
      : undefined,
    recentGrades: state.grades.filter(g => {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(g.gradedDate) >= oneWeekAgo
    }).length,
    coursesWithGrades: state.courseGrades.length,
    currentGPA: state.academicSummary?.currentGPA,
    cumulativeGPA: state.academicSummary?.cumulativeGPA,
    academicStanding: state.academicSummary?.academicStanding
  }

  // Get grades for specific course
  const getCourseGrades = useCallback((courseId: string) => {
    return state.grades.filter(grade => grade.courseId === courseId)
  }, [state.grades])

  // Get recent performance trend
  const getPerformanceTrend = useCallback(() => {
    if (state.grades.length < 2) return 'stable'
    
    const sortedGrades = [...state.grades]
      .sort((a, b) => new Date(a.gradedDate).getTime() - new Date(b.gradedDate).getTime())
    
    const recent = sortedGrades.slice(-5) // Last 5 grades
    const previous = sortedGrades.slice(-10, -5) // Previous 5 grades
    
    if (recent.length === 0 || previous.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, g) => sum + g.percentage, 0) / recent.length
    const previousAvg = previous.reduce((sum, g) => sum + g.percentage, 0) / previous.length
    
    const difference = recentAvg - previousAvg
    
    if (difference > 5) return 'improving'
    if (difference < -5) return 'declining'
    return 'stable'
  }, [state.grades])

  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  return {
    ...state,
    filteredGrades,
    stats,
    setFilter,
    refetch: fetchGrades,
    getCourseGrades,
    getPerformanceTrend,
    hasRealData: state.grades.length > 0 || state.courseGrades.length > 0
  }
}

export type { GradesState }
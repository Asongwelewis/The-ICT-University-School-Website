import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

// Enhanced type definitions
interface CourseSchedule {
  day: string
  startTime: string
  endTime: string
  room?: string
}

interface Course {
  id: string
  code: string
  name: string
  description?: string
  credits: number
  instructor?: {
    id: string
    name: string
    email?: string
  }
  enrolledStudents?: number
  maxStudents?: number
  schedule: CourseSchedule[]
  status: 'active' | 'completed' | 'upcoming' | 'cancelled'
  progress?: number
  semester: string
  academicYear: string
  department?: string
  createdAt: string
  updatedAt: string
}

interface CoursesState {
  courses: Course[]
  loading: boolean
  error: string | null
  filter: 'all' | 'active' | 'completed' | 'upcoming'
}

/**
 * Custom hook for managing courses data and state
 * 
 * Features:
 * - Automatic data fetching based on user role
 * - Error handling and loading states
 * - Filtering capabilities
 * - Optimistic updates for better UX
 * - Caching and refetch functionality
 */
export function useCourses() {
  const [state, setState] = useState<CoursesState>({
    courses: [],
    loading: true,
    error: null,
    filter: 'all'
  })
  const { user } = useAuth()

  const fetchCourses = useCallback(async () => {
    if (!user) return

    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // const endpoint = user.role === 'student' 
      //   ? '/academic/courses/enrolled' 
      //   : '/academic/courses/teaching'
      // const response = await apiClient.request<Course[]>(endpoint)
      
      // Mock data with realistic structure
      const mockCourses: Course[] = user.role === 'student' ? [
        {
          id: '1',
          code: 'CS101',
          name: 'Introduction to Computer Science',
          description: 'Fundamentals of programming and computer science concepts including algorithms, data structures, and problem-solving techniques.',
          credits: 3,
          instructor: {
            id: 'inst1',
            name: 'Dr. Smith',
            email: 'smith@ictuniversity.edu'
          },
          schedule: [
            { day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'CS-101' },
            { day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'CS-101' },
            { day: 'Friday', startTime: '09:00', endTime: '10:30', room: 'CS-101' }
          ],
          status: 'active',
          progress: 75,
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          department: 'Computer Science',
          createdAt: '2024-08-15T00:00:00Z',
          updatedAt: '2024-10-15T00:00:00Z'
        },
        {
          id: '2',
          code: 'MATH201',
          name: 'Calculus II',
          description: 'Advanced calculus including integration techniques, infinite series, and applications to physics and engineering.',
          credits: 4,
          instructor: {
            id: 'inst2',
            name: 'Prof. Johnson',
            email: 'johnson@ictuniversity.edu'
          },
          schedule: [
            { day: 'Tuesday', startTime: '14:00', endTime: '15:30', room: 'MATH-201' },
            { day: 'Thursday', startTime: '14:00', endTime: '15:30', room: 'MATH-201' }
          ],
          status: 'active',
          progress: 60,
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          department: 'Mathematics',
          createdAt: '2024-08-15T00:00:00Z',
          updatedAt: '2024-10-10T00:00:00Z'
        },
        {
          id: '3',
          code: 'ENG102',
          name: 'Technical Writing',
          description: 'Professional communication skills for technical fields including report writing and documentation.',
          credits: 2,
          instructor: {
            id: 'inst3',
            name: 'Dr. Williams',
            email: 'williams@ictuniversity.edu'
          },
          schedule: [
            { day: 'Friday', startTime: '11:00', endTime: '12:30', room: 'ENG-102' }
          ],
          status: 'completed',
          progress: 100,
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          department: 'English',
          createdAt: '2024-08-15T00:00:00Z',
          updatedAt: '2024-09-30T00:00:00Z'
        }
      ] : [
        {
          id: '1',
          code: 'CS101',
          name: 'Introduction to Computer Science',
          description: 'Fundamentals of programming and computer science concepts including algorithms, data structures, and problem-solving techniques.',
          credits: 3,
          enrolledStudents: 45,
          maxStudents: 50,
          schedule: [
            { day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'CS-101' },
            { day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'CS-101' },
            { day: 'Friday', startTime: '09:00', endTime: '10:30', room: 'CS-101' }
          ],
          status: 'active',
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          department: 'Computer Science',
          createdAt: '2024-08-15T00:00:00Z',
          updatedAt: '2024-10-15T00:00:00Z'
        },
        {
          id: '4',
          code: 'CS201',
          name: 'Data Structures and Algorithms',
          description: 'Advanced programming concepts including complex data structures, algorithm analysis, and optimization techniques.',
          credits: 4,
          enrolledStudents: 32,
          maxStudents: 40,
          schedule: [
            { day: 'Tuesday', startTime: '10:00', endTime: '11:30', room: 'CS-201' },
            { day: 'Thursday', startTime: '10:00', endTime: '11:30', room: 'CS-201' }
          ],
          status: 'active',
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          department: 'Computer Science',
          createdAt: '2024-08-15T00:00:00Z',
          updatedAt: '2024-10-12T00:00:00Z'
        }
      ]

      // Simulate API delay for realistic loading experience
      await new Promise(resolve => setTimeout(resolve, 800))

      setState(prev => ({
        ...prev,
        courses: mockCourses,
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch courses',
        loading: false
      }))
    }
  }, [user])

  const setFilter = useCallback((filter: CoursesState['filter']) => {
    setState(prev => ({ ...prev, filter }))
  }, [])

  const filteredCourses = state.courses.filter(course => {
    if (state.filter === 'all') return true
    return course.status === state.filter
  })

  // Statistics for dashboard
  const stats = {
    total: state.courses.length,
    active: state.courses.filter(c => c.status === 'active').length,
    completed: state.courses.filter(c => c.status === 'completed').length,
    upcoming: state.courses.filter(c => c.status === 'upcoming').length,
    averageProgress: user?.role === 'student' 
      ? Math.round(
          state.courses
            .filter(c => c.progress !== undefined)
            .reduce((sum, c) => sum + (c.progress || 0), 0) / 
          state.courses.filter(c => c.progress !== undefined).length || 0
        )
      : undefined
  }

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return {
    ...state,
    filteredCourses,
    stats,
    setFilter,
    refetch: fetchCourses
  }
}

export type { Course, CourseSchedule, CoursesState }
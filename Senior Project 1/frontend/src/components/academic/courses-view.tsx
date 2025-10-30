'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCourses, type Course } from '@/hooks/use-courses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Modal } from '@/components/ui/modal'
import { Users, Calendar, Plus, BookOpen, Clock, GraduationCap, TrendingUp, FileText, Award, MapPin } from 'lucide-react'
import Link from 'next/link'
import { CourseSchedule } from '@/types'
import { CourseSchedule } from '@/types'
import { CourseSchedule } from '@/types'

export function CoursesView() {
  const { user } = useAuth()
  const { filteredCourses, loading, error, filter, setFilter, refetch, stats } = useCourses()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCourse(null)
  }

  // Helper function to format schedule
  const formatSchedule = (schedule: CourseSchedule[]): string => {
    return schedule
      .map(s => `${s.day} ${s.startTime}-${s.endTime}`)
      .join(', ')
  }

  // Helper function to get status badge variant
  const getStatusVariant = (status: Course['status']) => {
    switch (status) {
      case 'active': return 'default'
      case 'completed': return 'secondary'
      case 'upcoming': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">⚠️ Error loading courses</div>
          <p className="text-gray-600">{error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-orange-500" />
            My Courses
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'student' 
              ? 'Track your enrolled courses and academic progress' 
              : 'Manage your teaching assignments and course materials'
            }
          </p>
        </div>
        
        {user?.role !== 'student' && (
          <Button className="bg-orange-500 hover:bg-orange-600 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        {user?.role === 'student' && stats.averageProgress !== undefined ? (
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'completed', 'upcoming'] as const).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
            className={filter === filterOption ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            {filterOption === 'all' && ` (${filteredCourses.length})`}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You don't have any courses yet." 
              : `No ${filter} courses found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              userRole={user?.role}
              onViewDetails={() => handleViewDetails(course)}
            />
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : ''}
      >
        {selectedCourse && (
          <CourseDetailsContent 
            course={selectedCourse} 
            userRole={user?.role}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  )
}

// Separate CourseCard component for better maintainability
interface CourseCardProps {
  course: Course
  userRole?: string
  onViewDetails: () => void
}

function CourseCard({ course, userRole, onViewDetails }: CourseCardProps) {
  const formatSchedule = (schedule: CourseSchedule[]): string => {
    return schedule
      .map(s => `${s.day} ${s.startTime}-${s.endTime}`)
      .join(', ')
  }

  const getStatusVariant = (status: Course['status']) => {
    switch (status) {
      case 'active': return 'default'
      case 'completed': return 'secondary'
      case 'upcoming': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              {course.code}
            </CardTitle>
            <CardDescription className="font-medium text-gray-700 mt-1">
              {course.name}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(course.status)} className="capitalize">
            {course.status}
          </Badge>
        </div>
        {course.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {course.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Details */}
        <div className="space-y-3">
          {userRole === 'student' ? (
            <>
              {course.instructor && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span>{course.instructor.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span>{formatSchedule(course.schedule)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{course.credits} Credits</span>
              </div>
              
              {course.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-orange-500" />
                <span>
                  {course.enrolledStudents || 0}
                  {course.maxStudents && `/${course.maxStudents}`} Students
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span>{formatSchedule(course.schedule)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{course.credits} Credits</span>
              </div>
            </>
          )}
        </div>
        
        {/* Action Button */}
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}

// Course Details Modal Content
interface CourseDetailsContentProps {
  course: Course
  userRole?: string
  onClose: () => void
}

function CourseDetailsContent({ course, userRole, onClose }: CourseDetailsContentProps) {
  const formatSchedule = (schedule: CourseSchedule[]): string => {
    return schedule
      .map(s => `${s.day} ${s.startTime}-${s.endTime}`)
      .join(', ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'upcoming': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mock data for demonstration
  const totalNotes = 12
  const completedNotes = Math.floor((course.progress || 0) / 100 * totalNotes)
  const notesProgress = course.progress || 0

  return (
    <div className="space-y-6">
      {/* Status and Basic Info */}
      <div className="flex items-center justify-between">
        <Badge className={getStatusColor(course.status)}>
          {course.status}
        </Badge>
        <div className="text-sm text-gray-500">
          {course.credits} Credits
        </div>
      </div>

      {/* Course Description */}
      {course.description && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{course.description}</p>
        </div>
      )}

      {/* Course Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {course.instructor && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Instructor</p>
              <p className="text-sm text-gray-600">{course.instructor.name}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Schedule</p>
            <p className="text-sm text-gray-600">{formatSchedule(course.schedule)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Location</p>
            <p className="text-sm text-gray-600">Room A101</p>
          </div>
        </div>

        {course.enrolledStudents && userRole !== 'student' && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Students</p>
              <p className="text-sm text-gray-600">{course.enrolledStudents} enrolled</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Section for Students */}
      {userRole === 'student' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              Course Progress
            </h3>
            <span className="text-sm font-medium text-gray-600">
              {notesProgress}%
            </span>
          </div>
          <Progress value={notesProgress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>
              {completedNotes} of {totalNotes} notes completed
            </span>
            <span>
              {notesProgress === 100 ? 'Course Complete!' : `${100 - notesProgress}% remaining`}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Link
          href={`/courses/${course.id}/notes`}
          className="flex-1"
          onClick={onClose}
        >
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            <FileText className="h-4 w-4 mr-2" />
            📚 Course Notes
          </Button>
        </Link>

        {userRole === 'student' ? (
          <Link
            href={`/assignments?course=${course.id}`}
            className="flex-1"
            onClick={onClose}
          >
            <Button variant="outline" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Assignments
            </Button>
          </Link>
        ) : (
          <Link
            href={`/courses/${course.id}/manage`}
            className="flex-1"
            onClick={onClose}
          >
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Manage Course
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {totalNotes}
          </div>
          <div className="text-xs text-gray-500">Total Notes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {completedNotes}
          </div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {notesProgress}%
          </div>
          <div className="text-xs text-gray-500">Progress</div>
        </div>
      </div>
    </div>
  )
}
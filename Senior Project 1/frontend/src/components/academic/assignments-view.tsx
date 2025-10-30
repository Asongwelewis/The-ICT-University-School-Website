'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Clock, Plus, Download, Upload } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  courseCode: string
  courseName: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded' | 'overdue'
  type: 'assignment' | 'project' | 'essay' | 'lab'
  points: number
  grade?: number
  submittedAt?: string
}

export function AssignmentsView() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')

  const getAssignmentsData = (): Assignment[] => {
    if (user?.role === 'student') {
      return [
        {
          id: '1',
          title: 'Data Structures Implementation',
          courseCode: 'CS101',
          courseName: 'Introduction to Computer Science',
          description: 'Implement basic data structures in Python',
          dueDate: '2024-11-05',
          status: 'pending',
          type: 'assignment',
          points: 100
        },
        {
          id: '2',
          title: 'Calculus Problem Set 5',
          courseCode: 'MATH201',
          courseName: 'Calculus II',
          description: 'Solve integration problems from chapter 8',
          dueDate: '2024-11-02',
          status: 'submitted',
          type: 'assignment',
          points: 50,
          submittedAt: '2024-11-01'
        },
        {
          id: '3',
          title: 'Technical Writing Essay',
          courseCode: 'ENG102',
          courseName: 'Technical Writing',
          description: 'Write a 1500-word technical report',
          dueDate: '2024-10-28',
          status: 'graded',
          type: 'essay',
          points: 75,
          grade: 68,
          submittedAt: '2024-10-27'
        }
      ]
    } else {
      return [
        {
          id: '1',
          title: 'Data Structures Implementation',
          courseCode: 'CS101',
          courseName: 'Introduction to Computer Science',
          description: 'Implement basic data structures in Python',
          dueDate: '2024-11-05',
          status: 'pending',
          type: 'assignment',
          points: 100
        }
      ]
    }
  }

  const assignments = getAssignmentsData()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'graded': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return '📝'
      case 'project': return '🚀'
      case 'essay': return '📄'
      case 'lab': return '🔬'
      default: return '📋'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    return assignment.status === filter
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'student' ? 'My Assignments' : 'Assignment Management'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? 'Track and submit your assignments' 
              : 'Create and manage course assignments'
            }
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
          
          {user?.role !== 'student' && (
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards for Students */}
      {user?.role === 'student' && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {assignments.filter(a => a.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Upload className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {assignments.filter(a => a.status === 'submitted').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.status === 'graded').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">85%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getTypeIcon(assignment.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {assignment.courseCode} - {assignment.courseName}
                    </p>
                    
                    <p className="text-gray-700 mb-3">{assignment.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {assignment.dueDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{assignment.points} points</span>
                      </div>
                      
                      {assignment.submittedAt && (
                        <div className="flex items-center gap-1">
                          <Upload className="h-4 w-4" />
                          <span>Submitted: {assignment.submittedAt}</span>
                        </div>
                      )}
                    </div>
                    
                    {assignment.grade && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">
                          Grade: {assignment.grade}/{assignment.points} ({Math.round((assignment.grade / assignment.points) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {user?.role === 'student' ? (
                    <>
                      {assignment.status === 'pending' && (
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      )}
                      
                      {assignment.status === 'graded' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      
                      <div className="text-xs text-center">
                        {getDaysUntilDue(assignment.dueDate) > 0 
                          ? `${getDaysUntilDue(assignment.dueDate)} days left`
                          : 'Overdue'
                        }
                      </div>
                    </>
                  ) : (
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
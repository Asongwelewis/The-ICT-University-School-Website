'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, TrendingUp, Calendar, Edit } from 'lucide-react'

interface Grade {
  id: string
  courseCode: string
  courseName: string
  assignment: string
  grade: string
  points: number
  maxPoints: number
  date: string
  type: 'assignment' | 'exam' | 'quiz' | 'project'
}

export function GradesView() {
  const { user } = useAuth()

  const getGradesData = (): Grade[] => {
    if (user?.role === 'student') {
      return [
        {
          id: '1',
          courseCode: 'CS101',
          courseName: 'Introduction to Computer Science',
          assignment: 'Midterm Exam',
          grade: 'A-',
          points: 87,
          maxPoints: 100,
          date: '2024-10-15',
          type: 'exam'
        },
        {
          id: '2',
          courseCode: 'MATH201',
          courseName: 'Calculus II',
          assignment: 'Assignment 3',
          grade: 'B+',
          points: 85,
          maxPoints: 100,
          date: '2024-10-20',
          type: 'assignment'
        }
      ]
    } else {
      return [
        {
          id: '1',
          courseCode: 'CS101',
          courseName: 'Introduction to Computer Science',
          assignment: 'Midterm Exam',
          grade: 'Pending',
          points: 0,
          maxPoints: 100,
          date: '2024-10-15',
          type: 'exam'
        }
      ]
    }
  }

  const grades = getGradesData()

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    if (grade === 'Pending') return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return '📝'
      case 'assignment': return '📋'
      case 'quiz': return '❓'
      case 'project': return '🚀'
      default: return '📄'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'student' ? 'My Grades' : 'Grade Management'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? 'Track your academic performance' 
              : 'Manage student grades and assessments'
            }
          </p>
        </div>
      </div>

      {user?.role === 'student' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
              <Award className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">3.85</div>
              <p className="text-xs text-gray-500">Out of 4.0</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Semester GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">3.92</div>
              <p className="text-xs text-gray-500">Current semester</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">45</div>
              <p className="text-xs text-gray-500">Total credits</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>
            {user?.role === 'student' 
              ? 'Your latest assessment results' 
              : 'Grades requiring your attention'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(grade.type)}</div>
                  <div>
                    <div className="font-medium">{grade.assignment}</div>
                    <div className="text-sm text-gray-500">
                      {grade.courseCode} - {grade.courseName}
                    </div>
                    <div className="text-xs text-gray-400">{grade.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {user?.role === 'student' ? (
                    <>
                      <div className="text-right">
                        <div className="font-medium">{grade.points}/{grade.maxPoints}</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((grade.points / grade.maxPoints) * 100)}%
                        </div>
                      </div>
                      <Badge className={getGradeColor(grade.grade)}>
                        {grade.grade}
                      </Badge>
                    </>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Grade
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
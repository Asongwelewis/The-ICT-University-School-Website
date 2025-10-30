'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

interface ScheduleItem {
  id: string
  title: string
  courseCode: string
  type: 'lecture' | 'lab' | 'tutorial' | 'exam'
  time: string
  duration: string
  location: string
  instructor?: string
  students?: number
  day: string
}

export function ScheduleView() {
  const { user } = useAuth()
  const [selectedWeek, setSelectedWeek] = useState('current')

  const getScheduleData = (): ScheduleItem[] => {
    const baseSchedule = [
      {
        id: '1',
        title: 'Introduction to Computer Science',
        courseCode: 'CS101',
        type: 'lecture' as const,
        time: '09:00',
        duration: '1h 30m',
        location: 'Room A101',
        instructor: 'Dr. Smith',
        students: 45,
        day: 'Monday'
      },
      {
        id: '2',
        title: 'Calculus II',
        courseCode: 'MATH201',
        type: 'lecture' as const,
        time: '14:00',
        duration: '2h',
        location: 'Room B205',
        instructor: 'Prof. Johnson',
        students: 32,
        day: 'Tuesday'
      },
      {
        id: '3',
        title: 'CS Lab Session',
        courseCode: 'CS101',
        type: 'lab' as const,
        time: '10:00',
        duration: '2h',
        location: 'Computer Lab 1',
        instructor: 'Dr. Smith',
        students: 20,
        day: 'Wednesday'
      }
    ]
    return baseSchedule
  }

  const schedule = getScheduleData()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800'
      case 'lab': return 'bg-green-100 text-green-800'
      case 'tutorial': return 'bg-purple-100 text-purple-800'
      case 'exam': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScheduleForDay = (day: string) => {
    return schedule.filter(item => item.day === day)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'student' ? 'My Schedule' : 'Teaching Schedule'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? 'View your class timetable and upcoming sessions' 
              : 'Manage your teaching schedule and classroom assignments'
            }
          </p>
        </div>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
        >
          <option value="current">Current Week</option>
          <option value="next">Next Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Weekly Calendar View */}
      <div className="grid gap-4 lg:grid-cols-5">
        {days.map((day) => {
          const daySchedule = getScheduleForDay(day)
          return (
            <Card key={day} className="min-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center">{day}</CardTitle>
                <CardDescription className="text-center">
                  {daySchedule.length} {daySchedule.length === 1 ? 'session' : 'sessions'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySchedule.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <span className="text-sm font-medium">{item.time}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{item.courseCode}</div>
                      <div className="text-xs text-gray-600">{item.title}</div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{item.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                      
                      {user?.role === 'student' && item.instructor && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{item.instructor}</span>
                        </div>
                      )}
                      
                      {user?.role !== 'student' && item.students && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{item.students} students</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {daySchedule.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classes scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Next few scheduled classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge className={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                  <div>
                    <div className="font-medium">{item.courseCode} - {item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.day} at {item.time} • {item.location}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react'

export function TimetableView() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<string>('all')

  // Mock timetable data
  const timetableData = [
    {
      id: '1',
      title: 'Introduction to Computer Science',
      type: 'class',
      courseCode: 'CS101',
      instructor: 'Dr. Smith',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'A101'
    },
    {
      id: '2',
      title: 'CS101 Midterm Exam',
      type: 'exam',
      courseCode: 'CS101',
      dayOfWeek: 'Friday',
      startTime: '10:00',
      endTime: '12:00',
      room: 'Exam Hall 1'
    }
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800'
      case 'exam': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600">View your schedule and timetables</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            <option value="class">Classes</option>
            <option value="exam">Exams</option>
          </select>
          
          {user?.role !== 'student' && (
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {days.map((day) => (
          <Card key={day} className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-center">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timetableData
                .filter(item => item.dayOfWeek === day)
                .map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    <div className="mt-2">
                      <div className="font-medium text-sm">{item.courseCode}</div>
                      <div className="text-xs text-gray-600">{item.title}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{item.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
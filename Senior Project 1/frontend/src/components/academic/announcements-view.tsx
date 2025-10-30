'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, User, Pin, Plus, Filter } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'academic' | 'finance' | 'administration' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  authorName: string
  authorRole: string
  publishedAt: string
  isPinned: boolean
  department?: string
}

export function AnnouncementsView() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  // Mock announcements data
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Semester Registration Now Open',
      content: 'Students can now register for the upcoming semester. Registration deadline is November 15th, 2024. Please ensure all fees are paid before registration.',
      type: 'academic',
      priority: 'high',
      authorName: 'Dr. Academic Affairs',
      authorRole: 'Academic Staff',
      publishedAt: '2024-10-25',
      isPinned: true,
      department: 'Academic Affairs'
    },
    {
      id: '2',
      title: 'Fee Payment Reminder',
      content: 'This is a reminder that tuition fees for the current semester are due by October 30th, 2024. Late payment will incur additional charges.',
      type: 'finance',
      priority: 'urgent',
      authorName: 'Finance Department',
      authorRole: 'Finance Staff',
      publishedAt: '2024-10-28',
      isPinned: true
    },
    {
      id: '3',
      title: 'Library Hours Extended',
      content: 'The university library will now be open until 10 PM on weekdays to accommodate student study needs during exam period.',
      type: 'general',
      priority: 'medium',
      authorName: 'Library Administration',
      authorRole: 'Administration',
      publishedAt: '2024-10-26',
      isPinned: false
    },
    {
      id: '4',
      title: 'Campus Network Maintenance',
      content: 'Scheduled network maintenance will occur on November 1st from 2 AM to 6 AM. Internet services may be intermittent during this period.',
      type: 'administration',
      priority: 'medium',
      authorName: 'IT Department',
      authorRole: 'System Admin',
      publishedAt: '2024-10-24',
      isPinned: false
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800'
      case 'finance': return 'bg-green-100 text-green-800'
      case 'administration': return 'bg-purple-100 text-purple-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '📢'
      case 'low': return '📝'
      default: return '📄'
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const typeMatch = selectedType === 'all' || announcement.type === selectedType
    const priorityMatch = selectedPriority === 'all' || announcement.priority === selectedPriority
    return typeMatch && priorityMatch
  })

  // Sort by pinned first, then by priority, then by date
  const sortedAnnouncements = filteredAnnouncements.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]
    
    if (aPriority !== bPriority) return bPriority - aPriority
    
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Stay updated with important notices and updates</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="academic">Academic</option>
            <option value="finance">Finance</option>
            <option value="administration">Administration</option>
            <option value="general">General</option>
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          {user?.role !== 'student' && (
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{announcements.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pinned</CardTitle>
            <Pin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {announcements.filter(a => a.isPinned).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {announcements.filter(a => a.priority === 'urgent').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {announcements.filter(a => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(a.publishedAt) >= weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={`hover:shadow-md transition-shadow ${announcement.isPinned ? 'ring-2 ring-orange-200' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getPriorityIcon(announcement.priority)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center gap-1 mb-1">
                    <User className="h-3 w-3" />
                    <span>{announcement.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{announcement.publishedAt}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {announcement.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {announcement.department && (
                    <span>Department: {announcement.department}</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {user?.role !== 'student' && (
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more announcements.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
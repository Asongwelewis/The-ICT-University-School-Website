'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, User, Pin, Plus, Filter } from 'lucide-react'

// ===== TYPES & CONSTANTS =====
interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  priority: AnnouncementPriority
  authorName: string
  authorRole: string
  publishedAt: string
  isPinned: boolean
  department?: string
}

type AnnouncementType = 'general' | 'academic' | 'finance' | 'administration' | 'emergency'
type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent'

const ANNOUNCEMENT_TYPES: Record<AnnouncementType, { label: string; color: string }> = {
  academic: { label: 'Academic', color: 'bg-blue-100 text-blue-800' },
  finance: { label: 'Finance', color: 'bg-green-100 text-green-800' },
  administration: { label: 'Administration', color: 'bg-purple-100 text-purple-800' },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-800' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-800' }
}

const ANNOUNCEMENT_PRIORITIES: Record<AnnouncementPriority, { 
  label: string; 
  color: string; 
  icon: string; 
  order: number 
}> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🚨', order: 4 },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: '⚠️', order: 3 },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '📢', order: 2 },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: '📝', order: 1 }
}

const DAYS_IN_WEEK = 7

// ===== CUSTOM HOOKS =====
function useAnnouncementFilters() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  const resetFilters = () => {
    setSelectedType('all')
    setSelectedPriority('all')
  }

  return {
    selectedType,
    selectedPriority,
    setSelectedType,
    setSelectedPriority,
    resetFilters
  }
}

function useAnnouncementData() {
  // TODO: Replace with actual API call
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

  return { announcements, isLoading: false, error: null }
}

// ===== UTILITY FUNCTIONS =====
class AnnouncementUtils {
  static getTypeColor(type: AnnouncementType): string {
    return ANNOUNCEMENT_TYPES[type]?.color || ANNOUNCEMENT_TYPES.general.color
  }

  static getPriorityColor(priority: AnnouncementPriority): string {
    return ANNOUNCEMENT_PRIORITIES[priority]?.color || ANNOUNCEMENT_PRIORITIES.low.color
  }

  static getPriorityIcon(priority: AnnouncementPriority): string {
    return ANNOUNCEMENT_PRIORITIES[priority]?.icon || ANNOUNCEMENT_PRIORITIES.low.icon
  }

  static filterAnnouncements(
    announcements: Announcement[],
    typeFilter: string,
    priorityFilter: string
  ): Announcement[] {
    return announcements.filter(announcement => {
      const typeMatch = typeFilter === 'all' || announcement.type === typeFilter
      const priorityMatch = priorityFilter === 'all' || announcement.priority === priorityFilter
      return typeMatch && priorityMatch
    })
  }

  static sortAnnouncements(announcements: Announcement[]): Announcement[] {
    return [...announcements].sort((a, b) => {
      // Pinned announcements first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Then by priority
      const aPriority = ANNOUNCEMENT_PRIORITIES[a.priority]?.order || 0
      const bPriority = ANNOUNCEMENT_PRIORITIES[b.priority]?.order || 0
      if (aPriority !== bPriority) return bPriority - aPriority
      
      // Finally by date
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
  }

  static getAnnouncementsFromLastWeek(announcements: Announcement[]): Announcement[] {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - DAYS_IN_WEEK)
    return announcements.filter(a => new Date(a.publishedAt) >= weekAgo)
  }

  static getAnnouncementsByPriority(announcements: Announcement[], priority: AnnouncementPriority): Announcement[] {
    return announcements.filter(a => a.priority === priority)
  }

  static getPinnedAnnouncements(announcements: Announcement[]): Announcement[] {
    return announcements.filter(a => a.isPinned)
  }
}

// ===== SUB-COMPONENTS =====
interface FilterControlsProps {
  selectedType: string
  selectedPriority: string
  onTypeChange: (type: string) => void
  onPriorityChange: (priority: string) => void
  canCreateAnnouncement: boolean
  onCreateNew: () => void
}

function FilterControls({
  selectedType,
  selectedPriority,
  onTypeChange,
  onPriorityChange,
  canCreateAnnouncement,
  onCreateNew
}: FilterControlsProps) {
  return (
    <div className="flex gap-3">
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
        aria-label="Filter by announcement type"
      >
        <option value="all">All Types</option>
        {Object.entries(ANNOUNCEMENT_TYPES).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      
      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
        aria-label="Filter by priority"
      >
        <option value="all">All Priorities</option>
        {Object.entries(ANNOUNCEMENT_PRIORITIES).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      
      {canCreateAnnouncement && (
        <Button 
          onClick={onCreateNew}
          className="bg-orange-500 hover:bg-orange-600"
          aria-label="Create new announcement"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      )}
    </div>
  )
}

interface SummaryCardsProps {
  totalCount: number
  pinnedCount: number
  urgentCount: number
  thisWeekCount: number
}

function SummaryCards({ totalCount, pinnedCount, urgentCount, thisWeekCount }: SummaryCardsProps) {
  const cards = [
    { title: 'Total', value: totalCount, icon: Bell, color: 'text-blue-600', iconColor: 'text-blue-500' },
    { title: 'Pinned', value: pinnedCount, icon: Pin, color: 'text-orange-600', iconColor: 'text-orange-500' },
    { title: 'Urgent', value: urgentCount, icon: Bell, color: 'text-red-600', iconColor: 'text-red-500' },
    { title: 'This Week', value: thisWeekCount, icon: Calendar, color: 'text-green-600', iconColor: 'text-green-500' }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, color, iconColor }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface AnnouncementCardProps {
  announcement: Announcement
  canEdit: boolean
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
}

function AnnouncementCard({ announcement, canEdit, onViewDetails, onEdit }: AnnouncementCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${announcement.isPinned ? 'ring-2 ring-orange-200' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl" role="img" aria-label={`${announcement.priority} priority`}>
              {AnnouncementUtils.getPriorityIcon(announcement.priority)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                {announcement.isPinned && (
                  <Pin className="h-4 w-4 text-orange-500" aria-label="Pinned announcement" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={AnnouncementUtils.getTypeColor(announcement.type)}>
                  {ANNOUNCEMENT_TYPES[announcement.type]?.label || announcement.type}
                </Badge>
                <Badge className={AnnouncementUtils.getPriorityColor(announcement.priority)}>
                  {ANNOUNCEMENT_PRIORITIES[announcement.priority]?.label || announcement.priority}
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(announcement.id)}
            >
              View Details
            </Button>
            {canEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(announcement.id)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  onResetFilters: () => void
}

function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your filters to see more announcements.</p>
        <Button variant="outline" onClick={onResetFilters}>
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  )
}

// ===== MAIN COMPONENT =====
export function AnnouncementsView() {
  const { user } = useAuth()
  const { announcements, isLoading, error } = useAnnouncementData()
  const {
    selectedType,
    selectedPriority,
    setSelectedType,
    setSelectedPriority,
    resetFilters
  } = useAnnouncementFilters()

  const canCreateAnnouncement = user?.role !== 'student'
  const canEditAnnouncements = user?.role !== 'student'

  const processedAnnouncements = useMemo(() => {
    const filtered = AnnouncementUtils.filterAnnouncements(announcements, selectedType, selectedPriority)
    return AnnouncementUtils.sortAnnouncements(filtered)
  }, [announcements, selectedType, selectedPriority])

  const summaryData = useMemo(() => ({
    totalCount: announcements.length,
    pinnedCount: AnnouncementUtils.getPinnedAnnouncements(announcements).length,
    urgentCount: AnnouncementUtils.getAnnouncementsByPriority(announcements, 'urgent').length,
    thisWeekCount: AnnouncementUtils.getAnnouncementsFromLastWeek(announcements).length
  }), [announcements])

  const handleCreateNew = () => {
    // TODO: Implement create new announcement
    console.log('Create new announcement')
  }

  const handleViewDetails = (id: string) => {
    // TODO: Implement view details
    console.log('View details for announcement:', id)
  }

  const handleEdit = (id: string) => {
    // TODO: Implement edit announcement
    console.log('Edit announcement:', id)
  }

  if (isLoading) {
    return <div className="p-6">Loading announcements...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading announcements: {error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Stay updated with important notices and updates</p>
        </div>
        
        <FilterControls
          selectedType={selectedType}
          selectedPriority={selectedPriority}
          onTypeChange={setSelectedType}
          onPriorityChange={setSelectedPriority}
          canCreateAnnouncement={canCreateAnnouncement}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards {...summaryData} />

      {/* Announcements List */}
      <div className="space-y-4">
        {processedAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            canEdit={canEditAnnouncements}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Empty State */}
      {processedAnnouncements.length === 0 && (
        <EmptyState onResetFilters={resetFilters} />
      )}
    </div>
  )
}
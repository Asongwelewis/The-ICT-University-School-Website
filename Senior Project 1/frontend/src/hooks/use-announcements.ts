import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export interface Announcement {
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

interface UseAnnouncementsReturn {
  announcements: Announcement[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createAnnouncement: (data: Partial<Announcement>) => Promise<void>
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>
  deleteAnnouncement: (id: string) => Promise<void>
}

export function useAnnouncements(): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await apiClient.request('/announcements')
      // setAnnouncements(response.data)
      
      // Mock data for now
      const mockAnnouncements: Announcement[] = [
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
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnnouncements(mockAnnouncements)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements')
    } finally {
      setIsLoading(false)
    }
  }

  const createAnnouncement = async (data: Partial<Announcement>) => {
    try {
      setError(null)
      
      // TODO: Replace with actual API call
      // const response = await apiClient.request('/announcements', {
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // })
      
      // Mock implementation
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: data.title || '',
        content: data.content || '',
        type: data.type || 'general',
        priority: data.priority || 'medium',
        authorName: data.authorName || 'Unknown',
        authorRole: data.authorRole || 'Staff',
        publishedAt: new Date().toISOString().split('T')[0],
        isPinned: data.isPinned || false,
        department: data.department
      }
      
      setAnnouncements(prev => [newAnnouncement, ...prev])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement')
      throw err
    }
  }

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      setError(null)
      
      // TODO: Replace with actual API call
      // const response = await apiClient.request(`/announcements/${id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(data)
      // })
      
      // Mock implementation
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id 
            ? { ...announcement, ...data }
            : announcement
        )
      )
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update announcement')
      throw err
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      setError(null)
      
      // TODO: Replace with actual API call
      // await apiClient.request(`/announcements/${id}`, {
      //   method: 'DELETE'
      // })
      
      // Mock implementation
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement')
      throw err
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  return {
    announcements,
    isLoading,
    error,
    refetch: fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  }
}
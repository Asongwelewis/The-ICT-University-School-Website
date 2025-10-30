'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Video, Link, Eye, Download, Plus, Search } from 'lucide-react'

interface CourseNote {
  id: string
  title: string
  description: string
  courseCode: string
  courseName: string
  chapter?: string
  topic?: string
  type: 'lecture' | 'tutorial' | 'lab' | 'assignment' | 'reference'
  format: 'pdf' | 'doc' | 'ppt' | 'video' | 'link' | 'text'
  authorName: string
  fileName?: string
  fileSize?: number
  externalUrl?: string
  downloadCount: number
  publishedAt: string
}

interface CourseNotesViewProps {
  courseId: string
}

export function CourseNotesView({ courseId }: CourseNotesViewProps) {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock course notes data with external links
  const courseNotes: CourseNote[] = [
    {
      id: '1',
      title: 'Introduction to Programming Concepts',
      description: 'Basic programming concepts including variables, data types, and control structures',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      chapter: 'Chapter 1',
      topic: 'Programming Fundamentals',
      type: 'lecture',
      format: 'pdf',
      authorName: 'Dr. Smith',
      fileName: 'CS101_Chapter1_Programming_Concepts.pdf',
      fileSize: 2048576,
      downloadCount: 45,
      publishedAt: '2024-10-20'
    },
    {
      id: '2',
      title: 'Python Programming Course',
      description: 'Complete Python course on YouTube by Corey Schafer',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      chapter: 'Chapter 2',
      topic: 'Python Basics',
      type: 'tutorial',
      format: 'video',
      authorName: 'Dr. Smith',
      externalUrl: 'https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU',
      downloadCount: 89,
      publishedAt: '2024-10-12'
    },
    {
      id: '3',
      title: 'UI/UX Design Principles',
      description: 'Interactive Figma design tutorial for beginners',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      chapter: 'Chapter 5',
      topic: 'User Interface Design',
      type: 'tutorial',
      format: 'link',
      authorName: 'Dr. Smith',
      externalUrl: 'https://www.figma.com/community/file/928108847914589057',
      downloadCount: 34,
      publishedAt: '2024-10-08'
    },
    {
      id: '4',
      title: 'Netflix Tech Blog - System Design',
      description: 'How Netflix scales their microservices architecture',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      chapter: 'Chapter 6',
      topic: 'System Architecture',
      type: 'reference',
      format: 'link',
      authorName: 'Dr. Smith',
      externalUrl: 'https://netflixtechblog.com/microservices-at-netflix-scale-principles-tradeoffs-lessons-learned-a473d4cc4e7c',
      downloadCount: 56,
      publishedAt: '2024-10-05'
    },
    {
      id: '5',
      title: 'GitHub Repository - Course Examples',
      description: 'All course code examples and projects repository',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      type: 'reference',
      format: 'link',
      authorName: 'Dr. Smith',
      externalUrl: 'https://github.com/example/cs101-examples',
      downloadCount: 78,
      publishedAt: '2024-10-01'
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800'
      case 'tutorial': return 'bg-green-100 text-green-800'
      case 'lab': return 'bg-purple-100 text-purple-800'
      case 'assignment': return 'bg-orange-100 text-orange-800'
      case 'reference': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormatIcon = (format: string, externalUrl?: string) => {
    if (format === 'link' || format === 'video') {
      if (externalUrl) {
        if (externalUrl.includes('youtube.com') || externalUrl.includes('youtu.be')) {
          return <Video className="h-4 w-4 text-red-500" title="YouTube" />
        }
        if (externalUrl.includes('figma.com')) {
          return <Link className="h-4 w-4 text-purple-500" title="Figma" />
        }
        if (externalUrl.includes('netflix')) {
          return <Link className="h-4 w-4 text-red-600" title="Netflix" />
        }
        if (externalUrl.includes('github.com')) {
          return <Link className="h-4 w-4 text-gray-800" title="GitHub" />
        }
        if (externalUrl.includes('developer.mozilla.org')) {
          return <Link className="h-4 w-4 text-orange-500" title="MDN" />
        }
      }
      return format === 'video' 
        ? <Video className="h-4 w-4 text-purple-500" />
        : <Link className="h-4 w-4 text-green-500" />
    }
    
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />
      case 'doc': return <FileText className="h-4 w-4 text-blue-500" />
      case 'ppt': return <FileText className="h-4 w-4 text-orange-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getPlatformName = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
    if (url.includes('figma.com')) return 'Figma'
    if (url.includes('netflix')) return 'Netflix'
    if (url.includes('github.com')) return 'GitHub'
    if (url.includes('developer.mozilla.org')) return 'MDN'
    if (url.includes('stackoverflow.com')) return 'Stack Overflow'
    if (url.includes('medium.com')) return 'Medium'
    if (url.includes('dev.to')) return 'Dev.to'
    return 'External Link'
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredNotes = courseNotes.filter(note => {
    const typeMatch = selectedType === 'all' || note.type === selectedType
    const formatMatch = selectedFormat === 'all' || note.format === selectedFormat
    const searchMatch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return typeMatch && formatMatch && searchMatch
  })

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const key = note.chapter || note.topic || 'General'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(note)
    return acc
  }, {} as Record<string, CourseNote[]>)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Notes</h1>
          <p className="text-gray-600">
            {courseNotes[0]?.courseCode} - {courseNotes[0]?.courseName}
          </p>
        </div>
        
        <div className="flex gap-3">
          {user?.role !== 'student' && (
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Upload Note
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Types</option>
          <option value="lecture">Lectures</option>
          <option value="tutorial">Tutorials</option>
          <option value="lab">Lab Exercises</option>
          <option value="assignment">Assignments</option>
          <option value="reference">References</option>
        </select>
        
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Formats</option>
          <option value="pdf">PDF</option>
          <option value="doc">Document</option>
          <option value="ppt">Presentation</option>
          <option value="video">Video</option>
          <option value="link">Link</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{courseNotes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {courseNotes.filter(n => n.format === 'video').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Links</CardTitle>
            <Link className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {courseNotes.filter(n => n.format === 'link').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {courseNotes.reduce((sum, note) => sum + note.downloadCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Notes */}
      <div className="space-y-6">
        {Object.entries(groupedNotes).map(([group, notes]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-lg">{group}</CardTitle>
              <CardDescription>{notes.length} notes available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getFormatIcon(note.format, note.externalUrl)}
                          <Badge className={getTypeColor(note.type)}>
                            {note.type}
                          </Badge>
                          {note.externalUrl && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {getPlatformName(note.externalUrl)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{note.publishedAt}</span>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-2">{note.title}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {note.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div>By: {note.authorName}</div>
                        {note.fileSize && (
                          <div>Size: {formatFileSize(note.fileSize)}</div>
                        )}
                        {note.externalUrl && (
                          <div className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            <span>External: {getPlatformName(note.externalUrl)}</span>
                          </div>
                        )}
                        <div>Views: {note.downloadCount}</div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        {note.format === 'link' || note.format === 'video' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => note.externalUrl && handleExternalLink(note.externalUrl)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {note.externalUrl?.includes('youtube') ? 'Watch' : 
                             note.externalUrl?.includes('figma') ? 'Open Design' :
                             note.externalUrl?.includes('github') ? 'View Code' : 'View'}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                        
                        {user?.role !== 'student' && (
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find notes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
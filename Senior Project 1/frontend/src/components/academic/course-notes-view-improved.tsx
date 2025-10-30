'use client'

import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCourseNotes } from '@/hooks/use-course-notes'
import { useNotesFilter } from '@/hooks/use-notes-filter'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Plus, 
  Search, 
  Video, 
  Link, 
  Eye, 
  Download 
} from 'lucide-react'
import { NotesErrorBoundary } from './components/notes-error-boundary'
import { NoteCard } from './components/note-card'
import { CourseNote, NoteType, NoteFormat } from '@/types/academic'

// ===== CONSTANTS AND CONFIGURATION =====
const NOTE_TYPE_COLORS = {
  lecture: 'bg-blue-100 text-blue-800',
  tutorial: 'bg-green-100 text-green-800',
  lab: 'bg-purple-100 text-purple-800',
  assignment: 'bg-orange-100 text-orange-800',
  reference: 'bg-gray-100 text-gray-800',
} as const

const PLATFORM_PATTERNS = {
  youtube: ['youtube.com', 'youtu.be'],
  figma: ['figma.com'],
  netflix: ['netflix'],
  github: ['github.com'],
  mdn: ['developer.mozilla.org'],
  stackoverflow: ['stackoverflow.com'],
  medium: ['medium.com'],
  devto: ['dev.to'],
} as const

const PLATFORM_NAMES = {
  youtube: 'YouTube',
  figma: 'Figma',
  netflix: 'Netflix',
  github: 'GitHub',
  mdn: 'MDN',
  stackoverflow: 'Stack Overflow',
  medium: 'Medium',
  devto: 'Dev.to',
} as const

const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'] as const

const FILTER_OPTIONS = {
  types: [
    { value: 'all', label: 'All Types' },
    { value: 'lecture', label: 'Lectures' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'lab', label: 'Lab Exercises' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'reference', label: 'References' },
  ],
  formats: [
    { value: 'all', label: 'All Formats' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Document' },
    { value: 'ppt', label: 'Presentation' },
    { value: 'video', label: 'Video' },
    { value: 'link', label: 'Link' },
  ],
} as const

// ===== UTILITY FUNCTIONS =====
const getTypeColor = (type: NoteType): string => {
  return NOTE_TYPE_COLORS[type] || NOTE_TYPE_COLORS.reference
}

const detectPlatform = (url: string): keyof typeof PLATFORM_NAMES | null => {
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    if (patterns.some(pattern => url.includes(pattern))) {
      return platform as keyof typeof PLATFORM_NAMES
    }
  }
  return null
}

const getPlatformName = (url: string): string => {
  const platform = detectPlatform(url)
  return platform ? PLATFORM_NAMES[platform] : 'External Link'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${FILE_SIZE_UNITS[i]}`
}

const handleExternalLink = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const getFormatIcon = (format: NoteFormat, externalUrl?: string) => {
  if (format === 'link' || format === 'video') {
    if (externalUrl) {
      const platform = detectPlatform(externalUrl)
      switch (platform) {
        case 'youtube':
          return <Video className="h-4 w-4 text-red-500" title="YouTube" />
        case 'figma':
          return <Link className="h-4 w-4 text-purple-500" title="Figma" />
        case 'netflix':
          return <Link className="h-4 w-4 text-red-600" title="Netflix" />
        case 'github':
          return <Link className="h-4 w-4 text-gray-800" title="GitHub" />
        case 'mdn':
          return <Link className="h-4 w-4 text-orange-500" title="MDN" />
        default:
          return format === 'video' 
            ? <Video className="h-4 w-4 text-purple-500" />
            : <Link className="h-4 w-4 text-green-500" />
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

// ===== MOCK DATA (should be moved to a separate file or fetched from API) =====
const getMockCourseNotes = (): CourseNote[] => [
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
    fileSize: 2048576, // 2MB in bytes
    downloadCount: 45,
    publishedAt: '2024-10-20'
  },
  {
    id: '2',
    title: 'Data Structures Overview',
    description: 'Introduction to arrays, linked lists, stacks, and queues',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    chapter: 'Chapter 3',
    topic: 'Data Structures',
    type: 'lecture',
    format: 'ppt',
    authorName: 'Dr. Smith',
    fileName: 'CS101_Chapter3_Data_Structures.pptx',
    fileSize: 5242880, // 5MB in bytes
    downloadCount: 38,
    publishedAt: '2024-10-22'
  },
  {
    id: '3',
    title: 'Programming Tutorial Video',
    description: 'Step-by-step tutorial on writing your first program',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    chapter: 'Chapter 1',
    topic: 'Getting Started',
    type: 'tutorial',
    format: 'video',
    authorName: 'Dr. Smith',
    externalUrl: 'https://youtube.com/watch?v=example',
    downloadCount: 67,
    publishedAt: '2024-10-18'
  },
  // ... other mock data items
]

// ===== COMPONENT INTERFACES =====
interface CourseNotesViewProps {
  courseId: string
}

interface FilterState {
  type: NoteType | 'all'
  format: NoteFormat | 'all'
  searchTerm: string
}

interface NotesStats {
  total: number
  lectures: number
  videos: number
  totalDownloads: number
}

// ===== CUSTOM HOOKS =====
const useNotesFiltering = (notes: CourseNote[], filters: FilterState) => {
  return useMemo(() => {
    return notes.filter(note => {
      const typeMatch = filters.type === 'all' || note.type === filters.type
      const formatMatch = filters.format === 'all' || note.format === filters.format
      const searchMatch = filters.searchTerm === '' || 
        note.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.topic?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        note.chapter?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
      return typeMatch && formatMatch && searchMatch
    })
  }, [notes, filters])
}

const useNotesGrouping = (notes: CourseNote[]) => {
  return useMemo(() => {
    return notes.reduce((acc, note) => {
      const key = note.chapter || note.topic || 'General'
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(note)
      return acc
    }, {} as Record<string, CourseNote[]>)
  }, [notes])
}

const useNotesStats = (notes: CourseNote[]): NotesStats => {
  return useMemo(() => ({
    total: notes.length,
    lectures: notes.filter(n => n.type === 'lecture').length,
    videos: notes.filter(n => n.format === 'video').length,
    totalDownloads: notes.reduce((sum, note) => sum + note.downloadCount, 0),
  }), [notes])
}

// ===== SUB-COMPONENTS =====
interface SearchAndFiltersProps {
  searchTerm: string
  selectedType: NoteType | 'all'
  selectedFormat: NoteFormat | 'all'
  onSearchChange: (value: string) => void
  onTypeChange: (value: NoteType | 'all') => void
  onFormatChange: (value: NoteFormat | 'all') => void
}

const SearchAndFilters = ({
  searchTerm,
  selectedType,
  selectedFormat,
  onSearchChange,
  onTypeChange,
  onFormatChange,
}: SearchAndFiltersProps) => (
  <div className="flex gap-4 items-center">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
    
    <Select value={selectedType} onValueChange={onTypeChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.types.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    
    <Select value={selectedFormat} onValueChange={onFormatChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.formats.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

interface SummaryCardsProps {
  stats: NotesStats
}

const SummaryCards = ({ stats }: SummaryCardsProps) => (
  <div className="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
        <FileText className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Lectures</CardTitle>
        <FileText className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{stats.lectures}</div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Videos</CardTitle>
        <Video className="h-4 w-4 text-purple-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-600">{stats.videos}</div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Downloads</CardTitle>
        <Download className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">{stats.totalDownloads}</div>
      </CardContent>
    </Card>
  </div>
)

interface NoteCardImprovedProps {
  note: CourseNote
  userRole?: string
}

const NoteCardImproved = ({ note, userRole }: NoteCardImprovedProps) => {
  const handleAction = useCallback(() => {
    if (note.externalUrl) {
      handleExternalLink(note.externalUrl)
    }
    // TODO: Handle file download
  }, [note.externalUrl])

  const getActionLabel = () => {
    if (!note.externalUrl) return 'Download'
    
    const platform = detectPlatform(note.externalUrl)
    switch (platform) {
      case 'youtube': return 'Watch'
      case 'figma': return 'Open Design'
      case 'github': return 'View Code'
      default: return 'View'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
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
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleAction}
          >
            {note.format === 'link' || note.format === 'video' ? (
              <Eye className="
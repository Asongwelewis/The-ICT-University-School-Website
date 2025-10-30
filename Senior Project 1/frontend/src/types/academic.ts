// Enhanced type definitions with better type safety

export type NoteType = 'lecture' | 'tutorial' | 'lab' | 'assignment' | 'reference'
export type NoteFormat = 'pdf' | 'doc' | 'ppt' | 'video' | 'link' | 'text'
export type UserRole = 'student' | 'instructor' | 'admin'

export interface CourseNote {
  readonly id: string
  title: string
  description: string
  courseCode: string
  courseName: string
  chapter?: string
  topic?: string
  type: NoteType
  format: NoteFormat
  authorName: string
  fileName?: string
  fileSize?: number
  externalUrl?: string
  downloadCount: number
  publishedAt: string
  createdAt?: string
  updatedAt?: string
}

export interface CourseNotesFilter {
  type: NoteType | 'all'
  format: NoteFormat | 'all'
  searchTerm: string
}

export interface GroupedNotes {
  [key: string]: CourseNote[]
}

export interface NotesSummary {
  total: number
  byType: Record<NoteType, number>
  byFormat: Record<NoteFormat, number>
  totalDownloads: number
}

// API Response types
export interface CourseNotesResponse {
  notes: CourseNote[]
  summary: NotesSummary
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface CreateNoteRequest {
  title: string
  description: string
  courseId: string
  chapter?: string
  topic?: string
  type: NoteType
  format: NoteFormat
  file?: File
  externalUrl?: string
}

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {
  id: string
}
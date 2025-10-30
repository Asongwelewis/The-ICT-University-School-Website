import { useState, useMemo } from 'react'
import { CourseNote } from '@/types/academic'

export interface NotesFilter {
  type: string
  format: string
  searchTerm: string
}

export interface UseNotesFilterReturn {
  filters: NotesFilter
  filteredNotes: CourseNote[]
  updateFilter: (key: keyof NotesFilter, value: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

const DEFAULT_FILTERS: NotesFilter = {
  type: 'all',
  format: 'all',
  searchTerm: ''
}

export function useNotesFilter(notes: CourseNote[]): UseNotesFilterReturn {
  const [filters, setFilters] = useState<NotesFilter>(DEFAULT_FILTERS)

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const typeMatch = filters.type === 'all' || note.type === filters.type
      const formatMatch = filters.format === 'all' || note.format === filters.format
      const searchMatch = filters.searchTerm === '' || 
        [note.title, note.description, note.topic, note.chapter]
          .filter(Boolean)
          .some(field => field!.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      
      return typeMatch && formatMatch && searchMatch
    })
  }, [notes, filters])

  const updateFilter = (key: keyof NotesFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => 
      value !== DEFAULT_FILTERS[key as keyof NotesFilter]
    )
  }, [filters])

  return {
    filters,
    filteredNotes,
    updateFilter,
    clearFilters,
    hasActiveFilters
  }
}
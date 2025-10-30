'use client'

import { memo, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { CourseNote, GroupedNotes } from '@/types/academic'
import { NoteCard } from './note-card'

interface VirtualizedNotesListProps {
  groupedNotes: GroupedNotes
  onNoteAction?: (action: string, note: CourseNote) => void
}

// Memoized component to prevent unnecessary re-renders
export const VirtualizedNotesList = memo(function VirtualizedNotesList({
  groupedNotes,
  onNoteAction
}: VirtualizedNotesListProps) {
  // Flatten grouped notes for virtualization
  const flattenedNotes = useMemo(() => {
    const items: Array<{ type: 'group' | 'note'; data: any }> = []
    
    Object.entries(groupedNotes).forEach(([group, notes]) => {
      items.push({ type: 'group', data: { title: group, count: notes.length } })
      notes.forEach(note => {
        items.push({ type: 'note', data: note })
      })
    })
    
    return items
  }, [groupedNotes])

  const renderItem = ({ index, style }: { index: number; style: any }) => {
    const item = flattenedNotes[index]
    
    return (
      <div style={style}>
        {item.type === 'group' ? (
          <GroupHeader title={item.data.title} count={item.data.count} />
        ) : (
          <NoteCard note={item.data} onAction={onNoteAction} />
        )}
      </div>
    )
  }

  if (flattenedNotes.length === 0) {
    return <EmptyState />
  }

  return (
    <List
      height={600} // Adjust based on your needs
      itemCount={flattenedNotes.length}
      itemSize={200} // Approximate height of each item
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {renderItem}
    </List>
  )
})

const GroupHeader = memo(function GroupHeader({ 
  title, 
  count 
}: { 
  title: string
  count: number 
}) {
  return (
    <div className="bg-gray-50 p-4 border-b">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{count} notes available</p>
    </div>
  )
})

const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No notes found</p>
    </div>
  )
})
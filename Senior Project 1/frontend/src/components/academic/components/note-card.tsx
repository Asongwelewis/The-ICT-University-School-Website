'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CourseNote } from '@/types/academic'
import { getFormatIcon, getPlatformName, getTypeColor, formatFileSize } from '@/lib/note-utils'
import { createNoteActionStrategy } from '@/lib/note-actions'
import { useAuth } from '@/hooks/useAuth'

interface NoteCardProps {
  note: CourseNote
  onAction?: (action: string, note: CourseNote) => void
}

export function NoteCard({ note, onAction }: NoteCardProps) {
  const { user } = useAuth()
  const actionStrategy = createNoteActionStrategy()
  const actions = actionStrategy.getActions(note, user?.role)

  const handleAction = (actionLabel: string) => {
    const action = actions.find(a => a.label === actionLabel)
    if (action) {
      action.execute(note)
      onAction?.(actionLabel, note)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <NoteCardHeader note={note} />
        <NoteCardContent note={note} />
        <NoteCardMetadata note={note} />
        <NoteCardActions 
          actions={actions}
          onAction={handleAction}
          canEdit={user?.role !== 'student'}
        />
      </CardContent>
    </Card>
  )
}

function NoteCardHeader({ note }: { note: CourseNote }) {
  return (
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
  )
}

function NoteCardContent({ note }: { note: CourseNote }) {
  return (
    <>
      <h4 className="font-medium text-sm mb-2">{note.title}</h4>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {note.description}
      </p>
    </>
  )
}

function NoteCardMetadata({ note }: { note: CourseNote }) {
  return (
    <div className="space-y-2 text-xs text-gray-500">
      <div>By: {note.authorName}</div>
      {note.fileSize && (
        <div>Size: {formatFileSize(note.fileSize)}</div>
      )}
      <div>Downloads: {note.downloadCount}</div>
    </div>
  )
}

function NoteCardActions({ 
  actions, 
  onAction, 
  canEdit 
}: { 
  actions: any[]
  onAction: (label: string) => void
  canEdit: boolean 
}) {
  return (
    <div className="flex gap-2 mt-4">
      {actions.map((action) => (
        <Button 
          key={action.label}
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={() => onAction(action.label)}
        >
          <action.icon className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      ))}
      
      {canEdit && (
        <Button size="sm" variant="outline">
          Edit
        </Button>
      )}
    </div>
  )
}
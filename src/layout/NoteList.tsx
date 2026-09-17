import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mic, Image as ImageIcon, NotebookText } from 'lucide-react'
import type { Note } from '../db/types'
import { groupByDay } from '../utils/filter'
import { formatDayHeader, formatRelativeDate } from '../utils/format'

interface NoteListProps {
  notes: Note[]
  selectedId: string | null
}

const TYPE_ICONS = {
  text: NotebookText,
  voice: Mic,
  picture: ImageIcon,
}

export function NoteList({ notes, selectedId }: NoteListProps) {
  const { t, i18n } = useTranslation()

  const grouped = groupByDay(notes)

  const dayLabels = {
    today: t('common.today'),
    yesterday: t('common.yesterday'),
  }

  if (notes.length === 0) {
    return (
      <div className="note-list note-list-empty" data-testid="note-list-empty">
        <p>{t('note.empty')}</p>
      </div>
    )
  }

  return (
    <div className="note-list" data-testid="note-list">
      {grouped.map(({ day, notes: dayNotes }) => (
        <div key={day}>
          <div className="note-day-header" data-testid="note-day-header">
            {formatDayHeader(day, i18n.language, dayLabels)}
          </div>
          {dayNotes.map((note) => {
            const Icon = TYPE_ICONS[note.type]
            return (
              <Link
                to={`/note/${note.id}`}
                key={note.id}
                className={`note-item ${note.id === selectedId ? 'note-item-active' : ''}`}
                data-testid={`note-item-${note.id}`}
              >
                <div className="note-item-icon">
                  <Icon size={16} />
                </div>
                <div className="note-item-main">
                  <div className="note-item-title">
                    {note.title.trim() || <em>{t('note.new')}</em>}
                  </div>
                  {note.type === 'text' && note.content && (
                    <div className="note-item-snippet">{note.content.replace(/[#*`>_-]/g, '').slice(0, 80)}</div>
                  )}
                  <div className="note-item-meta">
                    <span>{formatRelativeDate(note.updatedAt, i18n.language)}</span>
                    {note.tags.length > 0 && (
                      <span className="note-item-tags">{note.tags.slice(0, 3).join(', ')}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
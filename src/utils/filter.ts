import type { Note } from '../db/types'
import { startOfDay } from './format'

export interface NoteFilter {
  fileId?: string
  tag?: string
  query?: string
}

export function filterNotes(notes: Note[], filter: NoteFilter): Note[] {
  const query = filter.query?.trim().toLowerCase() ?? ''
  return notes.filter((note) => {
    if (filter.fileId) {
      if (filter.fileId === 'ungrouped' && note.fileId !== null) return false
      if (filter.fileId !== 'ungrouped' && note.fileId !== filter.fileId) return false
    }
    if (filter.tag) {
      if (!note.tags.includes(filter.tag)) return false
    }
    if (query) {
      const haystack = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
}

export function groupByDay(notes: Note[]): { day: number; notes: Note[] }[] {
  const days: { day: number; notes: Note[] }[] = []
  for (const note of notes) {
    const day = startOfDay(note.updatedAt)
    const last = days[days.length - 1]
    if (last && last.day === day) {
      last.notes.push(note)
    } else {
      days.push({ day, notes: [note] })
    }
  }
  return days
}
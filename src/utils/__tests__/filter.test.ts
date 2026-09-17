import { describe, expect, it } from 'vitest'
import type { Note } from '../../db/types'
import { filterNotes, groupByDay } from '../filter'
import { formatDayHeader, startOfDay } from '../format'

const day = 24 * 60 * 60 * 1000
const today = startOfDay(Date.now())

function note(partial: Partial<Note> & { id: string }): Note {
  return {
    type: 'text',
    title: '',
    content: '',
    createdAt: today,
    updatedAt: today,
    tags: [],
    fileId: null,
    blobId: null,
    ...partial,
  }
}

describe('filterNotes', () => {
  const notes = [
    note({ id: 'a', title: 'Grocery', content: 'buy milk', tags: ['home'] }),
    note({ id: 'b', title: 'Book', content: 'read more', tags: ['reading'] }),
    note({ id: 'c', title: 'Work', content: 'notes', fileId: 'f1' }),
    note({ id: 'd', title: 'Untagged', content: 'stuff' }),
  ]

  it('returns all notes with no filters', () => {
    expect(filterNotes(notes, {}).map((n) => n.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('filters by file id', () => {
    expect(filterNotes(notes, { fileId: 'f1' }).map((n) => n.id)).toEqual(['c'])
  })

  it('filters by ungrouped file id', () => {
    expect(filterNotes(notes, { fileId: 'ungrouped' }).map((n) => n.id)).toEqual(['a', 'b', 'd'])
  })

  it('filters by tag', () => {
    expect(filterNotes(notes, { tag: 'reading' }).map((n) => n.id)).toEqual(['b'])
  })

  it('matches query across title, content and tags (case-insensitive)', () => {
    expect(filterNotes(notes, { query: 'milk' }).map((n) => n.id)).toEqual(['a'])
    expect(filterNotes(notes, { query: 'READING' }).map((n) => n.id)).toEqual(['b'])
    expect(filterNotes(notes, { query: 'read' }).map((n) => n.id)).toEqual(['b'])
  })

  it('combines file and query filters', () => {
    expect(filterNotes(notes, { fileId: 'ungrouped', query: 'book' }).map((n) => n.id)).toEqual(['b'])
  })
})

describe('groupByDay', () => {
  it('groups notes by the day of their updatedAt', () => {
    const yesterday = today - day
    const notes = [
      note({ id: 'a', updatedAt: today }),
      note({ id: 'b', updatedAt: today + 1000 }),
      note({ id: 'c', updatedAt: yesterday }),
    ]
    const groups = groupByDay(notes)
    expect(groups).toHaveLength(2)
    expect(groups[0].day).toBe(today)
    expect(groups[0].notes.map((n) => n.id)).toEqual(['a', 'b'])
    expect(groups[1].day).toBe(yesterday)
  })
})

describe('formatDayHeader', () => {
  const labels = { today: 'Today', yesterday: 'Yesterday' }

  it('labels today and yesterday', () => {
    expect(formatDayHeader(today, 'en', labels)).toBe('Today')
    expect(formatDayHeader(today - day, 'en', labels)).toBe('Yesterday')
  })

  it('formats older days as a full date', () => {
    const older = new Date(2025, 5, 15).getTime()
    expect(formatDayHeader(older, 'en', labels)).toBe('Sunday, June 15, 2025')
  })
})
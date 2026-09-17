import { describe, expect, it } from 'vitest'
import type { Note, StoredBlob } from '../types'
import {
  notesOverTime,
  storageUsage,
  topTags,
  typeBreakdown,
  weeklyHeatmap,
} from '../analytics'

const day = 24 * 60 * 60 * 1000
const base = new Date(2026, 0, 5).getTime() // local midnight, Monday Jan 5 2026

function note(partial: Partial<Note> & { type: Note['type']; createdAt: number }): Note {
  return {
    id: 'id',
    title: 't',
    content: '',
    updatedAt: partial.createdAt,
    tags: [],
    fileId: null,
    blobId: null,
    ...partial,
  }
}

describe('analytics', () => {
  it('typeBreakdown counts notes per type', () => {
    const notes = [
      note({ type: 'text', createdAt: base }),
      note({ type: 'text', createdAt: base }),
      note({ type: 'voice', createdAt: base }),
      note({ type: 'picture', createdAt: base }),
    ]
    const result = typeBreakdown(notes)
    expect(result).toEqual([
      { type: 'text', count: 2 },
      { type: 'voice', count: 1 },
      { type: 'picture', count: 1 },
    ])
  })

  it('typeBreakdown omits empty types', () => {
    const result = typeBreakdown([note({ type: 'voice', createdAt: base })])
    expect(result.map((r) => r.type)).toEqual(['voice'])
  })

  it('notesOverTime buckets by day', () => {
    const notes = [
      note({ type: 'text', createdAt: base }),
      note({ type: 'text', createdAt: base + day }),
      note({ type: 'text', createdAt: base + day }),
    ]
    const result = notesOverTime(notes, 'day')
    expect(result).toEqual([
      { bucket: base, count: 1 },
      { bucket: base + day, count: 2 },
    ])
  })

  it('topTags ranks tags by frequency', () => {
    const notes = [
      note({ type: 'text', createdAt: base, tags: ['work', 'urgent'] }),
      note({ type: 'text', createdAt: base, tags: ['work'] }),
      note({ type: 'text', createdAt: base, tags: ['home'] }),
    ]
    expect(topTags(notes, 10)).toEqual([
      { tag: 'work', count: 2 },
      { tag: 'home', count: 1 },
      { tag: 'urgent', count: 1 },
    ])
  })

  it('topTags respects the limit', () => {
    const notes = [
      note({ type: 'text', createdAt: base, tags: ['a'] }),
      note({ type: 'text', createdAt: base, tags: ['b'] }),
      note({ type: 'text', createdAt: base, tags: ['c'] }),
    ]
    expect(topTags(notes, 2)).toHaveLength(2)
  })

  it('weeklyHeatmap counts notes per ISO week', () => {
    const notes = [
      note({ type: 'text', createdAt: base }),
      note({ type: 'text', createdAt: base + 7 * day }),
      note({ type: 'text', createdAt: base + 7 * day }),
    ]
    const result = weeklyHeatmap(notes)
    expect(result).toEqual([
      { bucket: base, count: 1 },
      { bucket: base + 7 * day, count: 2 },
    ])
  })

  it('storageUsage sums bytes per type from blobs', () => {
    const notes = [
      note({ type: 'voice', createdAt: base, blobId: 'b1' }),
      note({ type: 'picture', createdAt: base, blobId: 'b2' }),
      note({ type: 'picture', createdAt: base, blobId: 'b3' }),
      note({ type: 'text', createdAt: base }),
    ]
    const blobs: StoredBlob[] = [
      { id: 'b1', noteId: 'n1', mimeType: 'audio/webm', data: new ArrayBuffer(100) },
      { id: 'b2', noteId: 'n2', mimeType: 'image/png', data: new ArrayBuffer(250) },
      { id: 'b3', noteId: 'n3', mimeType: 'image/png', data: new ArrayBuffer(150) },
    ]
    const result = storageUsage(notes, blobs)
    expect(result).toEqual([
      { type: 'text', bytes: 0 },
      { type: 'voice', bytes: 100 },
      { type: 'picture', bytes: 400 },
    ])
  })
})
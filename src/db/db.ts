import Dexie, { type Table } from 'dexie'
import type { File, Note, StoredBlob } from './types'

export class NoteDb extends Dexie {
  notes!: Table<Note, string>
  files!: Table<File, string>
  blobs!: Table<StoredBlob, string>

  constructor(name = 'reminder-db') {
    super(name)
    this.version(1).stores({
      notes: '&id, type, createdAt, updatedAt, fileId, *tags, title',
      files: '&id, name, createdAt',
      blobs: '&id, noteId',
    })
  }
}

export const db = new NoteDb()

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
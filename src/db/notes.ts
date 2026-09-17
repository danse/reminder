import { db, newId } from './db'
import type { Note, NewNote, NoteType, StoredBlob } from './types'

export type NotePatch = Partial<
  Pick<Note, 'title' | 'content' | 'tags' | 'fileId' | 'updatedAt'>
>

function now(): number {
  return Date.now()
}

async function createNoteInternal(
  data: NewNote,
  blob?: { mimeType: string; data: ArrayBuffer },
): Promise<Note> {
  const id = newId()
  const ts = now()
  const note: Note = {
    id,
    type: data.type,
    title: data.title,
    content: data.content,
    createdAt: ts,
    updatedAt: ts,
    tags: data.tags ?? [],
    fileId: data.fileId ?? null,
    blobId: null,
  }

  await db.transaction('rw', db.notes, db.blobs, async () => {
    if (blob) {
      const blobId = newId()
      const stored: StoredBlob = {
        id: blobId,
        noteId: id,
        mimeType: blob.mimeType,
        data: blob.data,
      }
      await db.blobs.add(stored)
      note.blobId = blobId
    }
    await db.notes.add(note)
  })

  return note
}

export async function createNote(
  data: NewNote,
  blob?: { mimeType: string; data: ArrayBuffer },
): Promise<Note> {
  return createNoteInternal(data, blob)
}

export function createTextNote(data: {
  title: string
  content: string
  tags?: string[]
  fileId?: string | null
}): Promise<Note> {
  return createNoteInternal({ ...data, type: 'text' })
}

export async function createVoiceNote(data: {
  title: string
  blob: Blob
  tags?: string[]
  fileId?: string | null
}): Promise<Note> {
  return createNoteInternal(
    { type: 'voice', title: data.title, content: '', tags: data.tags, fileId: data.fileId },
    { mimeType: data.blob.type || 'audio/webm', data: await data.blob.arrayBuffer() },
  )
}

export async function createPictureNote(data: {
  title: string
  blob: Blob
  tags?: string[]
  fileId?: string | null
}): Promise<Note> {
  return createNoteInternal(
    { type: 'picture', title: data.title, content: '', tags: data.tags, fileId: data.fileId },
    { mimeType: data.blob.type || 'image/*', data: await data.blob.arrayBuffer() },
  )
}

export async function getNote(id: string): Promise<Note | undefined> {
  return db.notes.get(id)
}

export async function getBlob(blobId: string): Promise<StoredBlob | undefined> {
  return db.blobs.get(blobId)
}

/** Rebuilds a playable/displayable Blob from a stored payload. */
export function storedToBlob(stored: StoredBlob): Blob {
  return new Blob([stored.data], { type: stored.mimeType })
}

export async function updateNote(
  id: string,
  patch: NotePatch,
): Promise<Note | undefined> {
  const existing = await db.notes.get(id)
  if (!existing) return undefined

  const updated: Note = { ...existing, ...patch, updatedAt: now() }
  await db.notes.put(updated)
  return updated
}

export async function listNotes(): Promise<Note[]> {
  return db.notes.orderBy('updatedAt').reverse().toArray()
}

export async function searchNotes(query: string): Promise<Note[]> {
  const q = query.trim().toLowerCase()
  if (!q) return listNotes()

  const all = await db.notes.toArray()
  return all
    .filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteNote(id: string): Promise<void> {
  await db.transaction('rw', db.notes, db.blobs, async () => {
    const note = await db.notes.get(id)
    if (!note) return
    if (note.blobId) {
      await db.blobs.delete(note.blobId)
    }
    await db.notes.delete(id)
  })
}

/** Tag merging helper: renames a tag across all notes, dropping the source tag. */
export async function mergeTag(from: string, into: string): Promise<void> {
  const notes = await db.notes.filter((n) => n.tags.includes(from)).toArray()
  await db.transaction('rw', db.notes, async () => {
    for (const note of notes) {
      const next = note.tags
        .filter((t) => t !== from)
        .concat(from !== into ? [into] : [])
      const unique = [...new Set(next)]
      await db.notes.put({ ...note, tags: unique, updatedAt: now() })
    }
  })
}

export async function deleteTag(tag: string): Promise<void> {
  const notes = await db.notes.filter((n) => n.tags.includes(tag)).toArray()
  await db.transaction('rw', db.notes, async () => {
    for (const note of notes) {
      await db.notes.put({ ...note, tags: note.tags.filter((t) => t !== tag) })
    }
  })
}

export async function allTags(): Promise<string[]> {
  const all = await db.notes.toArray()
  return [...new Set(all.flatMap((n) => n.tags))].sort((a, b) => a.localeCompare(b))
}

export type { NoteType }
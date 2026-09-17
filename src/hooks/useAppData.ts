import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function useNotes() {
  return useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [])
}

export function useFiles() {
  return useLiveQuery(() => db.files.orderBy('createdAt').toArray(), [])
}

export function useTags() {
  return useLiveQuery(
    () =>
      db.notes
        .toArray()
        .then((notes) => [...new Set(notes.flatMap((n) => n.tags))].sort((a, b) => a.localeCompare(b))),
    [],
  )
}

export function useBlob(noteId: string | null | undefined) {
  return useLiveQuery(
    () => {
      if (!noteId) return undefined
      return db.notes.get(noteId).then(async (note) => {
        if (!note?.blobId) return undefined
        const blob = await db.blobs.get(note.blobId)
        return blob ? { mimeType: blob.mimeType, data: blob.data } : undefined
      })
    },
    [noteId],
  )
}

export function useBlobs() {
  return useLiveQuery(() => db.blobs.toArray(), []) ?? []
}

export function useAppData() {
  return {
    notes: useNotes() ?? [],
    files: useFiles() ?? [],
    tags: useTags() ?? [],
  }
}

export interface BlobData {
  mimeType: string
  data: ArrayBuffer
}

export function blobToObjectUrl(blob: BlobData): string {
  return URL.createObjectURL(new Blob([blob.data], { type: blob.mimeType }))
}
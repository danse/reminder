import { db, newId } from './db'
import type { File } from './types'

export async function createFile(data: {
  name: string
  color: string
}): Promise<File> {
  const file: File = {
    id: newId(),
    name: data.name,
    color: data.color,
    createdAt: Date.now(),
  }
  await db.files.add(file)
  return file
}

export async function listFiles(): Promise<File[]> {
  return db.files.orderBy('createdAt').toArray()
}

export async function getFile(id: string): Promise<File | undefined> {
  return db.files.get(id)
}

export async function renameFile(
  id: string,
  name: string,
): Promise<File | undefined> {
  const existing = await db.files.get(id)
  if (!existing) return undefined
  const updated: File = { ...existing, name }
  await db.files.put(updated)
  return updated
}

export async function deleteFile(id: string): Promise<void> {
  await db.transaction('rw', db.files, db.notes, async () => {
    const existing = await db.files.get(id)
    if (!existing) return

    const notes = await db.notes.filter((n) => n.fileId === id).toArray()
    for (const note of notes) {
      await db.notes.put({ ...note, fileId: null })
    }
    await db.files.delete(id)
  })
}
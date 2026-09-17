import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import { createFile, deleteFile, getFile, listFiles, renameFile } from '../files'
import { createTextNote, updateNote } from '../notes'

describe('files repository', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterEach(() => {
    db.close()
  })

  it('creates and lists files', async () => {
    const file = await createFile({ name: 'Work', color: '#e11d48' })
    const all = await listFiles()

    expect(all).toHaveLength(1)
    expect(all[0]).toMatchObject({ id: file.id, name: 'Work', color: '#e11d48' })
    expect(all[0].createdAt).toBeGreaterThan(0)
  })

  it('renames a file', async () => {
    const file = await createFile({ name: 'Work', color: '#e11d48' })
    const renamed = await renameFile(file.id, 'Personal')

    expect(renamed!.name).toBe('Personal')
    expect((await getFile(file.id))!.name).toBe('Personal')
  })

  it('returns undefined renaming a missing file', async () => {
    expect(await renameFile('nope', 'X')).toBeUndefined()
  })

  it('deleting a file unassigns its notes', async () => {
    const file = await createFile({ name: 'Work', color: '#e11d48' })
    const note = await createTextNote({ title: 'A', content: '', fileId: file.id })

    await deleteFile(file.id)

    expect(await getFile(file.id)).toBeUndefined()
    const after = (await db.notes.get(note.id))!
    expect(after.fileId).toBeNull()
  })

  it('does not error deleting a missing file', async () => {
    await expect(deleteFile('nope')).resolves.toBeUndefined()
  })

  it('does not unassign notes of other files', async () => {
    const a = await createFile({ name: 'A', color: '#111' })
    const b = await createFile({ name: 'B', color: '#222' })
    const note = await createTextNote({ title: 'A', content: '', fileId: a.id })

    await deleteFile(b.id)

    expect((await db.notes.get(note.id))!.fileId).toBe(a.id)
  })

  it('notes can be reassigned between files', async () => {
    const a = await createFile({ name: 'A', color: '#111' })
    const b = await createFile({ name: 'B', color: '#222' })
    const note = await createTextNote({ title: 'A', content: '', fileId: a.id })

    await updateNote(note.id, { fileId: b.id })

    expect((await db.notes.get(note.id))!.fileId).toBe(b.id)
  })
})
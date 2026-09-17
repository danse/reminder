import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import {
  allTags,
  createNote,
  createTextNote,
  createVoiceNote,
  deleteNote,
  deleteTag,
  getNote,
  listNotes,
  mergeTag,
  searchNotes,
  updateNote,
  getBlob,
} from '../notes'

describe('notes repository', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterEach(() => {
    db.close()
  })

  describe('createNote', () => {
    it('creates a text note with defaults and timestamps', async () => {
      const note = await createTextNote({ title: 'Hello', content: '# Hi' })

      expect(note.id).toBeTruthy()
      expect(note.type).toBe('text')
      expect(note.title).toBe('Hello')
      expect(note.content).toBe('# Hi')
      expect(note.tags).toEqual([])
      expect(note.fileId).toBeNull()
      expect(note.blobId).toBeNull()
      expect(note.createdAt).toBeGreaterThan(0)
      expect(note.updatedAt).toBe(note.createdAt)
    })

    it('creates a note with tags and a file assignment', async () => {
      const note = await createNote({
        type: 'text',
        title: 'Tagged',
        content: '',
        tags: ['work', 'ideas'],
        fileId: 'file-1',
      })

      expect(note.tags).toEqual(['work', 'ideas'])
      expect(note.fileId).toBe('file-1')
    })
  })

  describe('createVoiceNote', () => {
    it('stores the blob and links it to the note', async () => {
      const blob = new Blob(['audio'], { type: 'audio/webm' })
      const note = await createVoiceNote({ title: 'Voice', blob })

      expect(note.type).toBe('voice')
      expect(note.blobId).toBeTruthy()

      const stored = await getBlob(note.blobId!)
      expect(stored).toBeDefined()
      expect(stored!.mimeType).toBe('audio/webm')
      expect(stored!.noteId).toBe(note.id)
      expect(stored!.data.byteLength).toBe(5)
    })
  })

  describe('getNote / updateNote', () => {
    it('gets a note by id', async () => {
      const note = await createTextNote({ title: 'A', content: 'a' })
      const found = await getNote(note.id)
      expect(found).toEqual(note)
    })

    it('updates fields and bumps updatedAt', async () => {
      const note = await createTextNote({ title: 'A', content: 'a' })
      const updated = await updateNote(note.id, { title: 'B', content: 'b', tags: ['x'] })

      expect(updated).not.toBeNull()
      expect(updated!.title).toBe('B')
      expect(updated!.content).toBe('b')
      expect(updated!.tags).toEqual(['x'])
      expect(updated!.updatedAt).toBeGreaterThan(note.updatedAt)
    })

    it('returns undefined for a missing note on update', async () => {
      expect(await updateNote('nope', { title: 'x' })).toBeUndefined()
    })
  })

  describe('listNotes', () => {
    it('returns notes sorted by updatedAt descending', async () => {
      const first = await createTextNote({ title: 'First', content: '' })
      const second = await createTextNote({ title: 'Second', content: '' })
      await updateNote(first.id, { content: 'changed' })

      const all = await listNotes()
      expect(all.map((n) => n.id)).toEqual([first.id, second.id])
    })
  })

  describe('searchNotes', () => {
    it('matches by title, content and tags', async () => {
      await createTextNote({ title: 'Grocery list', content: 'buy milk', tags: ['home'] })
      await createTextNote({ title: 'Book ideas', content: 'read more', tags: ['reading'] })

      expect((await searchNotes('grocery')).map((n) => n.title)).toEqual(['Grocery list'])
      expect((await searchNotes('milk')).map((n) => n.title)).toEqual(['Grocery list'])
      expect((await searchNotes('reading')).map((n) => n.title)).toEqual(['Book ideas'])
      expect(await searchNotes('nothing')).toEqual([])
    })

    it('is case-insensitive', async () => {
      await createTextNote({ title: 'CaSe', content: '' })
      expect((await searchNotes('case')).length).toBe(1)
    })
  })

  describe('tags', () => {
    it('merges one tag into another across notes', async () => {
      const a = await createTextNote({ title: 'A', content: '', tags: ['work', 'x'] })
      const b = await createTextNote({ title: 'B', content: '', tags: ['work'] })
      const c = await createTextNote({ title: 'C', content: '', tags: ['other'] })

      await mergeTag('x', 'work')

      expect((await getNote(a.id))!.tags).toEqual(['work'])
      expect((await getNote(b.id))!.tags).toEqual(['work'])
      expect((await getNote(c.id))!.tags).toEqual(['other'])
    })

    it('deletes a tag from all notes', async () => {
      const a = await createTextNote({ title: 'A', content: '', tags: ['work', 'x'] })
      const b = await createTextNote({ title: 'B', content: '', tags: ['x'] })

      await deleteTag('x')

      expect((await getNote(a.id))!.tags).toEqual(['work'])
      expect((await getNote(b.id))!.tags).toEqual([])
    })

    it('lists all distinct tags sorted', async () => {
      await createTextNote({ title: 'A', content: '', tags: ['zeta', 'alpha'] })
      await createTextNote({ title: 'B', content: '', tags: ['alpha'] })

      expect(await allTags()).toEqual(['alpha', 'zeta'])
    })
  })

  describe('deleteNote', () => {
    it('deletes the note and its associated blob', async () => {
      const blob = new Blob(['audio'], { type: 'audio/webm' })
      const note = await createVoiceNote({ title: 'Voice', blob })

      await deleteNote(note.id)

      expect(await getNote(note.id)).toBeUndefined()
      expect(await getBlob(note.blobId!)).toBeUndefined()
    })

    it('does not error when the note does not exist', async () => {
      await expect(deleteNote('nope')).resolves.toBeUndefined()
    })
  })
})
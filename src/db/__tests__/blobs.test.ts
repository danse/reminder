import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import {
  createPictureNote,
  createVoiceNote,
  deleteNote,
  getBlob,
  getNote,
  storedToBlob,
} from '../notes'

describe('blob storage', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  afterEach(() => {
    db.close()
  })

  const payload = (bytes: number[]): Uint8Array<ArrayBuffer> => new Uint8Array(bytes)

  it('round-trips a voice payload byte-for-byte', async () => {
    const note = await createVoiceNote({
      title: 'Voice',
      blob: new Blob([payload([1, 2, 3, 4, 5])], { type: 'audio/webm' }),
    })

    const stored = await getBlob(note.blobId!)
    expect(stored).toBeDefined()
    expect(stored!.mimeType).toBe('audio/webm')
    expect(stored!.noteId).toBe(note.id)
    expect([...new Uint8Array(stored!.data)]).toEqual([1, 2, 3, 4, 5])
  })

  it('round-trips a picture payload and reconstructs a Blob', async () => {
    const note = await createPictureNote({
      title: 'Picture',
      blob: new Blob([payload([10, 20])], { type: 'image/png' }),
    })

    const stored = await getBlob(note.blobId!)
    expect(stored!.mimeType).toBe('image/png')
    expect([...new Uint8Array(stored!.data)]).toEqual([10, 20])

    const blob = storedToBlob(stored!)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBe(2)
  })

  it('uses a fallback mime type when the source blob has none', async () => {
    const note = await createVoiceNote({
      title: 'Voice',
      blob: new Blob([payload([0])]),
    })
    const stored = await getBlob(note.blobId!)
    expect(stored!.mimeType).toBe('audio/webm')
  })

  it('deleting the note cascades to its blob', async () => {
    const note = await createVoiceNote({
      title: 'Voice',
      blob: new Blob([payload([9])], { type: 'audio/webm' }),
    })

    await deleteNote(note.id)

    expect(await getNote(note.id)).toBeUndefined()
    expect(await getBlob(note.blobId!)).toBeUndefined()
  })
})
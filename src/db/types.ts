export type NoteType = 'text' | 'voice' | 'picture'

export interface Note {
  id: string
  type: NoteType
  title: string
  /** Markdown source for text notes; empty for voice/picture notes. */
  content: string
  /** Milliseconds since epoch. */
  createdAt: number
  /** Milliseconds since epoch. */
  updatedAt: number
  tags: string[]
  /** File id, or null when the note is ungrouped. */
  fileId: string | null
  /** Reference to a stored Blob for voice/picture notes. */
  blobId: string | null
}

export interface File {
  id: string
  name: string
  color: string
  createdAt: number
}

export interface StoredBlob {
  id: string
  /** Owning note id, used to cascade deletes. */
  noteId: string
  mimeType: string
  /** Binary payload. ArrayBuffer rather than Blob for reliable cloning. */
  data: ArrayBuffer
}

export type NewNote = Pick<Note, 'type' | 'title' | 'content'> & {
  tags?: string[]
  fileId?: string | null
}
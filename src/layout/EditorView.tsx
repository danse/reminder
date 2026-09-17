import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Trash2 } from 'lucide-react'
import type { Note } from '../db/types'
import { db } from '../db/db'
import { deleteNote, updateNote } from '../db/notes'
import { useAppData, type BlobData } from '../hooks/useAppData'
import { VoicePlayer } from '../features/voice/VoicePlayer'
import { PictureView } from '../features/picture/PictureView'
import { TextEditor } from '../features/editor/TextEditor'
import { TagInput } from '../features/editor/TagInput'
import { useToast } from '../components/toastContext'

interface EditorViewProps {
  noteId: string | null
  onBack?: () => void
}

export function EditorView({ noteId, onBack }: EditorViewProps) {
  const { t } = useTranslation()
  const note = useLiveQuery(() => (noteId ? db.notes.get(noteId) : undefined), [noteId])

  if (!note) {
    return (
      <div className="editor-view editor-view-empty" data-testid="editor-empty">
        <p>{t('note.selectPrompt')}</p>
      </div>
    )
  }

  return <NoteEditor key={note.id} note={note} onBack={onBack} />
}

function NoteEditor({ note, onBack }: { note: Note; onBack?: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { files } = useAppData()

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags)
  const [fileId, setFileId] = useState(note.fileId)
  const [dirty, setDirty] = useState(false)
  const skipSave = useRef(true)

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    setDirty(true)
    const id = window.setTimeout(() => {
      void updateNote(note.id, { title, content, tags, fileId }).then(() => setDirty(false))
    }, 500)
    return () => window.clearTimeout(id)
  }, [title, content, tags, fileId, note.id])

  async function handleDelete() {
    if (!window.confirm(t('note.deleteConfirm'))) return
    await deleteNote(note.id)
    toast(t('note.deleted'))
    navigate('/')
  }

  return (
    <div className="editor-view" data-testid="editor-view">
      <div className="editor-header">
        {onBack && (
          <button
            type="button"
            className="icon-button editor-back"
            onClick={onBack}
            aria-label={t('common.back')}
            data-testid="editor-back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <input
          className="editor-title"
          value={title}
          placeholder={t('note.titlePlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="editor-title"
        />
        <div className="editor-header-actions">
          <select
            className="file-select"
            value={fileId ?? ''}
            onChange={(e) => setFileId(e.target.value || null)}
            aria-label={t('editor.moveTo')}
            data-testid="editor-file-select"
          >
            <option value="">{t('editor.noFile')}</option>
            {files.map((file) => (
              <option key={file.id} value={file.id}>
                {file.name}
              </option>
            ))}
          </select>
          {dirty && (
            <span className="editor-saved" data-testid="editor-dirty">
              {t('editor.saved')}
            </span>
          )}
          <button
            type="button"
            className="icon-button"
            onClick={handleDelete}
            aria-label={t('common.delete')}
            data-testid="editor-delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <TagInput tags={tags} onChange={setTags} />

      <div className="editor-body">
        {note.type === 'text' && (
          <TextEditor content={content} onChange={setContent} />
        )}
        {note.type === 'voice' && <VoiceEditor noteId={note.id} />}
        {note.type === 'picture' && <PictureEditor noteId={note.id} />}
      </div>
    </div>
  )
}

function useBlobForNote(noteId: string): { blob: BlobData | null } {
  const blob = useLiveQuery(async () => {
    const note = await db.notes.get(noteId)
    if (!note?.blobId) return null
    const stored = await db.blobs.get(note.blobId)
    return stored ? { mimeType: stored.mimeType, data: stored.data } : null
  }, [noteId])
  return { blob: blob ?? null }
}

function VoiceEditor({ noteId }: { noteId: string }) {
  const { blob } = useBlobForNote(noteId)
  if (!blob) return null
  return <VoicePlayer blob={blob} />
}

function PictureEditor({ noteId }: { noteId: string }) {
  const { blob } = useBlobForNote(noteId)
  if (!blob) return null
  return <PictureView blob={blob} />
}
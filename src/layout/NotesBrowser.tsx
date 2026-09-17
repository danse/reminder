import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useNotes } from '../hooks/useAppData'
import { filterNotes } from '../utils/filter'
import { NoteList } from './NoteList'
import { EditorView } from './EditorView'

export function NotesBrowser() {
  const { fileId, tag, noteId } = useParams<{ fileId?: string; tag?: string; noteId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const notes = useNotes() ?? []

  const query = searchParams.get('q') ?? ''

  const filtered = filterNotes(notes, {
    fileId,
    tag: tag ? decodeURIComponent(tag) : undefined,
    query,
  })

  const selectedId = noteId && filtered.some((n) => n.id === noteId) ? noteId : null

  return (
    <div className="browser" data-testid="notes-browser">
      {selectedId ? (
        <EditorView
          noteId={selectedId}
          onBack={() => {
            if (window.history.length > 1) navigate(-1)
            else navigate('/')
          }}
        />
      ) : (
        <NoteList notes={filtered} selectedId={null} />
      )}
    </div>
  )
}
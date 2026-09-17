import { useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  FileText,
  Folder,
  FolderPlus,
  Mic,
  NotebookText,
  Plus,
  Search,
  Tags,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import { createFile } from '../db/files'
import { createPictureNote, createTextNote, createVoiceNote } from '../db/notes'
import { deleteFile } from '../db/files'
import { useFiles, useNotes, useTags } from '../hooks/useAppData'
import { useToast } from '../components/toastContext'
import { Modal } from '../components/Modal'
import { VoiceRecorder } from '../features/voice/VoiceRecorder'
import { PicturePicker } from '../features/picture/PicturePicker'
import { LanguageSelect } from '../components/LanguageSelect'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  const notes = useNotes() ?? []
  const files = useFiles() ?? []
  const tags = useTags() ?? []

  const [showVoice, setShowVoice] = useState(false)
  const [showPicture, setShowPicture] = useState(false)

  const query = searchParams.get('q') ?? ''

  const fileCounts = new Map<string, number>()
  for (const note of notes) {
    if (note.fileId) fileCounts.set(note.fileId, (fileCounts.get(note.fileId) ?? 0) + 1)
  }

  const tagCounts = new Map<string, number>()
  for (const note of notes) {
    for (const tag of note.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }

  const ungroupedCount = notes.filter((n) => n.fileId === null).length

  async function handleNewText() {
    const note = await createTextNote({ title: '', content: '' })
    navigate(`/note/${note.id}`)
  }

  async function handleNewFile() {
    const name = window.prompt(t('file.newPrompt'))
    if (!name?.trim()) return
    const file = await createFile({ name: name.trim(), color: '#64748b' })
    toast(t('file.created'))
    navigate(`/file/${file.id}`)
  }

  async function handleDeleteFile(fileId: string) {
    if (!window.confirm(t('file.deleteConfirm'))) return
    await deleteFile(fileId)
  }

  return (
    <aside
      className={`sidebar ${open ? 'sidebar-open' : ''}`}
      data-testid="sidebar"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a, button')) onNavigate()
      }}
    >
      <div className="sidebar-brand">
        <NotebookText size={20} />
        <span className="sidebar-brand-name">{t('app.name')}</span>
        <LanguageSelect />
      </div>

      <div className="sidebar-search">
        <Search size={16} className="search-icon" />
        <input
          type="search"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            const next = e.target.value
            const params = new URLSearchParams(searchParams)
            if (next) params.set('q', next)
            else params.delete('q')
            setSearchParams(params, { replace: true })
          }}
          data-testid="search-input"
        />
      </div>

      <div className="sidebar-actions">
        <button type="button" className="btn btn-primary" onClick={handleNewText} data-testid="new-text-note">
          <Plus size={16} />
          {t('note.newText')}
        </button>
        <button type="button" className="btn" onClick={() => setShowVoice(true)} data-testid="new-voice-note">
          <Mic size={16} />
          {t('note.newVoice')}
        </button>
        <button type="button" className="btn" onClick={() => setShowPicture(true)} data-testid="new-picture-note">
          <ImageIcon size={16} />
          {t('note.newPicture')}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="nav-item" data-testid="nav-all">
          <NotebookText size={16} />
          {t('nav.allNotes')}
        </NavLink>
        <NavLink to="/analytics" className="nav-item" data-testid="nav-analytics">
          <BarChart3 size={16} />
          {t('nav.analytics')}
        </NavLink>
      </nav>

      <section className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">
            <Folder size={16} />
            {t('nav.files')}
          </span>
          <button
            type="button"
            className="icon-button"
            onClick={handleNewFile}
            aria-label={t('file.new')}
            data-testid="new-file"
          >
            <FolderPlus size={16} />
          </button>
        </div>
        <div className="sidebar-list">
          <Link to="/file/ungrouped" className="nav-item" data-testid="nav-ungrouped">
            <FileText size={16} />
            <span className="nav-label">{t('file.ungrouped')}</span>
            <span className="nav-count">{ungroupedCount}</span>
          </Link>
          {files.map((file) => (
            <div key={file.id} className="nav-item-row">
              <Link to={`/file/${file.id}`} className="nav-item nav-item-grow" data-testid={`nav-file-${file.id}`}>
                <span className="file-dot" style={{ backgroundColor: file.color }} />
                <span className="nav-label">{file.name}</span>
                <span className="nav-count">{fileCounts.get(file.id) ?? 0}</span>
              </Link>
              <button
                type="button"
                className="icon-button nav-remove"
                onClick={() => handleDeleteFile(file.id)}
                aria-label={t('common.delete')}
                data-testid={`delete-file-${file.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">
            <Tags size={16} />
            {t('nav.tags')}
          </span>
        </div>
        <div className="sidebar-list">
          {tags.map((tag) => (
            <Link
              to={`/tag/${encodeURIComponent(tag)}`}
              key={tag}
              className="nav-item"
              data-testid={`nav-tag-${tag}`}
            >
              <Tags size={14} />
              <span className="nav-label">{tag}</span>
              <span className="nav-count">{tagCounts.get(tag) ?? 0}</span>
            </Link>
          ))}
          {tags.length === 0 && <p className="sidebar-empty">{t('tag.noTags')}</p>}
        </div>
      </section>

      {showVoice && (
        <Modal title={t('note.newVoice')} onClose={() => setShowVoice(false)}>
          <VoiceRecorder
            onSave={async (blob) => {
              setShowVoice(false)
              const note = await createVoiceNote({ title: '', blob })
              navigate(`/note/${note.id}`)
            }}
            onCancel={() => setShowVoice(false)}
          />
        </Modal>
      )}

      {showPicture && (
        <Modal title={t('note.newPicture')} onClose={() => setShowPicture(false)}>
          <PicturePicker
            onSave={async (blob) => {
              setShowPicture(false)
              const note = await createPictureNote({ title: '', blob })
              navigate(`/note/${note.id}`)
            }}
            onCancel={() => setShowPicture(false)}
          />
        </Modal>
      )}
    </aside>
  )
}
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { deleteTag, mergeTag } from '../db/notes'
import { NotesBrowser } from './NotesBrowser'
import { Modal } from '../components/Modal'

export function TagView() {
  const { tag } = useParams<{ tag: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [mergeInto, setMergeInto] = useState('')

  const tagName = tag ? decodeURIComponent(tag) : ''

  async function handleMerge() {
    const target = mergeInto.trim()
    if (!target || target === tagName) return
    await mergeTag(tagName, target)
    setShowSettings(false)
    navigate(`/tag/${encodeURIComponent(target)}`)
  }

  async function handleDelete() {
    if (!window.confirm(t('tag.deleteConfirm'))) return
    await deleteTag(tagName)
    setShowSettings(false)
    navigate('/')
  }

  return (
    <div className="tag-view" data-testid="tag-view">
      <div className="view-header">
        <h1 className="view-title">{tagName}</h1>
        <button
          type="button"
          className="btn"
          onClick={() => setShowSettings(true)}
          data-testid="tag-settings"
        >
          <Settings size={16} />
          {t('common.edit')}
        </button>
      </div>
      <NotesBrowser />
      {showSettings && (
        <Modal title={tagName} onClose={() => setShowSettings(false)}>
          <div className="tag-settings">
            <label className="field-label" htmlFor="merge-into">
              {t('tag.mergeFrom')}
            </label>
            <input
              id="merge-into"
              className="field-input"
              value={mergeInto}
              onChange={(e) => setMergeInto(e.target.value)}
              data-testid="tag-merge-input"
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleMerge}
                disabled={!mergeInto.trim()}
                data-testid="tag-merge-confirm"
              >
                {t('common.confirm')}
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} data-testid="tag-delete">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  function add() {
    const tag = draft.trim()
    if (!tag) return
    if (!tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setDraft('')
  }

  function remove(tag: string) {
    onChange(tags.filter((x) => x !== tag))
  }

  return (
    <div className="tag-input" data-testid="tag-input">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip" data-testid={`tag-chip-${tag}`}>
          {tag}
          <button
            type="button"
            className="tag-chip-remove"
            onClick={() => remove(tag)}
            aria-label={t('common.delete')}
            data-testid={`tag-remove-${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={draft}
        placeholder={t('editor.addTag')}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
        data-testid="tag-input-field"
      />
      <button type="button" className="icon-button" onClick={add} aria-label={t('editor.addTag')} data-testid="tag-add">
        <Plus size={14} />
      </button>
    </div>
  )
}
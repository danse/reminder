import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

const MarkdownPreview = lazy(() =>
  import('./MarkdownPreview').then((m) => ({ default: m.MarkdownPreview })),
)

interface TextEditorProps {
  content: string
  onChange: (content: string) => void
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  return (
    <div className="text-editor" data-testid="text-editor">
      <div className="editor-tabs">
        <button
          type="button"
          className={`tab ${mode === 'write' ? 'tab-active' : ''}`}
          onClick={() => setMode('write')}
          data-testid="editor-tab-write"
        >
          {t('editor.write')}
        </button>
        <button
          type="button"
          className={`tab ${mode === 'preview' ? 'tab-active' : ''}`}
          onClick={() => setMode('preview')}
          data-testid="editor-tab-preview"
        >
          {t('editor.preview')}
        </button>
      </div>
      {mode === 'write' ? (
        <textarea
          className="editor-textarea"
          value={content}
          placeholder={t('note.contentPlaceholder')}
          onChange={(e) => onChange(e.target.value)}
          data-testid="editor-textarea"
        />
      ) : (
        <Suspense fallback={<div className="markdown">{t('common.loading')}</div>}>
          <MarkdownPreview content={content} />
        </Suspense>
      )}
    </div>
  )
}
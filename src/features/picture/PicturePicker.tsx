import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Upload, X } from 'lucide-react'

interface PicturePickerProps {
  onSave: (blob: Blob) => void
  onCancel: () => void
}

export function PicturePicker({ onSave, onCancel }: PicturePickerProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<Blob | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const picked = files?.[0]
    if (!picked) return
    setFile(picked)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(picked)
    })
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  return (
    <div className="picture-picker" data-testid="picture-picker">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="picture-input"
      />
      {preview && file && (
        <div className="picture-preview">
          <img src={preview} alt="" data-testid="picture-preview" />
          <div className="picture-preview-actions">
            <button type="button" className="btn btn-primary" onClick={() => onSave(file)} data-testid="picture-save">
              {t('common.save')}
            </button>
            <button type="button" className="btn" onClick={onCancel} data-testid="picture-discard">
              <X size={16} />
              {t('voice.discard')}
            </button>
          </div>
        </div>
      )}
      {!preview && (
        <div className="picture-picker-actions">
          <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()} data-testid="picture-capture">
            <Camera size={16} />
            {t('picture.capture')}
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()} data-testid="picture-upload">
            <Upload size={16} />
            {t('picture.upload')}
          </button>
        </div>
      )}
    </div>
  )
}
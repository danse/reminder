import { useEffect, useMemo, useState } from 'react'
import { blobToObjectUrl, type BlobData } from '../../hooks/useAppData'

interface PictureViewProps {
  blob: BlobData
}

export function PictureView({ blob }: PictureViewProps) {
  const [lightbox, setLightbox] = useState(false)
  const url = useMemo(() => blobToObjectUrl(blob), [blob])

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  return (
    <div className="picture-view" data-testid="picture-view">
      <button
        type="button"
        className="picture-thumb-button"
        onClick={() => setLightbox(true)}
        data-testid="picture-open"
      >
        <img src={url} alt="" className="picture-thumb" data-testid="picture-image" />
      </button>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)} data-testid="picture-lightbox" role="presentation">
          <img src={url} alt="" className="lightbox-image" />
        </div>
      )}
    </div>
  )
}
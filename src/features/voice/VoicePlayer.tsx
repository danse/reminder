import { useEffect, useMemo } from 'react'
import { blobToObjectUrl, type BlobData } from '../../hooks/useAppData'

interface VoicePlayerProps {
  blob: BlobData
}

export function VoicePlayer({ blob }: VoicePlayerProps) {
  const url = useMemo(() => blobToObjectUrl(blob), [blob])

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  return <audio src={url} controls data-testid="voice-player" className="voice-player" />
}
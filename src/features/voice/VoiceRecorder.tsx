import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mic, Pause, Play, Square, Save, X } from 'lucide-react'

interface VoiceRecorderProps {
  onSave: (blob: Blob) => void
  onCancel: () => void
}

type RecorderState = 'idle' | 'recording' | 'paused'

export function VoiceRecorder({ onSave, onCancel }: VoiceRecorderProps) {
  const { t } = useTranslation()
  const [state, setState] = useState<RecorderState>('idle')
  const [hasRecording, setHasRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t('voice.notSupported'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRef.current = recorder
      chunksRef.current = []
      setHasRecording(false)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start()
      setState('recording')
      setError(null)
      setElapsed(0)
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch {
      setError(t('voice.permissionDenied'))
    }
  }

  function pause() {
    mediaRef.current?.pause()
    setState('paused')
    if (timerRef.current) window.clearInterval(timerRef.current)
  }

  function resume() {
    mediaRef.current?.resume()
    setState('recording')
    timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000)
  }

  function stop() {
    mediaRef.current?.stop()
    setHasRecording(true)
    if (timerRef.current) window.clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setState('idle')
  }

  function save() {
    if (chunksRef.current.length === 0) return
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    onSave(blob)
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div className="recorder" data-testid="voice-recorder">
      {error && <p className="error-text">{error}</p>}
      <div className="recorder-status" data-testid="recorder-status">
        {state === 'recording' && (
          <span className="recording-dot" aria-hidden="true" />
        )}
        {state === 'idle' && !hasRecording && <span>{t('voice.record')}</span>}
        {state === 'recording' && <span>{t('voice.recording')} {mmss}</span>}
        {state === 'paused' && <span>{t('voice.pause')} {mmss}</span>}
        {state === 'idle' && hasRecording && <span>{mmss}</span>}
      </div>

      <div className="recorder-controls">
        {state === 'idle' && !hasRecording && (
          <button type="button" className="btn btn-primary" onClick={start} data-testid="recorder-start">
            <Mic size={16} />
            {t('voice.record')}
          </button>
        )}
        {state === 'recording' && (
          <>
            <button type="button" className="btn" onClick={pause} data-testid="recorder-pause">
              <Pause size={16} />
              {t('voice.pause')}
            </button>
            <button type="button" className="btn btn-danger" onClick={stop} data-testid="recorder-stop">
              <Square size={16} />
              {t('voice.stop')}
            </button>
          </>
        )}
        {state === 'paused' && (
          <button type="button" className="btn btn-primary" onClick={resume} data-testid="recorder-resume">
            <Play size={16} />
            {t('voice.resume')}
          </button>
        )}
        {state === 'idle' && hasRecording && (
          <>
            <button type="button" className="btn btn-primary" onClick={save} data-testid="recorder-save">
              <Save size={16} />
              {t('voice.save')}
            </button>
            <button type="button" className="btn" onClick={onCancel} data-testid="recorder-discard">
              <X size={16} />
              {t('voice.discard')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
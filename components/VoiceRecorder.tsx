'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VoiceRecorderProps {
  userId: string
  onSend: (audioUrl: string, durationSec: number) => void
  accentColor?: string
  disabled?: boolean
}

export default function VoiceRecorder({ userId, onSend, accentColor = 'var(--gold)', disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop())

        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000)

        if (chunksRef.current.length === 0 || durationSec < 1) {
          setRecording(false)
          setElapsed(0)
          return
        }

        setUploading(true)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const fileName = `voice/${userId}/${Date.now()}.webm`

        const supabase = createClient()
        const { error } = await supabase.storage.from('uploads').upload(fileName, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
        })

        if (!error) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
          if (urlData?.publicUrl) {
            onSend(urlData.publicUrl, durationSec)
          }
        }

        setRecording(false)
        setUploading(false)
        setElapsed(0)
      }

      mediaRecorder.start(250) // collect data every 250ms
      startTimeRef.current = Date.now()
      setRecording(true)
      setElapsed(0)

      timerRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
      }, 500)
    } catch {
      // Microphone access denied or not available
      setRecording(false)
    }
  }, [userId, onSend])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Clear chunks before stopping so onstop won't upload
      chunksRef.current = []
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setRecording(false)
    setElapsed(0)
  }, [])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Max 2 minutes
  useEffect(() => {
    if (elapsed >= 120) stopRecording()
  }, [elapsed, stopRecording])

  if (uploading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `rgba(212,175,55,0.08)` }}>
        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Envoi...</span>
      </div>
    )
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2">
        {/* Cancel */}
        <button onClick={cancelRecording} className="p-2 rounded-lg transition-all cursor-pointer" style={{ color: 'var(--text-muted)' }}
          title="Annuler">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Recording indicator + timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{formatTime(elapsed)}</span>
        </div>

        {/* Send */}
        <button onClick={stopRecording} className="p-2 rounded-lg transition-all cursor-pointer" style={{ color: accentColor }}
          title="Envoyer le vocal">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <button onClick={startRecording} disabled={disabled}
      className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: 'var(--text-muted)' }} title="Envoyer un vocal">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}

'use client'

import { useRef, useState, useEffect } from 'react'

interface AudioPlayerProps {
  src: string
  accentColor?: string
}

export default function AudioPlayer({ src, accentColor = 'var(--gold)' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => setDuration(audio.duration)
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnded = () => { setPlaying(false); setCurrentTime(0) }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() } else { audio.play() }
    setPlaying(!playing)
  }

  function formatTime(s: number) {
    if (!isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause button */}
      <button onClick={toggle} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer"
        style={{ background: `${accentColor}20`, color: accentColor }}>
        {playing ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress bar */}
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: accentColor }} />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatTime(currentTime)}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

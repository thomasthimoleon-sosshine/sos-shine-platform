'use client'

import { useRef, useState, useEffect } from 'react'

export default function PreviewPlayer({
  videoUrl,
  thumbnail,
  title,
  previewSeconds = 120,
}: {
  videoUrl: string
  thumbnail: string
  title: string
  previewSeconds?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      if (video.currentTime >= previewSeconds) {
        video.pause()
        setEnded(true)
      }
      setProgress(Math.min(100, (video.currentTime / previewSeconds) * 100))
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [previewSeconds])

  function handleStart() {
    setStarted(true)
    setEnded(false)
    setTimeout(() => {
      videoRef.current?.play()
    }, 50)
  }

  function handleRestart() {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setEnded(false)
    setProgress(0)
    video.play()
  }

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
      {/* Video */}
      {started && (
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          playsInline
          controls={!ended}
          preload="metadata"
        />
      )}

      {/* Thumbnail / Start screen */}
      {!started && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={handleStart}
              style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(201,169,97,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#09090B">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: '999px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)', fontSize: '12px', whiteSpace: 'nowrap' }}>
            Aperçu de 2 min
          </div>
        </div>
      )}

      {/* Preview progress bar (thin, bottom) */}
      {started && !ended && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ height: '100%', background: '#C9A961', width: `${progress}%`, transition: 'width 0.5s linear' }} />
        </div>
      )}

      {/* End overlay */}
      {ended && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,9,11,0.88)', backdropFilter: 'blur(6px)', gap: '20px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A961', fontWeight: '600' }}>
            Aperçu terminé
          </p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#F5F1E8', margin: 0, fontWeight: '400' }}>
            Envie de voir la suite ?
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href="/login"
              style={{ padding: '12px 28px', borderRadius: '999px', background: 'linear-gradient(135deg, #C9A961, #B8963E)', color: '#09090B', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}
            >
              Rejoindre SOS Shine
            </a>
            <button
              onClick={handleRestart}
              style={{ padding: '12px 20px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}
            >
              Revoir l&apos;aperçu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

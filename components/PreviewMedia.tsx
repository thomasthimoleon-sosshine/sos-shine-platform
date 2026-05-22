'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

type PreviewVideoProps = {
  src: string
  poster?: string
  ctaText: string
  ctaLink: string
  subtitleText: string
}

export function PreviewVideo({ src, poster, ctaText, ctaLink, subtitleText }: PreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const onTime = () => { if (vid.currentTime >= 30) { vid.pause(); setLocked(true) } }
    vid.addEventListener('timeupdate', onTime)
    return () => vid.removeEventListener('timeupdate', onTime)
  }, [])

  if (locked) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.9), rgba(201,169,97,0.05))', border: '1px solid rgba(201,169,97,0.2)' }}>
        <div className="text-center py-10 px-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.25)' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold mb-2 text-[var(--brand)]">
            L&apos;extrait est terminé
          </h3>
          <p className="text-sm mb-6 max-w-xs mx-auto text-[var(--text-secondary)]">
            {subtitleText}
          </p>
          <Link href={ctaLink}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--gold-deep, var(--brand-deep)))', color: '#000000', boxShadow: '0 4px 20px rgba(201,169,97,0.3)' }}>
            {ctaText}
          </Link>
          <p className="text-xs mt-4 text-[var(--text-muted)]">
            Sans engagement. Annulation en un clic.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden aspect-video bg-[var(--surface)]">
      <video ref={videoRef} src={src} poster={poster} controls preload="metadata" className="w-full h-full" />
    </div>
  )
}

type PreviewAudioProps = {
  src: string
  title: string
  ctaText: string
  ctaLink: string
}

export function PreviewAudio({ src, title, ctaText, ctaLink }: PreviewAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioLocked, setAudioLocked] = useState(false)

  useEffect(() => {
    const aud = audioRef.current
    if (!aud) return
    const onTime = () => { if (aud.currentTime >= 30) { aud.pause(); setAudioLocked(true) } }
    aud.addEventListener('timeupdate', onTime)
    return () => aud.removeEventListener('timeupdate', onTime)
  }, [])

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,169,97,0.15)' }}>
      <p className="font-medium text-sm text-[var(--text-primary)]">Audio - {title}</p>
      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.12)' }}>
        <span className="text-lg flex-shrink-0 mt-0.5">🎧</span>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          {audioLocked ? 'Extrait de 30 secondes terminé.' : 'Écoutez un extrait de 30 secondes.'}
        </p>
      </div>
      {audioLocked ? (
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.2)' }}>
          <p className="text-sm text-[var(--brand)]">Vous aimez ? Accédez à la suite</p>
          <Link href={ctaLink} className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--gold-deep, var(--brand-deep)))', color: '#000000' }}>
            {ctaText}
          </Link>
        </div>
      ) : (
        <audio ref={audioRef} src={src} controls className="w-full" />
      )}
    </div>
  )
}

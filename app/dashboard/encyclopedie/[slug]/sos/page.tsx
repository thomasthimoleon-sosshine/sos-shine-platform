'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ShineIcon from '@/components/icons/ShineIcon'

interface SosData {
  id: string
  slug: string
  title: string
  sos_audio_url: string | null
  sos_description: string | null
  sos_duration_seconds: number | null
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DouleurSosPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<SosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: row, error: err } = await (supabase.from('douleurs') as any)
          .select('id, slug, title, sos_audio_url, sos_description, sos_duration_seconds')
          .eq('slug', slug)
          .maybeSingle()
        if (err) {
          setError('Impossible de charger la méditation')
        } else if (!row) {
          setError('Sujet introuvable')
        } else {
          setData(row as SosData)
        }
      } catch {
        setError('Erreur de connexion')
      }
      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
          {error || 'Introuvable'}
        </p>
        <Link href="/dashboard/encyclopedie" className="inline-block text-sm font-medium" style={{ color: 'var(--brand)' }}>
          Retour à l&apos;encyclopédie
        </Link>
      </div>
    )
  }

  if (!data.sos_audio_url) {
    return (
      <div className="max-w-xl mx-auto py-20 px-5 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)' }}>
          <span style={{ color: 'var(--brand)' }}><ShineIcon name="relationships" className="w-8 h-8" /></span>
        </div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Pas de méditation SOS pour ce sujet
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Revenez sur la page du protocole pour accéder aux 3 étapes complètes.
        </p>
        <Link href={`/dashboard/encyclopedie/${data.slug}`} className="inline-block px-6 py-3 rounded-full text-sm font-medium transition-all"
          style={{ background: 'var(--brand)', color: 'var(--dark)' }}>
          Retour au protocole
        </Link>
        <div className="pt-8 border-t border-[var(--border)] text-xs" style={{ color: 'var(--text-muted)' }}>
          Si vous êtes en danger immédiat, appelez le <strong style={{ color: '#FF6B6B' }}>3114</strong> (prévention du suicide, gratuit 24/7).
        </div>
      </div>
    )
  }

  const durationDisplay = duration || data.sos_duration_seconds || 0
  const progress = durationDisplay > 0 ? (currentTime / durationDisplay) * 100 : 0

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full space-y-8"
      >
        {/* Back link */}
        <Link href={`/dashboard/encyclopedie/${data.slug}`} className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à {data.title}
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.12)', border: '2px solid rgba(255,107,107,0.35)' }}>
            <span style={{ color: 'var(--brand)' }}><ShineIcon name="relationships" className="w-9 h-9" /></span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#FF6B6B' }}>
            Méditation SOS
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Vous n&apos;êtes pas seul(e).
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {data.title} · {formatTime(data.sos_duration_seconds || 300)}
          </p>
        </div>

        {/* Description */}
        {data.sos_description && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.15)' }}>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {data.sos_description}
            </p>
          </div>
        )}

        {/* Audio player - big, central, warm */}
        <div className="rounded-3xl p-8" style={{ background: 'linear-gradient(160deg, rgba(255,107,107,0.08), rgba(0,0,0,0.3))', border: '1px solid rgba(255,107,107,0.25)' }}>
          <audio
            ref={audioRef}
            src={data.sos_audio_url}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />

          {/* Progress */}
          <div className="mb-6">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF6B6B, #FFA07A)' }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{durationDisplay ? formatTime(durationDisplay) : '...'}</span>
            </div>
          </div>

          {/* Play button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #E17055)',
              color: '#fff',
              boxShadow: '0 10px 30px rgba(255,107,107,0.4)',
            }}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            Installez-vous confortablement. Respirez. Laissez-vous guider.
          </p>
        </div>

        {/* Emergency line */}
        <div className="text-center text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Si vous êtes en danger immédiat, appelez le <strong style={{ color: '#FF6B6B' }}>3114</strong>
          <br />(numéro national de prévention du suicide, gratuit 24/7).
        </div>
      </motion.div>
    </div>
  )
}

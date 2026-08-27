'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ShineIcon, { type ShineIconName } from '@/components/icons/ShineIcon'
// FeatureGate retiré : Shine Audible est accessible à tous les membres

// ── Types ──
type ShineAudio = {
  id: string
  title: string
  description: string
  cover: string
  audioUrl: string
  narrator: string
  category: string
  contentType: 'podcast' | 'audiobook' | 'meditation' | 'hypnosis' | 'ambient'
  duration: string
  durationSeconds: number
  year: number
  rating: number
  userRating: number
  isFavorite: boolean
  reviewCount: number
  douleurId: string | null
}

type Review = {
  id: string
  author: string
  avatar: string
  rating: number
  text: string
  date: string
}

// ── Categories ──
/* Signes du jeu « Les Éclats » — plus aucun émoji système. */
const CATEGORIES: { id: string; label: string; icon: ShineIconName }[] = [
  { id: 'trending', label: 'Tendances', icon: 'resilience' },
  { id: 'meditation', label: 'Méditations guidées', icon: 'meditation' },
  { id: 'healing', label: 'Guérison intérieure', icon: 'healing' },
  { id: 'confidence', label: 'Confiance en soi', icon: 'confidence' },
  { id: 'sleep', label: 'Sommeil & Détente', icon: 'sleep' },
  { id: 'hypnosis', label: 'Hypnose douce', icon: 'hypnose' },
  { id: 'stories', label: 'Histoires inspirantes', icon: 'histoire' },
  { id: 'ambient', label: 'Sons & Ambiances', icon: 'ambiance' },
  { id: 'children', label: 'Enfants', icon: 'children' },
]

const CONTENT_TYPES: { id: string; label: string; icon: ShineIconName | null }[] = [
  { id: 'all', label: 'Tout', icon: null },
  { id: 'podcast', label: 'Podcasts', icon: 'podcast' },
  { id: 'audiobook', label: 'Livres audio', icon: 'audiobook' },
  { id: 'meditation', label: 'Méditations', icon: 'meditation' },
  { id: 'hypnosis', label: 'Hypnose', icon: 'hypnose' },
  { id: 'ambient', label: 'Ambiances', icon: 'ambiance' },
]

// ── Stars Component ──
function StarRating({ rating, onRate, size = 'md', interactive = false }: {
  rating: number
  onRate?: (r: number) => void
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}) {
  const [hover, setHover] = useState(0)
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} transition-transform duration-150`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <svg
            className={sizes[size]}
            fill={(hover || rating) >= star ? 'var(--brand)' : 'none'}
            viewBox="0 0 24 24"
            stroke={(hover || rating) >= star ? 'var(--brand)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Mini Audio Player ──
function MiniPlayer({ audio, isPlaying, onToggle, progress, currentTime, duration, onRewind, onForward, onSeek }: {
  audio: ShineAudio
  isPlaying: boolean
  onToggle: () => void
  progress: number
  currentTime: string
  duration: string
  onRewind: () => void
  onForward: () => void
  onSeek: (pct: number) => void
}) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[90] lg:left-[17rem]"
      style={{
        background: 'linear-gradient(to top, rgba(9,9,11,0.98), rgba(9,9,11,0.95))',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Progress bar at top (clickable for seeking) */}
      <div
        className="h-1 w-full cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = ((e.clientX - rect.left) / rect.width) * 100
          onSeek(Math.max(0, Math.min(100, pct)))
        }}
      >
        <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--brand)' }} />
      </div>

      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3">
        {/* Cover */}
        <img
          src={audio.cover}
          alt={audio.title}
          className="w-12 h-12 rounded-lg object-contain ring-1 ring-white/10 shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-medium truncate text-[var(--text-primary)]">
            {audio.title}
          </h4>
          <p className="text-[11px] truncate text-[var(--text-muted)]">
            {audio.narrator} · {currentTime} / {duration}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Rewind 15s */}
          <button onClick={onRewind} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onToggle}
            className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
            style={{ background: 'var(--brand)', color: '#09090b' }}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Forward 15s */}
          <button onClick={onForward} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Horizontal Scroll Row ──
function AudioRow({ title, icon, audios, onSelect, nowPlayingId }: {
  title: string
  icon: ShineIconName
  audios: ShineAudio[]
  onSelect: (a: ShineAudio) => void
  nowPlayingId?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="relative group/row">
      <h2 className="text-lg font-display font-semibold mb-3 px-1 flex items-center gap-2 text-[var(--text-primary)]">
        <ShineIcon name={icon} className="w-5 h-5" color="#C9A961" /> {title}
      </h2>

      {/* Left arrow */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-14 bottom-0 z-10 w-12 flex items-center justify-center cursor-pointer opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
            style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.95), transparent)' }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right arrow */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-14 bottom-0 z-10 w-12 flex items-center justify-center cursor-pointer opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
            style={{ background: 'linear-gradient(to left, rgba(9,9,11,0.95), transparent)' }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {audios.map((audio, i) => (
          <motion.div
            key={audio.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="shrink-0 group/card cursor-pointer"
            style={{ scrollSnapAlign: 'start', width: 'clamp(160px, 18vw, 200px)' }}
            onClick={() => onSelect(audio)}
          >
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover/card:scale-105 group-hover/card:z-10 group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
              {/* Cover - square for audio */}
              <div className="relative aspect-square">
                <img
                  src={audio.cover}
                  alt={audio.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                {/* Now playing indicator */}
                {nowPlayingId === audio.id && (
                  <div className="absolute top-2 left-2">
                    <div className="flex items-end gap-[2px] h-4 px-1.5 py-1 rounded"
                      style={{ background: 'rgba(0,0,0,0.7)' }}>
                      {[1, 2, 3].map(bar => (
                        <div key={bar} className="w-[3px] rounded-full animate-pulse"
                          style={{
                            background: 'var(--brand)',
                            height: `${8 + Math.random() * 8}px`,
                            animationDelay: `${bar * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Duration badge */}
                <span
                  className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                >
                  {audio.duration}
                </span>
                {/* Favorite heart */}
                {audio.isFavorite && (
                  <span className="absolute top-2 right-2">
                    <svg className="w-4 h-4" fill="var(--brand)" viewBox="0 0 24 24" stroke="none">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </span>
                )}
                {/* Content type badge */}
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(201,169,97,0.9)', color: '#09090b' }}>
                  {audio.contentType === 'podcast' ? '🎙️' : audio.contentType === 'audiobook' ? '📚' : audio.contentType === 'meditation' ? '🧘' : audio.contentType === 'hypnosis' ? '🌀' : '🎵'}
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110"
                    style={{ background: 'var(--brand)', color: '#09090b' }}
                  >
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Title + info below card */}
            <div className="mt-2.5 px-0.5">
              <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">
                {audio.title}
              </h3>
              <p className="text-[11px] truncate mt-0.5 text-[var(--text-muted)]">
                {audio.narrator}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(audio.rating)} size="sm" />
                <span className="text-[11px] text-[var(--text-muted)]">
                  {audio.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Hero Banner ──
function HeroBanner({ audio, onOpen, onPlay }: { audio: ShineAudio; onOpen: () => void; onPlay: () => void }) {
  return (
    /* ─── « La Fenêtre », comme sur Shine TV ─────────────────────────────
       La pochette n'est plus un fond flouté à 40 px derrière un voile : c'est
       une pièce posée, nette et entière, à droite du texte. On garde une trace
       de la pochette en fond, très basse, pour la couleur, mais elle
       n'écrase plus rien.
       Adaptation à l'audio : la fenêtre est carrée, pas en 16/9. Une pochette
       forcée dans un cadre large aurait été rognée sur les côtés. ────── */
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#0d0b08] border border-[rgba(201,169,97,0.14)]"
      style={{ height: 'clamp(420px, 52vh, 520px)' }}>

      {audio.cover && (
        <img
          src={audio.cover}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ filter: 'blur(64px)', transform: 'scale(1.3)', opacity: 0.18 }}
        />
      )}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(100deg, #0d0b08 22%, rgba(13,11,8,0.72) 55%, rgba(13,11,8,0.35))' }} />

      <div className="relative h-full grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 sm:gap-12 items-center px-6 sm:px-10 lg:px-12">

        {/* Colonne texte */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="min-w-0"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-5"
            style={{ background: 'rgba(201,169,97,0.14)', color: '#E3C77E', border: '1px solid rgba(201,169,97,0.32)' }}>
            <ShineIcon name="audio" className="w-3.5 h-3.5" />
            Recommandé pour vous
          </span>

          <h1 className="font-display font-semibold tracking-tight mb-3 text-white"
            style={{ fontSize: 'clamp(28px, 3.1vw, 44px)', lineHeight: 1.06 }}>
            {audio.title}
          </h1>

          {audio.narrator && (
            <p className="text-[13.5px] mb-3 text-white/55">
              Narré par <span className="text-[#C9A961]">{audio.narrator}</span>
            </p>
          )}

          <p className="text-[14.5px] leading-relaxed mb-6 line-clamp-3 text-white/65">
            {audio.description}
          </p>

          <div className="flex items-center gap-3 flex-wrap mb-5">
            <button onClick={onPlay}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-[14px] font-semibold cursor-pointer transition-transform duration-200 hover:scale-[1.04]"
              style={{ background: 'linear-gradient(135deg,#E3C77E,#C9A961)', color: '#0A0806' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Écouter
            </button>
            <button onClick={onOpen}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium cursor-pointer transition-colors duration-200 hover:bg-white/[0.12]"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}>
              Détails
            </button>
          </div>

          <p className="text-[11.5px] uppercase tracking-[0.18em] text-white/40">
            {CATEGORIES.find(c => c.id === audio.category)?.label || 'Audio'} · {audio.duration}
            {audio.reviewCount > 0 && ` · ${audio.rating.toFixed(1).replace('.', ',')} ★`}
          </p>
        </motion.div>

        {/* La fenêtre : la pochette, entière et nette */}
        <motion.button
          onClick={onPlay}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          aria-label={`Écouter ${audio.title}`}
          className="group relative hidden sm:block rounded-xl overflow-hidden aspect-square cursor-pointer
                     shadow-[0_30px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
          style={{ height: 'clamp(230px, 34vh, 320px)' }}
        >
          {audio.cover ? (
            <img src={audio.cover} alt={audio.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(201,169,97,0.08)' }}>
              <ShineIcon name="audio" className="w-12 h-12" color="#C9A961" strokeWidth={1.1} />
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm
                             transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'rgba(201,169,97,0.92)', color: '#0A0806' }}>
              <svg className="w-7 h-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
        </motion.button>
      </div>
    </div>
  )
}

// ── Audio Detail Modal ──
function AudioModal({ audio, onClose, onToggleFavorite, onRate, onPlay }: {
  audio: ShineAudio
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onRate: (id: string, rating: number) => void
  onPlay: (audio: ShineAudio) => void
}) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview')
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/shine-audible?id=${audio.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) return
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('shine_audible_reviews').insert({
        user_id: user.id,
        track_id: audio.id,
        content: newReview.trim(),
        rating: newRating,
      })

      setReviews(prev => [{
        id: `r-new-${Date.now()}`,
        author: 'Vous',
        avatar: '',
        rating: newRating,
        text: newReview,
        date: "À l'instant",
      }, ...prev])
      setNewReview('')
      setNewRating(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-3xl rounded-2xl overflow-hidden relative"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Share button */}
        <button
          onClick={handleCopyLink}
          className="absolute top-4 left-4 z-20 h-9 px-3 rounded-full flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-all hover:bg-white/20"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          {copied ? (
            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copié !</>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Partager</>
          )}
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with blurred background */}
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img src={audio.cover} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'blur(40px) brightness(0.3)', transform: 'scale(1.3)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--surface-card))' }} />

          <div className="absolute inset-0 flex items-center justify-center gap-6 px-6">
            <img src={audio.cover} alt={audio.title}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-contain shadow-2xl shadow-black/60 ring-1 ring-white/10 shrink-0" />

            {/* Play overlay on cover */}
            <button
              onClick={() => onPlay(audio)}
              className="absolute w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(201,169,97,0.9)', color: '#09090b' }}
            >
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 -mt-8 relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2 text-[var(--text-primary)]">
                {audio.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <span className="text-[13px] text-[var(--text-muted)]">
                  Narré par <span className="text-[var(--brand)]">{audio.narrator}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className="text-[13px] font-medium text-[var(--brand)]">{audio.year}</span>
                <span className="text-[13px] text-[var(--text-muted)]">{audio.duration}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase"
                  style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                  {audio.contentType}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPlay(audio)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ background: 'var(--brand)', color: '#09090b' }}
              >
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button
                onClick={() => onToggleFavorite(audio.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <svg className="w-5 h-5" fill={audio.isFavorite ? 'var(--brand)' : 'none'} viewBox="0 0 24 24"
                  stroke={audio.isFavorite ? 'var(--brand)' : 'white'} strokeWidth={1.5}>
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed mb-6 text-[var(--text-secondary)]">
            {audio.description}
          </p>

          {/* Your rating */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderColor: 'rgba(201,169,97,0.1)' }}>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">Votre note :</span>
            <StarRating
              rating={audio.userRating}
              size="lg"
              interactive
              onRate={(r) => onRate(audio.id, r)}
            />
            {audio.userRating > 0 && (
              <span className="text-[13px] font-semibold text-[var(--brand)]">
                {audio.userRating}/5
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setTab('overview')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: tab === 'overview' ? 'rgba(201,169,97,0.12)' : 'transparent',
                color: tab === 'overview' ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              Aperçu
            </button>
            <button
              onClick={() => setTab('reviews')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: tab === 'reviews' ? 'rgba(201,169,97,0.12)' : 'transparent',
                color: tab === 'reviews' ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              Avis ({reviews.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'overview' ? (
              <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-display font-semibold text-[var(--brand)]">
                      {audio.rating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mt-1">
                      <StarRating rating={Math.round(audio.rating)} size="sm" />
                    </div>
                    <p className="text-[11px] mt-1 text-[var(--text-muted)]">Note moyenne</p>
                  </div>
                  <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-display font-semibold text-[var(--brand)]">
                      {audio.reviewCount}
                    </div>
                    <p className="text-[11px] mt-2 text-[var(--text-muted)]">Avis membres</p>
                  </div>
                </div>

                {/* Similar audios section removed - requires data from parent */}
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {/* Write review */}
                <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl mb-4" style={{ borderColor: 'rgba(201,169,97,0.1)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-medium text-[var(--text-secondary)]">Votre avis :</span>
                    <StarRating rating={newRating} size="md" interactive onRate={setNewRating} />
                  </div>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Partagez votre expérience avec cet audio..."
                    className="w-full rounded-xl p-3 text-[13px] resize-none outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      minHeight: 80,
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(201,169,97,0.4)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={!newReview.trim() || newRating === 0 || isSubmitting}
                      className="px-5 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                      style={{ background: 'var(--brand)', color: '#09090b' }}
                    >
                      {isSubmitting ? 'Envoi...' : 'Publier'}
                    </button>
                  </div>
                </div>

                {/* Reviews list */}
                <div className="space-y-3">
                  {reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}
                        >
                          {review.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[var(--text-primary)]">{review.author}</span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)]">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                        {review.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ──
export default function ShineAudiblePage() {
  const searchParams = useSearchParams()
  const douleurParam = searchParams.get('douleur')
  const idParam = searchParams.get('id')
  const [audios, setAudios] = useState<ShineAudio[]>([])
  const [search, setSearch] = useState('')
  const [selectedAudio, setSelectedAudio] = useState<ShineAudio | null>(null)
  const [activeFilter, setActiveFilter] = useState(douleurParam ? 'douleur' : 'all')
  const [activeType, setActiveType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [douleurName, setDouleurName] = useState<string | null>(null)

  // Player state
  const [nowPlaying, setNowPlaying] = useState<ShineAudio | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerProgress, setPlayerProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioDisclaimer, setAudioDisclaimer] = useState<ShineAudio | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function loadAudios() {
      const supabase = createClient()
      const { data } = await supabase
        .from('shine_audible_tracks')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (!data) {
        setAudios([])
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch douleur name if filtered
      if (douleurParam) {
        const { data: douleur } = await supabase
          .from('douleurs')
          .select('title')
          .eq('id', douleurParam)
          .maybeSingle()
        if (douleur) setDouleurName(douleur.title)
      }

      // Load user ratings
      const userRatingsMap: Record<string, number> = {}
      if (user) {
        const { data: ratingsData } = await supabase
          .from('shine_audible_ratings')
          .select('track_id, rating')
          .eq('user_id', user.id)
        for (const r of ratingsData || []) {
          userRatingsMap[r.track_id] = r.rating
        }
      }

      // Load average ratings & review counts
      const trackIds = data.map((t: any) => t.id)
      const { data: avgRatings } = await supabase
        .from('shine_audible_ratings')
        .select('track_id, rating')
        .in('track_id', trackIds)

      const { data: reviewCounts } = await supabase
        .from('shine_audible_reviews')
        .select('track_id')
        .in('track_id', trackIds)

      const avgMap: Record<string, { sum: number; count: number }> = {}
      for (const r of avgRatings || []) {
        if (!avgMap[r.track_id]) avgMap[r.track_id] = { sum: 0, count: 0 }
        avgMap[r.track_id].sum += r.rating
        avgMap[r.track_id].count++
      }

      const reviewCountMap: Record<string, number> = {}
      for (const r of reviewCounts || []) {
        reviewCountMap[r.track_id] = (reviewCountMap[r.track_id] || 0) + 1
      }

      // Load user favorites
      let favoriteIds: string[] = []
      if (user) {
        const { data: favData } = await supabase
          .from('shine_audible_favorites')
          .select('track_id')
          .eq('user_id', user.id)
        favoriteIds = (favData || []).map((f: any) => f.track_id)
      }

      const mapped: ShineAudio[] = data.map((t: any) => {
        const secs = t.duration_seconds ?? 0
        const duration = secs >= 3600
          ? `${Math.floor(secs / 3600)}h${((secs % 3600) / 60 | 0).toString().padStart(2, '0')}`
          : `${Math.floor(secs / 60)} min`
        return {
          id: t.id,
          title: t.title,
          description: t.description || '',
          cover: t.cover_url || '',
          audioUrl: t.audio_url || '',
          narrator: t.narrator || '',
          category: t.category,
          contentType: t.content_type,
          duration,
          durationSeconds: secs,
          year: t.year,
          rating: avgMap[t.id] ? avgMap[t.id].sum / avgMap[t.id].count : 0,
          userRating: userRatingsMap[t.id] || 0,
          isFavorite: favoriteIds.includes(t.id),
          reviewCount: reviewCountMap[t.id] || 0,
          douleurId: t.douleur_id || null,
        }
      })

      setAudios(mapped)
      setLoading(false)
      if (idParam) {
        const found = mapped.find(a => a.id === idParam)
        if (found) setSelectedAudio(found)
      }
    }
    loadAudios()
  }, [])

  useEffect(() => {
    if (selectedAudio) {
      window.history.replaceState(null, '', `?id=${selectedAudio.id}`)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [selectedAudio])

  // Sync play/pause state with audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Signal mini-player presence to other components (e.g. chatbot)
  useEffect(() => {
    if (nowPlaying) {
      document.documentElement.setAttribute('data-mini-player', 'true')
    } else {
      document.documentElement.removeAttribute('data-mini-player')
    }
    return () => document.documentElement.removeAttribute('data-mini-player')
  }, [nowPlaying])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      }
    }
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const startPlayback = (audio: ShineAudio) => {
    // Stop previous audio if any
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }

    // Create new audio element
    const el = new Audio(audio.audioUrl)
    audioRef.current = el

    el.addEventListener('timeupdate', () => {
      setCurrentTime(el.currentTime)
      if (el.duration && isFinite(el.duration)) {
        setPlayerProgress((el.currentTime / el.duration) * 100)
      }
    })
    el.addEventListener('loadedmetadata', () => {
      setAudioDuration(el.duration && isFinite(el.duration) ? el.duration : audio.durationSeconds)
    })
    el.addEventListener('ended', () => {
      setIsPlaying(false)
      setPlayerProgress(0)
      setCurrentTime(0)
    })
    el.addEventListener('error', () => {
      console.error('Audio playback error:', el.error)
      setIsPlaying(false)
    })

    setNowPlaying(audio)
    setCurrentTime(0)
    setPlayerProgress(0)
    setAudioDuration(audio.durationSeconds)
    setIsPlaying(true)
    el.play().catch(() => setIsPlaying(false))
  }

  const handlePlay = (audio: ShineAudio) => {
    if (nowPlaying?.id === audio.id) {
      setIsPlaying(!isPlaying)
    } else if (audio.contentType === 'hypnosis' || audio.contentType === 'meditation') {
      setAudioDisclaimer(audio)
    } else {
      startPlayback(audio)
    }
  }

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15)
    }
  }

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 15)
    }
  }

  const handleSeek = (pct: number) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
    }
  }

  const handleToggleFavorite = async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const audio = audios.find(a => a.id === id)
    if (!audio) return

    if (audio.isFavorite) {
      await supabase.from('shine_audible_favorites').delete().eq('user_id', user.id).eq('track_id', id)
    } else {
      await supabase.from('shine_audible_favorites').insert({ user_id: user.id, track_id: id })
    }

    setAudios(prev => prev.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a))
    if (selectedAudio?.id === id) {
      setSelectedAudio(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleRate = async (id: string, rating: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('shine_audible_ratings').upsert({
      user_id: user.id,
      track_id: id,
      rating,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,track_id' })

    setAudios(prev => prev.map(a => a.id === id ? { ...a, userRating: rating } : a))
    if (selectedAudio?.id === id) {
      setSelectedAudio(prev => prev ? { ...prev, userRating: rating } : null)
    }
  }

  const filteredAudios = audios.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.narrator.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'douleur'
      ? a.douleurId === douleurParam
      : activeFilter === 'all' || activeFilter === 'favorites'
        ? (activeFilter === 'favorites' ? a.isFavorite : true)
        : a.category === activeFilter
    const matchType = activeType === 'all' || a.contentType === activeType
    return matchSearch && matchFilter && matchType
  })

  const getAudiosByCategory = (catId: string) => filteredAudios.filter(a => a.category === catId)
  const heroAudio = audios[0]

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8" fill="#09090b" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          </div>
          <p className="font-display text-xl font-semibold text-[var(--brand)]">Shine Audible</p>
          <p className="text-[13px] text-[var(--text-muted)]">Chargement de vos contenus audio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Hero */}
      {heroAudio && !search && activeFilter === 'all' && activeType === 'all' && (
        <HeroBanner audio={heroAudio} onOpen={() => setSelectedAudio(heroAudio)} onPlay={() => handlePlay(heroAudio)} />
      )}

      <div className="px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Search + Filters bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.3)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un audio, un narrateur..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,169,97,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Content type pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {CONTENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: activeType === type.id ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                    color: activeType === type.id ? '#09090b' : 'var(--text-secondary)',
                    border: activeType === type.id ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {type.icon && <ShineIcon name={type.icon} className="w-4 h-4" />}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveFilter('all')}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: activeFilter === 'all' ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeFilter === 'all' ? 'var(--brand)' : 'var(--text-secondary)',
                border: `1px solid ${activeFilter === 'all' ? 'rgba(201,169,97,0.3)' : 'transparent'}`,
              }}
            >
              Tout
            </button>
            {douleurParam && (
              <button
                onClick={() => setActiveFilter('douleur')}
                className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                style={{
                  background: activeFilter === 'douleur' ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeFilter === 'douleur' ? 'var(--brand)' : 'var(--text-secondary)',
                  border: `1px solid ${activeFilter === 'douleur' ? 'rgba(201,169,97,0.3)' : 'transparent'}`,
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.884 6.084 2.333M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.884-6.084 2.333M12 6.042V20.333" />
                </svg>
                {douleurName || 'Douleur'}
              </button>
            )}
            <button
              onClick={() => setActiveFilter('encyclopedie')}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeFilter === 'encyclopedie' ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeFilter === 'encyclopedie' ? 'var(--brand)' : 'var(--text-secondary)',
                border: `1px solid ${activeFilter === 'encyclopedie' ? 'rgba(201,169,97,0.3)' : 'transparent'}`,
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              A - Z
            </button>
            <button
              onClick={() => setActiveFilter('favorites')}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeFilter === 'favorites' ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeFilter === 'favorites' ? 'var(--brand)' : 'var(--text-secondary)',
                border: `1px solid ${activeFilter === 'favorites' ? 'rgba(201,169,97,0.3)' : 'transparent'}`,
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Favoris
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: activeFilter === cat.id ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeFilter === cat.id ? 'var(--brand)' : 'var(--text-secondary)',
                  border: `1px solid ${activeFilter === cat.id ? 'rgba(201,169,97,0.3)' : 'transparent'}`,
                }}
              >
                <ShineIcon name={cat.icon} className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search results or category rows */}
        {search || (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'encyclopedie' && activeFilter !== 'douleur') || activeType !== 'all' ? (
          // Grid view for search/filter
          <div>
            <p className="text-[13px] mb-4 text-[var(--text-muted)]">
              {filteredAudios.length} résultat{filteredAudios.length !== 1 ? 's' : ''}
              {search && <> pour &ldquo;<span className="text-[var(--brand)]">{search}</span>&rdquo;</>}
            </p>
            {filteredAudios.length === 0 ? (
              <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  Aucun résultat
                </h3>
                <p className="text-[14px] text-[var(--text-muted)]">
                  Essayez un autre terme de recherche ou explorez nos catégories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredAudios.map((audio, i) => (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedAudio(audio)}
                  >
                    <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                      <div className="relative aspect-square">
                        <img src={audio.cover} alt={audio.title} className="w-full h-full object-contain" loading="lazy" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {audio.duration}
                        </span>
                        {audio.isFavorite && (
                          <span className="absolute top-2 right-2">
                            <svg className="w-4 h-4" fill="var(--brand)" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                          </span>
                        )}
                        {nowPlaying?.id === audio.id && (
                          <div className="absolute top-2 left-2">
                            <div className="flex items-end gap-[2px] h-4 px-1.5 py-1 rounded"
                              style={{ background: 'rgba(0,0,0,0.7)' }}>
                              {[1, 2, 3].map(bar => (
                                <div key={bar} className="w-[3px] rounded-full animate-pulse"
                                  style={{ background: 'var(--brand)', height: `${8 + Math.random() * 8}px`, animationDelay: `${bar * 0.15}s` }} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(audio) }}
                            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                            style={{ background: 'var(--brand)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{audio.title}</h3>
                      <p className="text-[11px] truncate text-[var(--text-muted)]">{audio.narrator}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(audio.rating)} size="sm" />
                        <span className="text-[11px] text-[var(--text-muted)]">{audio.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : activeFilter === 'favorites' ? (
          // Favorites view
          <div>
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <svg className="w-5 h-5" fill="var(--brand)" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Mes Favoris Audio
            </h2>
            {filteredAudios.length === 0 ? (
              <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">🎧</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  Aucun favori
                </h3>
                <p className="text-[14px] text-[var(--text-muted)]">
                  Ajoutez des audios à vos favoris pour les retrouver ici.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredAudios.map((audio, i) => (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedAudio(audio)}
                  >
                    <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105">
                      <div className="relative aspect-square">
                        <img src={audio.cover} alt={audio.title} className="w-full h-full object-contain" loading="lazy" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {audio.duration}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(audio) }}
                            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                            style={{ background: 'var(--brand)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{audio.title}</h3>
                      <p className="text-[11px] truncate text-[var(--text-muted)]">{audio.narrator}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(audio.rating)} size="sm" />
                        <span className="text-[11px] text-[var(--text-muted)]">{audio.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : activeFilter === 'douleur' ? (
          // Douleur-filtered view
          <div>
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
 <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.884 6.084 2.333M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.884-6.084 2.333M12 6.042V20.333" />
              </svg>
              {douleurName || 'Contenu lié'}
            </h2>
            {filteredAudios.length === 0 ? (
              <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">🎧</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  Aucun audio lié
                </h3>
                <p className="text-[14px] text-[var(--text-muted)]">
                  Aucun audio n&apos;est associé à cette douleur pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAudios.map((audio, i) => (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedAudio(audio)}
                  >
                    <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105">
                      <div className="relative aspect-square">
                        <img src={audio.cover} alt={audio.title} className="w-full h-full object-contain" loading="lazy" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {audio.duration}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{audio.title}</h3>
                      <p className="text-[11px] truncate text-[var(--text-muted)]">{audio.narrator}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : activeFilter === 'encyclopedie' ? (
          // Encyclopédie A-Z view
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2 text-[var(--text-primary)]">
 <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Encyclopédie A - Z
            </h2>
            {(() => {
              const sorted = [...audios].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
              const grouped: Record<string, ShineAudio[]> = {}
              sorted.forEach(a => {
                const letter = a.title.charAt(0).toUpperCase().match(/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÆŒÇ]/i)
                  ? a.title.charAt(0).toUpperCase() : '#'
                if (!grouped[letter]) grouped[letter] = []
                grouped[letter].push(a)
              })
              const letters = Object.keys(grouped).sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'fr'))

              return (
                <>
                  {/* Letter nav */}
                  <div className="flex flex-wrap gap-1.5">
                    {letters.map(letter => (
                      <a
                        key={letter}
                        href={`#letter-audible-${letter}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors hover:opacity-80"
                        style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)' }}
                      >
                        {letter}
                      </a>
                    ))}
                  </div>

                  {/* Letter groups */}
                  {letters.map(letter => (
                    <div key={letter} id={`letter-audible-${letter}`} className="scroll-mt-24">
                      <h3 className="font-display text-2xl font-bold mb-3 pb-2 text-[var(--brand)] border-b border-[var(--border)]">
                        {letter}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {grouped[letter].map((audio, i) => (
                          <motion.div
                            key={audio.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.3 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedAudio(audio)}
                          >
                            <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                              <div className="relative aspect-square">
                                {audio.cover ? (
                                  <img src={audio.cover} alt={audio.title} className="w-full h-full object-contain" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(201,169,97,0.05)' }}>
 <svg className="w-12 h-12 opacity-20 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                    </svg>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                                    {audio.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{audio.title}</h3>
                              <p className="text-[11px] truncate text-[var(--text-muted)]">{audio.narrator}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )
            })()}
          </div>
        ) : (
          // Category rows view (Spotify/Audible style)
          <div className="space-y-8">
            {CATEGORIES.map(cat => {
              const catAudios = getAudiosByCategory(cat.id)
              if (catAudios.length === 0) return null
              return (
                <AudioRow
                  key={cat.id}
                  title={cat.label}
                  icon={cat.icon}
                  audios={catAudios}
                  onSelect={setSelectedAudio}
                  nowPlayingId={nowPlaying?.id}
                />
              )
            })}
          </div>
        )}

        {/* Spacer for mini player */}
        {nowPlaying && <div className="h-24" />}
      </div>

      {/* Audio Detail Modal */}
      <AnimatePresence>
        {selectedAudio && (
          <AudioModal
            audio={selectedAudio}
            onClose={() => setSelectedAudio(null)}
            onToggleFavorite={handleToggleFavorite}
            onRate={handleRate}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>

      {/* Audio Disclaimer Modal for Hypnosis/Meditation */}
      <AnimatePresence>
        {audioDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setAudioDisclaimer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6 space-y-4"
              style={{ background: 'var(--surface-card)', border: '1px solid rgba(201,169,97,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <span className="text-4xl">🎧</span>
                <h3 className="font-display text-lg font-semibold mt-3 text-[var(--text-primary)]">
                  {audioDisclaimer.contentType === 'hypnosis' ? 'Séance d\'hypnose' : 'Méditation guidée'}
                </h3>
              </div>
              <p className="text-sm text-center leading-relaxed text-[var(--text-secondary)]">
                Avant de commencer, installez-vous confortablement dans un endroit calme et détendu. Mettez votre casque audio sur les oreilles, respirez profondément et préparez-vous à vous laisser guider en toute sérénité.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAudioDisclaimer(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all text-[var(--text-muted)] border border-[var(--border)]"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { startPlayback(audioDisclaimer); setAudioDisclaimer(null) }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
                  style={{ background: 'var(--brand)', color: 'var(--surface)' }}
                >
                  Je suis prêt(e)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player */}
      <AnimatePresence>
        {nowPlaying && (
          <MiniPlayer
            audio={nowPlaying}
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying(!isPlaying)}
            progress={playerProgress}
            currentTime={formatTime(currentTime)}
            duration={formatTime(audioDuration)}
            onRewind={handleRewind}
            onForward={handleForward}
            onSeek={handleSeek}
          />
        )}
      </AnimatePresence>

      {/* Scrollbar hide style */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ── Types ──
type ShineVideo = {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  category: string
  duration: string
  year: number
  rating: number
  userRating: number
  isFavorite: boolean
  reviewCount: number
}

type Review = {
  id: string
  author: string
  avatar: string
  rating: number
  text: string
  date: string
}

const CATEGORIES = [
  { id: 'trending', label: 'Tendances du moment', icon: '🔥' },
  { id: 'healing', label: 'Guérison intérieure', icon: '🌿' },
  { id: 'meditation', label: 'Méditations guidées', icon: '🧘' },
  { id: 'confidence', label: 'Confiance en soi', icon: '💪' },
  { id: 'relationships', label: 'Relations saines', icon: '💛' },
  { id: 'resilience', label: 'Résilience', icon: '🔥' },
  { id: 'gratitude', label: 'Gratitude & Joie', icon: '✨' },
  { id: 'sleep', label: 'Sommeil & Détente', icon: '🌙' },
  { id: 'children', label: 'Enfants', icon: '👶' },
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
            fill={(hover || rating) >= star ? '#D4AF37' : 'none'}
            viewBox="0 0 24 24"
            stroke={(hover || rating) >= star ? '#D4AF37' : 'rgba(255,255,255,0.2)'}
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Horizontal Scroll Row ──
function VideoRow({ title, icon, videos, onSelect }: {
  title: string
  icon: string
  videos: ShineVideo[]
  onSelect: (v: ShineVideo) => void
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
      <h2 className="text-lg font-display font-semibold mb-3 px-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span className="text-xl">{icon}</span> {title}
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
        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="shrink-0 group/card cursor-pointer"
            style={{ scrollSnapAlign: 'start', width: 'clamp(200px, 22vw, 280px)' }}
            onClick={() => onSelect(video)}
          >
            <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover/card:scale-105 group-hover/card:z-10 group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Duration badge */}
                <span
                  className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                >
                  {video.duration}
                </span>
                {/* Favorite heart */}
                {video.isFavorite && (
                  <span className="absolute top-2 right-2">
                    <svg className="w-4 h-4" fill="#D4AF37" viewBox="0 0 24 24" stroke="none">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--gold)', color: '#09090b' }}
                    >
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">Regarder</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Title + rating below card */}
            <div className="mt-2 px-0.5">
              <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {video.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(video.rating)} size="sm" />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {video.rating.toFixed(1)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {video.year}
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
function HeroBanner({ video, onOpen }: { video: ShineVideo; onOpen: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 'clamp(300px, 50vh, 550px)' }}>
      <img
        src={video.thumbnail}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.95) 30%, rgba(9,9,11,0.4) 60%, transparent)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, transparent 40%)' }} />

      <div className="absolute bottom-0 left-0 p-6 sm:p-10 max-w-xl z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
            style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
            Recommandé pour vous
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight mb-3" style={{ color: '#fff' }}>
            {video.title}
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-relaxed mb-5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {video.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpen}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--gold)', color: '#09090b' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Regarder
            </button>
            <button
              onClick={onOpen}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-all duration-200 hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Plus d&apos;infos
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <StarRating rating={Math.round(video.rating)} size="sm" />
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {video.rating.toFixed(1)} / 5 · {video.reviewCount} avis · {video.duration}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── Video Detail Modal ──
function VideoModal({ video, onClose, onToggleFavorite, onRate }: {
  video: ShineVideo
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onRate: (id: string, rating: number) => void
}) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview')
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = () => {
    if (!newReview.trim() || newRating === 0) return
    setIsSubmitting(true)
    setTimeout(() => {
      setReviews(prev => [{
        id: `r-new-${Date.now()}`,
        author: 'Vous',
        avatar: '',
        rating: newRating,
        text: newReview,
        date: 'À l\'instant',
      }, ...prev])
      setNewReview('')
      setNewRating(0)
      setIsSubmitting(false)
    }, 500)
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
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
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

        {/* Video preview */}
        <div className="relative aspect-video">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--dark-card), transparent 50%)' }} />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(212,175,55,0.9)', color: '#09090b' }}
            >
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {video.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className="text-[13px] font-medium" style={{ color: 'var(--gold)' }}>{video.year}</span>
                <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{video.duration}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium"
                  style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                  HD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(video.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <svg className="w-5 h-5" fill={video.isFavorite ? '#D4AF37' : 'none'} viewBox="0 0 24 24"
                  stroke={video.isFavorite ? '#D4AF37' : 'white'} strokeWidth={1.5}>
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {video.description}
          </p>

          {/* Your rating */}
          <div className="glass p-4 rounded-xl mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>Votre note :</span>
            <StarRating
              rating={video.userRating}
              size="lg"
              interactive
              onRate={(r) => onRate(video.id, r)}
            />
            {video.userRating > 0 && (
              <span className="text-[13px] font-semibold" style={{ color: 'var(--gold)' }}>
                {video.userRating}/5
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setTab('overview')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200`}
              style={{
                background: tab === 'overview' ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: tab === 'overview' ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              Aperçu
            </button>
            <button
              onClick={() => setTab('reviews')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200`}
              style={{
                background: tab === 'reviews' ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: tab === 'reviews' ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              Avis ({reviews.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'overview' ? (
              <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-xl text-center">
                    <div className="text-2xl font-display font-semibold" style={{ color: 'var(--gold)' }}>
                      {video.rating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mt-1">
                      <StarRating rating={Math.round(video.rating)} size="sm" />
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Note moyenne</p>
                  </div>
                  <div className="glass p-4 rounded-xl text-center">
                    <div className="text-2xl font-display font-semibold" style={{ color: 'var(--gold)' }}>
                      {video.reviewCount}
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>Avis membres</p>
                  </div>
                </div>

                {/* Similar videos section removed - requires simulation data */}
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {/* Write review */}
                <div className="glass p-4 rounded-xl mb-4" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Votre avis :</span>
                    <StarRating rating={newRating} size="md" interactive onRate={setNewRating} />
                  </div>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Partagez votre expérience avec cette vidéo..."
                    className="w-full rounded-xl p-3 text-[13px] resize-none outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--dark-border)',
                      color: 'var(--text-primary)',
                      minHeight: 80,
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--dark-border)'}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={!newReview.trim() || newRating === 0 || isSubmitting}
                      className="px-5 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                      style={{ background: 'var(--gold)', color: '#09090b' }}
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
                      className="glass p-4 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}
                        >
                          {review.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{review.author}</span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{review.date}</span>
                        </div>
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
export default function ShineTVPage() {
  const [videos, setVideos] = useState<ShineVideo[]>([])
  const [search, setSearch] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<ShineVideo | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideos() {
      const supabase = createClient()
      const { data } = await supabase
        .from('shine_tv_videos')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (!data) {
        setVideos([])
        setLoading(false)
        return
      }

      const mapped: ShineVideo[] = data.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description || '',
        thumbnail: v.thumbnail_url || '',
        videoUrl: v.video_url || '',
        category: v.category,
        duration: `${v.duration_minutes} min`,
        year: v.year,
        rating: 0,
        userRating: 0,
        isFavorite: false,
        reviewCount: 0,
      }))

      setVideos(mapped)
      setLoading(false)
    }

    loadVideos()
  }, [])

  const handleToggleFavorite = (id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    if (selectedVideo?.id === id) {
      setSelectedVideo(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleRate = (id: string, rating: number) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, userRating: rating } : v))
    if (selectedVideo?.id === id) {
      setSelectedVideo(prev => prev ? { ...prev, userRating: rating } : null)
    }
  }

  const filteredVideos = videos.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'all' || activeFilter === 'favorites'
      ? (activeFilter === 'favorites' ? v.isFavorite : true)
      : v.category === activeFilter
    return matchSearch && matchFilter
  })

  const getVideosByCategory = (catId: string) => filteredVideos.filter(v => v.category === catId)
  const heroVideo = videos[0]

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8" fill="#09090b" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
          <p className="font-display text-xl font-semibold" style={{ color: 'var(--gold)' }}>Shine TV</p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Chargement de vos contenus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Hero */}
      {heroVideo && !search && activeFilter === 'all' && (
        <HeroBanner video={heroVideo} onOpen={() => setSelectedVideo(heroVideo)} />
      )}

      <div className="px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Search + Filters bar */}
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
              placeholder="Rechercher une vidéo, un thème..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--dark-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--dark-border)'}
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

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveFilter('all')}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: activeFilter === 'all' ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'all' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'all' ? 'none' : '1px solid var(--dark-border)',
              }}
            >
              Tout
            </button>
            <button
              onClick={() => setActiveFilter('encyclopedie')}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeFilter === 'encyclopedie' ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'encyclopedie' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'encyclopedie' ? 'none' : '1px solid var(--dark-border)',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              A — Z
            </button>
            <button
              onClick={() => setActiveFilter('favorites')}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeFilter === 'favorites' ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'favorites' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'favorites' ? 'none' : '1px solid var(--dark-border)',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Favoris
            </button>
            {CATEGORIES.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: activeFilter === cat.id ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === cat.id ? '#09090b' : 'var(--text-secondary)',
                  border: activeFilter === cat.id ? 'none' : '1px solid var(--dark-border)',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search results or category rows */}
        {search || (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'encyclopedie') ? (
          // Grid view for search/filter
          <div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
              {filteredVideos.length} résultat{filteredVideos.length !== 1 ? 's' : ''}
              {search && <> pour &ldquo;<span style={{ color: 'var(--gold)' }}>{search}</span>&rdquo;</>}
            </p>
            {filteredVideos.length === 0 ? (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun résultat
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Essayez un autre terme de recherche ou explorez nos catégories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredVideos.map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                      <div className="relative aspect-video">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {video.duration}
                        </span>
                        {video.isFavorite && (
                          <span className="absolute top-2 right-2">
                            <svg className="w-4 h-4" fill="#D4AF37" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                          </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(video.rating)} size="sm" />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{video.rating.toFixed(1)}</span>
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
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="w-5 h-5" fill="#D4AF37" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Mes Favoris
            </h2>
            {filteredVideos.length === 0 ? (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">💛</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun favori
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Ajoutez des vidéos à vos favoris pour les retrouver ici.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredVideos.map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105">
                      <div className="relative aspect-video">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {video.duration}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(video.rating)} size="sm" />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{video.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : activeFilter === 'encyclopedie' ? (
          // Encyclopédie A-Z view
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Encyclopédie A — Z
            </h2>
            {(() => {
              const sorted = [...videos].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
              const grouped: Record<string, ShineVideo[]> = {}
              sorted.forEach(v => {
                const letter = v.title.charAt(0).toUpperCase().match(/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÆŒÇ]/i)
                  ? v.title.charAt(0).toUpperCase() : '#'
                if (!grouped[letter]) grouped[letter] = []
                grouped[letter].push(v)
              })
              const letters = Object.keys(grouped).sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'fr'))

              return (
                <>
                  {/* Letter nav */}
                  <div className="flex flex-wrap gap-1.5">
                    {letters.map(letter => (
                      <a
                        key={letter}
                        href={`#letter-tv-${letter}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors hover:opacity-80"
                        style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}
                      >
                        {letter}
                      </a>
                    ))}
                  </div>

                  {/* Letter groups */}
                  {letters.map(letter => (
                    <div key={letter} id={`letter-tv-${letter}`} className="scroll-mt-24">
                      <h3 className="font-display text-2xl font-bold mb-3 pb-2" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--dark-border)' }}>
                        {letter}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {grouped[letter].map((video, i) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.3 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                              <div className="relative aspect-video">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                                <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                                  {video.duration}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)', color: '#09090b' }}>
                                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
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
          // Netflix rows view
          <div className="space-y-8">
            {CATEGORIES.map(cat => {
              const catVideos = getVideosByCategory(cat.id)
              if (catVideos.length === 0) return null
              return (
                <VideoRow
                  key={cat.id}
                  title={cat.label}
                  icon={cat.icon}
                  videos={catVideos}
                  onSelect={setSelectedVideo}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Video Detail Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onToggleFavorite={handleToggleFavorite}
            onRate={handleRate}
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

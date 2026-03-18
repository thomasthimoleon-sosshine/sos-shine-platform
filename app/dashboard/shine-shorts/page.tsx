'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ── Types ──
type ShineShort = {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  category: string
  duration: string
  durationSeconds: number
  rating: number
  userRating: number
  isFavorite: boolean
  reviewCount: number
  douleurId: string | null
}

const CATEGORIES = [
  { id: 'trending', label: 'Tendances', icon: '🔥' },
  { id: 'cours', label: 'Cours', icon: '🎓' },
  { id: 'astuce', label: 'Astuces rapides', icon: '💡' },
  { id: 'exercice', label: 'Exercices', icon: '🧘' },
  { id: 'motivation', label: 'Motivation', icon: '🔥' },
  { id: 'temoignage', label: 'Témoignages', icon: '🗣️' },
  { id: 'meditation', label: 'Mini-méditations', icon: '🌙' },
  { id: 'respiration', label: 'Respirations', icon: '🌬️' },
  { id: 'defi', label: 'Défis', icon: '⚡' },
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
            fill={(hover || rating) >= star ? '#A29BFE' : 'none'}
            viewBox="0 0 24 24"
            stroke={(hover || rating) >= star ? '#A29BFE' : 'rgba(255,255,255,0.2)'}
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
function ShortRow({ title, icon, shorts, onSelect }: {
  title: string
  icon: string
  shorts: ShineShort[]
  onSelect: (s: ShineShort) => void
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
        {shorts.map((short, i) => (
          <motion.div
            key={short.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="shrink-0 group/card cursor-pointer"
            style={{ scrollSnapAlign: 'start', width: 'clamp(150px, 18vw, 200px)' }}
            onClick={() => onSelect(short)}
          >
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover/card:scale-105 group-hover/card:z-10 group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
              {/* Thumbnail */}
              <div className="relative aspect-[9/16]">
                {short.thumbnail ? (
                  <img
                    src={short.thumbnail}
                    alt={short.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(162,155,254,0.08)' }}>
                    <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: '#A29BFE' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                )}
                {/* Duration badge */}
                <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                  {short.duration}
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#A29BFE', color: '#fff' }}>
                    <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Title under thumbnail */}
            <div className="mt-2 px-0.5">
              <h3 className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                {short.title.length > 40 ? short.title.slice(0, 40) + '...' : short.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

type Review = {
  id: string
  author: string
  avatar: string
  rating: number
  text: string
  date: string
}

// ── Video Detail Modal ──
function VideoPlayerModal({ short, onClose, onToggleFavorite, onRate }: {
  short: ShineShort
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onRate: (id: string, r: number) => void
}) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview')
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

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

  const handleLike = () => {
    setLiked(prev => !prev)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey) }
  }, [onClose])

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
        className="w-full max-w-lg rounded-2xl overflow-hidden relative"
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video */}
        <div className="relative aspect-video bg-black">
          {short.videoUrl ? (
            <video
              src={short.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              controlsList="nodownload"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(162,155,254,0.9)', color: '#fff' }}>
                <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Title + Actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {short.title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{short.duration}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium"
                  style={{ background: 'rgba(162,155,254,0.12)', color: '#A29BFE' }}>
                  Short
                </span>
              </div>
            </div>

            {/* Favorite + Like buttons */}
            <div className="flex items-center gap-2">
              {/* Like button */}
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  background: liked ? 'rgba(162,155,254,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${liked ? 'rgba(162,155,254,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: liked ? '#A29BFE' : 'var(--text-muted)',
                }}
              >
                <svg className="w-4.5 h-4.5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.382a.75.75 0 01.863-.73 3.005 3.005 0 012.637 2.98v.5a.75.75 0 01-.75.75H18a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h2.25a2.25 2.25 0 012.25 2.25c0 .647-.274 1.23-.711 1.64a2.252 2.252 0 01-.711 3.61 2.25 2.25 0 01-2.578 2.5H9.75a2.25 2.25 0 01-2.25-2.25v-5.379c0-.414-.168-.789-.44-1.06a1.5 1.5 0 00-1.06-.44h-.467c-1.05 0-1.903-.856-1.903-1.912v-.351a1.912 1.912 0 011.903-1.912z" />
                </svg>
                <span className="text-[12px] font-semibold">{likesCount}</span>
              </button>
              {/* Favorite button */}
              <button
                onClick={() => onToggleFavorite(short.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <svg className="w-5 h-5" fill={short.isFavorite ? '#A29BFE' : 'none'} viewBox="0 0 24 24"
                  stroke={short.isFavorite ? '#A29BFE' : 'white'} strokeWidth={1.5}>
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {short.description && (
            <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {short.description}
            </p>
          )}

          {/* Your rating */}
          <div className="glass p-4 rounded-xl mb-5 flex items-center gap-4 flex-wrap"
            style={{ borderColor: 'rgba(162,155,254,0.1)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>Votre note :</span>
            <StarRating
              rating={short.userRating}
              size="lg"
              interactive
              onRate={(r) => onRate(short.id, r)}
            />
            {short.userRating > 0 && (
              <span className="text-[13px] font-semibold" style={{ color: '#A29BFE' }}>
                {short.userRating}/5
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setTab('overview')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: tab === 'overview' ? 'rgba(162,155,254,0.12)' : 'transparent',
                color: tab === 'overview' ? '#A29BFE' : 'var(--text-muted)',
              }}
            >
              Aperçu
            </button>
            <button
              onClick={() => setTab('reviews')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: tab === 'reviews' ? 'rgba(162,155,254,0.12)' : 'transparent',
                color: tab === 'reviews' ? '#A29BFE' : 'var(--text-muted)',
              }}
            >
              Avis ({reviews.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'overview' ? (
              <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass p-4 rounded-xl text-center">
                    <div className="text-xl font-display font-semibold" style={{ color: '#A29BFE' }}>
                      {short.rating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mt-1">
                      <StarRating rating={Math.round(short.rating)} size="sm" />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Note moyenne</p>
                  </div>
                  <div className="glass p-4 rounded-xl text-center">
                    <div className="text-xl font-display font-semibold" style={{ color: '#A29BFE' }}>
                      {likesCount}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>J&apos;aime</p>
                  </div>
                  <div className="glass p-4 rounded-xl text-center">
                    <div className="text-xl font-display font-semibold" style={{ color: '#A29BFE' }}>
                      {reviews.length}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>Commentaires</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {/* Write review */}
                <div className="glass p-4 rounded-xl mb-4" style={{ borderColor: 'rgba(162,155,254,0.1)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Votre avis :</span>
                    <StarRating rating={newRating} size="md" interactive onRate={setNewRating} />
                  </div>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Partagez votre avis sur ce short..."
                    className="w-full rounded-xl p-3 text-[13px] resize-none outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--dark-border)',
                      color: 'var(--text-primary)',
                      minHeight: 80,
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(162,155,254,0.4)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--dark-border)'}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={!newReview.trim() || newRating === 0 || isSubmitting}
                      className="px-5 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                      style={{ background: '#A29BFE', color: '#fff' }}
                    >
                      {isSubmitting ? 'Envoi...' : 'Publier'}
                    </button>
                  </div>
                </div>

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                      Aucun avis pour le moment. Soyez le premier !
                    </p>
                  </div>
                ) : (
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
                            style={{ background: 'rgba(162,155,254,0.12)', color: '#A29BFE' }}
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ──
export default function ShineShortsPage() {
  const searchParams = useSearchParams()
  const douleurParam = searchParams.get('douleur')
  const [shorts, setShorts] = useState<ShineShort[]>([])
  const [search, setSearch] = useState('')
  const [selectedShort, setSelectedShort] = useState<ShineShort | null>(null)
  const [activeFilter, setActiveFilter] = useState(douleurParam ? 'douleur' : 'all')
  const [loading, setLoading] = useState(true)
  const [douleurName, setDouleurName] = useState<string | null>(null)

  useEffect(() => {
    async function loadShorts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('shine_shorts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (!data) {
        setShorts([])
        setLoading(false)
        return
      }

      // Fetch douleur name if filtered
      if (douleurParam) {
        const { data: douleur } = await supabase
          .from('douleurs')
          .select('title')
          .eq('id', douleurParam)
          .maybeSingle()
        if (douleur) setDouleurName(douleur.title)
      }

      const mapped: ShineShort[] = data.map((s: any) => {
        const secs = s.duration_seconds ?? 0
        const duration = secs >= 60
          ? `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`
          : `0:${secs.toString().padStart(2, '0')}`
        return {
          id: s.id,
          title: s.title,
          description: s.description || '',
          thumbnail: s.thumbnail_url || '',
          videoUrl: s.video_url || '',
          category: s.category,
          duration,
          durationSeconds: secs,
          rating: 0,
          userRating: 0,
          isFavorite: false,
          reviewCount: 0,
          douleurId: s.douleur_id || null,
        }
      })

      setShorts(mapped)
      setLoading(false)
    }

    loadShorts()
  }, [])

  const handleToggleFavorite = (id: string) => {
    setShorts(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    if (selectedShort?.id === id) {
      setSelectedShort(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleRate = (id: string, rating: number) => {
    setShorts(prev => prev.map(s => s.id === id ? { ...s, userRating: rating } : s))
    if (selectedShort?.id === id) {
      setSelectedShort(prev => prev ? { ...prev, userRating: rating } : null)
    }
  }

  const filteredShorts = shorts.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'douleur'
      ? s.douleurId === douleurParam
      : activeFilter === 'all' || activeFilter === 'favorites' || activeFilter === 'encyclopedie'
      ? (activeFilter === 'favorites' ? s.isFavorite : true)
      : s.category === activeFilter
    return matchSearch && matchFilter
  })

  const getShortsByCategory = (catId: string) => filteredShorts.filter(s => s.category === catId)

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ background: 'linear-gradient(135deg, #A29BFE, #6C5CE7)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8" fill="#09090b" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
          <p className="font-display text-xl font-semibold" style={{ color: '#A29BFE' }}>Shine Shorts</p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Chargement de vos contenus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4" style={{ background: 'linear-gradient(180deg, rgba(162,155,254,0.08) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(162,155,254,0.15)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#A29BFE" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Shine <span style={{ color: '#A29BFE' }}>Shorts</span>
          </h1>
        </div>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Vidéos courtes : cours, astuces, exercices et inspirations.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
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
              placeholder="Rechercher un short, un thème..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--dark-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(162,155,254,0.4)'}
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
                background: activeFilter === 'all' ? '#A29BFE' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'all' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'all' ? 'none' : '1px solid var(--dark-border)',
              }}
            >
              Tout
            </button>
            {douleurParam && (
              <button
                onClick={() => setActiveFilter('douleur')}
                className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                style={{
                  background: activeFilter === 'douleur' ? '#A29BFE' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === 'douleur' ? '#09090b' : 'var(--text-secondary)',
                  border: activeFilter === 'douleur' ? 'none' : '1px solid var(--dark-border)',
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
                background: activeFilter === 'encyclopedie' ? '#A29BFE' : 'rgba(255,255,255,0.06)',
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
                background: activeFilter === 'favorites' ? '#A29BFE' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'favorites' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'favorites' ? 'none' : '1px solid var(--dark-border)',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Favoris
            </button>
            {CATEGORIES.slice(1, 7).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: activeFilter === cat.id ? '#A29BFE' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === cat.id ? '#09090b' : 'var(--text-secondary)',
                  border: activeFilter === cat.id ? 'none' : '1px solid var(--dark-border)',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search results or category filter */}
        {search || (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'encyclopedie' && activeFilter !== 'douleur') ? (
          // Grid view for search/filter
          <div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
              {filteredShorts.length} résultat{filteredShorts.length !== 1 ? 's' : ''}
              {search && <> pour &ldquo;<span style={{ color: '#A29BFE' }}>{search}</span>&rdquo;</>}
            </p>
            {filteredShorts.length === 0 ? (
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredShorts.map((short, i) => (
                  <motion.div
                    key={short.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedShort(short)}
                  >
                    <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                      <div className="relative aspect-[9/16]">
                        {short.thumbnail ? (
                          <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(162,155,254,0.08)' }}>
                            <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="#A29BFE" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {short.duration}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#A29BFE', color: '#fff' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{short.title}</h3>
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
              <svg className="w-5 h-5" fill="#A29BFE" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Mes Favoris
            </h2>
            {filteredShorts.length === 0 ? (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">💜</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun favori
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Ajoutez des shorts à vos favoris pour les retrouver ici.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredShorts.map((short, i) => (
                  <motion.div
                    key={short.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedShort(short)}
                  >
                    <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105">
                      <div className="relative aspect-[9/16]">
                        {short.thumbnail ? (
                          <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(162,155,254,0.08)' }}>
                            <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="#A29BFE" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {short.duration}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{short.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : activeFilter === 'douleur' ? (
          // Douleur-filtered view
          <div>
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#A29BFE' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.884 6.084 2.333M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.884-6.084 2.333M12 6.042V20.333" />
              </svg>
              {douleurName || 'Contenu lié'}
            </h2>
            {filteredShorts.length === 0 ? (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">🎬</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun short lié
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Aucun short n&apos;est associé à cette douleur pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredShorts.map((short, i) => (
                  <motion.div
                    key={short.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedShort(short)}
                  >
                    <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105">
                      <div className="relative aspect-[9/16]">
                        <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                          {short.duration}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{short.title}</h3>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#A29BFE' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Encyclopédie A — Z
            </h2>
            {(() => {
              const sorted = [...shorts].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
              const grouped: Record<string, ShineShort[]> = {}
              sorted.forEach(s => {
                const letter = s.title.charAt(0).toUpperCase().match(/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÆŒÇ]/i)
                  ? s.title.charAt(0).toUpperCase() : '#'
                if (!grouped[letter]) grouped[letter] = []
                grouped[letter].push(s)
              })
              const letters = Object.keys(grouped).sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'fr'))

              return (
                <>
                  {/* Letter nav */}
                  <div className="flex flex-wrap gap-1.5">
                    {letters.map(letter => (
                      <a
                        key={letter}
                        href={`#letter-shorts-${letter}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors hover:opacity-80"
                        style={{ background: 'rgba(162,155,254,0.1)', color: '#A29BFE' }}
                      >
                        {letter}
                      </a>
                    ))}
                  </div>

                  {/* Letter groups */}
                  {letters.map(letter => (
                    <div key={letter} id={`letter-shorts-${letter}`} className="scroll-mt-24">
                      <h3 className="font-display text-2xl font-bold mb-3 pb-2" style={{ color: '#A29BFE', borderBottom: '1px solid var(--dark-border)' }}>
                        {letter}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {grouped[letter].map((short, i) => (
                          <motion.div
                            key={short.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.3 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedShort(short)}
                          >
                            <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                              <div className="relative aspect-[9/16]">
                                {short.thumbnail ? (
                                  <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(162,155,254,0.08)' }}>
                                    <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="#A29BFE" strokeWidth={1}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                    </svg>
                                  </div>
                                )}
                                <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                                  {short.duration}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#A29BFE', color: '#fff' }}>
                                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <h3 className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{short.title}</h3>
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
          // Category rows view
          <div className="space-y-8">
            {CATEGORIES.map(cat => {
              const catShorts = getShortsByCategory(cat.id)
              if (catShorts.length === 0) return null
              return (
                <ShortRow
                  key={cat.id}
                  title={cat.label}
                  icon={cat.icon}
                  shorts={catShorts}
                  onSelect={setSelectedShort}
                />
              )
            })}

            {shorts.length === 0 && (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Bientôt disponible
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Les Shine Shorts arrivent prochainement. Restez connecté !
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedShort && (
          <VideoPlayerModal
            short={selectedShort}
            onClose={() => setSelectedShort(null)}
            onToggleFavorite={handleToggleFavorite}
            onRate={handleRate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

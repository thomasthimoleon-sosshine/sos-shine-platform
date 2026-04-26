'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import FeatureGate from '@/components/FeatureGate'

// ── PDF Reader Modal (anti-download) ──
function PdfReaderModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  useEffect(() => {
    // Block keyboard shortcuts for download/print
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'P')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    // Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('contextmenu', handleContextMenu, true)
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
      document.body.style.overflow = ''
    }
  }, [])

  // Add #toolbar=0&navpanes=0 to hide PDF viewer controls (download, print)
  const safeUrl = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: '#09090b' }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            style={{ color: 'var(--brand)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h2 className="font-display text-[15px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* PDF iframe - fills remaining space */}
      <div className="flex-1 relative select-none">
        <iframe
          src={safeUrl}
          className="w-full h-full border-0"
          title={title}
          style={{ pointerEvents: 'auto' }}
        />
        {/* Invisible overlay on corners to block download button clicks in some browsers */}
        <div className="absolute top-0 right-0 w-14 h-14" style={{ background: 'transparent' }}
          onContextMenu={(e) => e.preventDefault()} />
      </div>

      {/* Bottom info bar */}
      <div className="flex items-center justify-center px-4 py-2 shrink-0"
        style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border)' }}>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Lecture en ligne uniquement — Téléchargement non autorisé
        </p>
      </div>
    </motion.div>
  )
}

// ── Types ──
type ShineBook = {
  id: string
  title: string
  author: string
  description: string
  cover: string
  pdfUrl: string
  category: string
  contentType: 'ebook' | 'guide' | 'workbook' | 'journal' | 'protocol'
  pageCount: number
  year: number
  rating: number
  userRating: number
  isFavorite: boolean
  isFeatured: boolean
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
const CATEGORIES = [
  { id: 'featured', label: 'En vedette', icon: '⭐' },
  { id: 'healing', label: 'Guérison intérieure', icon: '🌿' },
  { id: 'confidence', label: 'Confiance en soi', icon: '💪' },
  { id: 'relationships', label: 'Relations saines', icon: '💛' },
  { id: 'resilience', label: 'Résilience', icon: '🔥' },
  { id: 'anxiety', label: 'Anxiété & Stress', icon: '🧠' },
  { id: 'grief', label: 'Deuil & Perte', icon: '🕊️' },
  { id: 'trauma', label: 'Trauma', icon: '💎' },
  { id: 'self-love', label: 'Amour de soi', icon: '🩷' },
  { id: 'spirituality', label: 'Spiritualité', icon: '🙏' },
  { id: 'gratitude', label: 'Gratitude & Joie', icon: '✨' },
  { id: 'children', label: 'Enfants', icon: '👶' },
]

const CONTENT_TYPES = [
  { id: 'all', label: 'Tout', icon: '' },
  { id: 'ebook', label: 'eBooks', icon: '📖' },
  { id: 'guide', label: 'Guides', icon: '📋' },
  { id: 'workbook', label: 'Cahiers', icon: '✍️' },
  { id: 'journal', label: 'Journaux', icon: '📓' },
  { id: 'protocol', label: 'Protocoles', icon: '🩺' },
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
function BookRow({ title, icon, books, onSelect }: {
  title: string
  icon: string
  books: ShineBook[]
  onSelect: (b: ShineBook) => void
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
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="shrink-0 group/card cursor-pointer"
            style={{ scrollSnapAlign: 'start', width: 'clamp(150px, 16vw, 200px)' }}
            onClick={() => onSelect(book)}
          >
            <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover/card:scale-105 group-hover/card:z-10 group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
              {/* Cover */}
              <div className="relative aspect-[3/4]" style={{ background: 'rgba(212,175,55,0.05)' }}>
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 gap-1"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))' }}>
                    <span className="text-4xl opacity-20">📖</span>
                    <span className="text-[10px] text-center font-medium opacity-30" style={{ color: 'var(--text-muted)' }}>{book.title}</span>
                  </div>
                )}
                {/* Page count badge */}
                {book.pageCount > 0 && (
                  <span
                    className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                  >
                    {book.pageCount} p.
                  </span>
                )}
                {/* Favorite heart */}
                {book.isFavorite && (
                  <span className="absolute top-2 right-2">
                    <svg className="w-4 h-4" fill="#D4AF37" viewBox="0 0 24 24" stroke="none">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </span>
                )}
                {/* Featured badge */}
                {book.isFeatured && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(212,175,55,0.9)', color: '#fff' }}>
                    VEDETTE
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--brand)', color: '#09090b' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">Lire</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Title + author below card */}
            <div className="mt-2 px-0.5">
              <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {book.title}
              </h3>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {book.author}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(book.rating)} size="sm" />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {book.rating.toFixed(1)}
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
function HeroBanner({ book, onOpen }: { book: ShineBook; onOpen: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 'clamp(300px, 50vh, 550px)' }}>
      {book.cover ? (
        <img src={book.cover} alt={book.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)' }} />
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(9,9,11,1))' }} />
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.95) 30%, rgba(9,9,11,0.6) 60%, rgba(9,9,11,0.3))' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, transparent 40%)' }} />

      <div className="absolute bottom-0 left-0 p-6 sm:p-10 max-w-2xl z-10 flex gap-6 items-end">
        {/* Book cover */}
        {book.cover && (
          <div className="hidden sm:block shrink-0 w-40 rounded-lg overflow-hidden shadow-2xl shadow-black/60" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
            <img src={book.cover} alt={book.title} className="w-full aspect-[3/4] object-cover" />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
            style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--brand)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
            Recommandé pour vous
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2" style={{ color: '#fff' }}>
            {book.title}
          </h1>
          <p className="text-[13px] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>par {book.author}</p>
          <p className="text-[14px] leading-relaxed mb-5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {book.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpen}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--brand)', color: '#09090b' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Lire maintenant
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
            <StarRating rating={Math.round(book.rating)} size="sm" />
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {book.rating.toFixed(1)} / 5 · {book.reviewCount} avis · {book.pageCount} pages
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── Book Detail Modal ──
function BookModal({ book, onClose, onToggleFavorite, onRate, onRead }: {
  book: ShineBook
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onRate: (id: string, rating: number) => void
  onRead: (book: ShineBook) => void
}) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview')
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const typeLabels: Record<string, string> = {
    ebook: 'eBook', guide: 'Guide pratique', workbook: "Cahier d'exercices",
    journal: 'Journal guidé', protocol: 'Protocole de soin',
  }

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) return
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('shine_library_reviews').insert({
        user_id: user.id,
        book_id: book.id,
        content: newReview.trim(),
        rating: newRating,
      })

      setReviews(prev => [{
        id: `r-new-${Date.now()}`, author: 'Vous', avatar: '', rating: newRating,
        text: newReview, date: "À l'instant",
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

        {/* Top section with cover + info */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
          {/* Cover */}
          <div className="shrink-0 w-48 mx-auto sm:mx-0">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl shadow-black/60"
              style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl opacity-20"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.02))' }}>
                  📖
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {book.title}
                </h2>
                <p className="text-[14px] mb-3" style={{ color: 'var(--text-muted)' }}>par {book.author}</p>
              </div>
              {/* Favorite */}
              <button
                onClick={() => onToggleFavorite(book.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <svg className="w-5 h-5" fill={book.isFavorite ? '#D4AF37' : 'none'} viewBox="0 0 24 24"
                  stroke={book.isFavorite ? '#D4AF37' : 'white'} strokeWidth={1.5}>
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--brand)' }}>
                {typeLabels[book.contentType] || book.contentType}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{book.year}</span>
              {book.pageCount > 0 && (
                <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{book.pageCount} pages</span>
              )}
            </div>

            <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              {book.description}
            </p>

            {/* Read button */}
            {book.pdfUrl && (
              <button
                onClick={() => onRead(book)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{ background: 'var(--brand)', color: '#09090b' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Lire le PDF
              </button>
            )}

            {/* Your rating */}
            <div className="glass p-4 rounded-xl mt-5 flex items-center gap-4 flex-wrap"
              style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>Votre note :</span>
              <StarRating
                rating={book.userRating}
                size="lg"
                interactive
                onRate={(r) => onRate(book.id, r)}
              />
              {book.userRating > 0 && (
                <span className="text-[13px] font-semibold" style={{ color: 'var(--brand)' }}>
                  {book.userRating}/5
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 sm:px-8">
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setTab('overview')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: tab === 'overview' ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: tab === 'overview' ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              Aperçu
            </button>
            <button
              onClick={() => setTab('reviews')}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200"
              style={{
                background: tab === 'reviews' ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: tab === 'reviews' ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              Avis ({reviews.length})
            </button>
          </div>

          <div className="pb-8">
            <AnimatePresence mode="wait">
              {tab === 'overview' ? (
                <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-xl text-center">
                      <div className="text-2xl font-display font-semibold" style={{ color: 'var(--brand)' }}>
                        {book.rating.toFixed(1)}
                      </div>
                      <div className="flex justify-center mt-1">
                        <StarRating rating={Math.round(book.rating)} size="sm" />
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Note moyenne</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                      <div className="text-2xl font-display font-semibold" style={{ color: 'var(--brand)' }}>
                        {book.reviewCount}
                      </div>
                      <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>Avis membres</p>
                    </div>
                  </div>
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
                      placeholder="Partagez votre avis sur ce livre..."
                      className="w-full rounded-xl p-3 text-[13px] resize-none outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        minHeight: 80,
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
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
                        className="glass p-4 rounded-xl"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--brand)' }}
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
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ──
export default function ShineLibrairiePage() {
  const searchParams = useSearchParams()
  const douleurParam = searchParams.get('douleur')
  const [books, setBooks] = useState<ShineBook[]>([])
  const [search, setSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<ShineBook | null>(null)
  const [readingBook, setReadingBook] = useState<ShineBook | null>(null)
  const [activeFilter, setActiveFilter] = useState(douleurParam ? 'douleur' : 'all')
  const [activeType, setActiveType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [douleurName, setDouleurName] = useState<string | null>(null)

  useEffect(() => {
    async function loadBooks() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Load published books
      const { data: booksData } = await supabase
        .from('shine_library_books')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (!booksData || booksData.length === 0) {
        setBooks([])
        setLoading(false)
        return
      }

      // Load user favorites
      let favoriteIds: string[] = []
      if (user) {
        const { data: favData } = await supabase
          .from('shine_library_favorites')
          .select('book_id')
          .eq('user_id', user.id)
        favoriteIds = (favData || []).map(f => f.book_id)
      }

      // Load user ratings
      const userRatingsMap: Record<string, number> = {}
      if (user) {
        const { data: ratingsData } = await supabase
          .from('shine_library_ratings')
          .select('book_id, rating')
          .eq('user_id', user.id)
        for (const r of ratingsData || []) {
          userRatingsMap[r.book_id] = r.rating
        }
      }

      // Load average ratings & review counts
      const bookIds = booksData.map(b => b.id)
      const { data: avgRatings } = await supabase
        .from('shine_library_ratings')
        .select('book_id, rating')
        .in('book_id', bookIds)

      const { data: reviewCounts } = await supabase
        .from('shine_library_reviews')
        .select('book_id')
        .in('book_id', bookIds)

      const avgMap: Record<string, { sum: number; count: number }> = {}
      for (const r of avgRatings || []) {
        if (!avgMap[r.book_id]) avgMap[r.book_id] = { sum: 0, count: 0 }
        avgMap[r.book_id].sum += r.rating
        avgMap[r.book_id].count++
      }

      const reviewCountMap: Record<string, number> = {}
      for (const r of reviewCounts || []) {
        reviewCountMap[r.book_id] = (reviewCountMap[r.book_id] || 0) + 1
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

      const mapped: ShineBook[] = booksData.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author || 'SOS Shine',
        description: b.description || '',
        cover: b.cover_url || '',
        pdfUrl: b.pdf_url || '',
        category: b.category,
        contentType: b.content_type,
        pageCount: b.page_count || 0,
        year: b.year || new Date().getFullYear(),
        rating: avgMap[b.id] ? avgMap[b.id].sum / avgMap[b.id].count : 0,
        userRating: userRatingsMap[b.id] || 0,
        isFavorite: favoriteIds.includes(b.id),
        isFeatured: b.is_featured || false,
        reviewCount: reviewCountMap[b.id] || 0,
        douleurId: b.douleur_id || null,
      }))

      setBooks(mapped)
      setLoading(false)
    }

    loadBooks()
  }, [])

  const handleToggleFavorite = async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const book = books.find(b => b.id === id)
    if (!book) return

    if (book.isFavorite) {
      await supabase.from('shine_library_favorites').delete().eq('user_id', user.id).eq('book_id', id)
    } else {
      await supabase.from('shine_library_favorites').insert({ user_id: user.id, book_id: id })
    }

    setBooks(prev => prev.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
    if (selectedBook?.id === id) {
      setSelectedBook(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleRate = async (id: string, rating: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('shine_library_ratings').upsert({
      user_id: user.id,
      book_id: id,
      rating,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,book_id' })

    setBooks(prev => prev.map(b => b.id === id ? { ...b, userRating: rating } : b))
    if (selectedBook?.id === id) {
      setSelectedBook(prev => prev ? { ...prev, userRating: rating } : null)
    }
  }

  const filteredBooks = books.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'douleur'
      ? b.douleurId === douleurParam
      : activeFilter === 'all' || activeFilter === 'favorites'
        ? (activeFilter === 'favorites' ? b.isFavorite : true)
        : activeFilter === 'featured' ? b.isFeatured : b.category === activeFilter
    const matchType = activeType === 'all' || b.contentType === activeType
    return matchSearch && matchFilter && matchType
  })

  const getBooksByCategory = (catId: string) => {
    if (catId === 'featured') return filteredBooks.filter(b => b.isFeatured)
    return filteredBooks.filter(b => b.category === catId)
  }

  const heroBook = books.find(b => b.isFeatured) || books[0]

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8" fill="#09090b" viewBox="0 0 24 24" stroke="none">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          </div>
          <p className="font-display text-xl font-semibold" style={{ color: 'var(--brand)' }}>Shine Librairie</p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Chargement de vos livres...</p>
        </div>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">📚</div>
          <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Shine Librairie</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            La librairie arrive bientôt ! Nos eBooks, guides pratiques et protocoles de soin seront disponibles ici.
          </p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate featureKey="shine_librairie">
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Hero */}
      {heroBook && !search && activeFilter === 'all' && activeType === 'all' && (
        <HeroBanner book={heroBook} onOpen={() => setSelectedBook(heroBook)} />
      )}

      <div className="px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Search + Filters bar */}
        <div className="flex flex-col gap-4">
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
                placeholder="Rechercher un livre, un auteur..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
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
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.id}
                  onClick={() => setActiveType(ct.id)}
                  className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: activeType === ct.id ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                    color: activeType === ct.id ? '#09090b' : 'var(--text-secondary)',
                    border: activeType === ct.id ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {ct.icon} {ct.label}
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
                background: activeFilter === 'all' ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'all' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'all' ? 'none' : '1px solid var(--border)',
              }}
            >
              Tout
            </button>
            {douleurParam && (
              <button
                onClick={() => setActiveFilter('douleur')}
                className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                style={{
                  background: activeFilter === 'douleur' ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === 'douleur' ? '#09090b' : 'var(--text-secondary)',
                  border: activeFilter === 'douleur' ? 'none' : '1px solid var(--border)',
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
                background: activeFilter === 'encyclopedie' ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'encyclopedie' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'encyclopedie' ? 'none' : '1px solid var(--border)',
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
                background: activeFilter === 'favorites' ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === 'favorites' ? '#09090b' : 'var(--text-secondary)',
                border: activeFilter === 'favorites' ? 'none' : '1px solid var(--border)',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Favoris
            </button>
            {CATEGORIES.slice(0, 8).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className="shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: activeFilter === cat.id ? 'var(--brand)' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === cat.id ? '#09090b' : 'var(--text-secondary)',
                  border: activeFilter === cat.id ? 'none' : '1px solid var(--border)',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search results or category rows */}
        {search || (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'encyclopedie' && activeFilter !== 'douleur') || activeType !== 'all' ? (
          // Grid view for search/filter
          <div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
              {filteredBooks.length} résultat{filteredBooks.length !== 1 ? 's' : ''}
              {search && <> pour &ldquo;<span style={{ color: 'var(--brand)' }}>{search}</span>&rdquo;</>}
            </p>
            {filteredBooks.length === 0 ? (
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {filteredBooks.map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                      <div className="relative aspect-[3/4]" style={{ background: 'rgba(212,175,55,0.05)' }}>
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📖</div>
                        )}
                        {book.pageCount > 0 && (
                          <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}>
                            {book.pageCount} p.
                          </span>
                        )}
                        {book.isFavorite && (
                          <span className="absolute top-2 right-2">
                            <svg className="w-4 h-4" fill="#D4AF37" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                          </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand)', color: '#09090b' }}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(book.rating)} size="sm" />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{book.rating > 0 ? book.rating.toFixed(1) : '—'}</span>
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
            {filteredBooks.length === 0 ? (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">💛</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun favori
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Ajoutez des livres à vos favoris pour les retrouver ici.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {filteredBooks.map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105">
                      <div className="relative aspect-[3/4]" style={{ background: 'rgba(212,175,55,0.05)' }}>
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📖</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--brand)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.884 6.084 2.333M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.884-6.084 2.333M12 6.042V20.333" />
              </svg>
              {douleurName || 'Contenu lié'}
            </h2>
            {filteredBooks.length === 0 ? (
              <div className="glass p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun livre lié
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Aucun livre n&apos;est associé à cette douleur pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredBooks.map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                      <div className="relative aspect-[2/3]">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--brand)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Encyclopédie A — Z
            </h2>
            {(() => {
              const sorted = [...books].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
              const grouped: Record<string, ShineBook[]> = {}
              sorted.forEach(b => {
                const letter = b.title.charAt(0).toUpperCase().match(/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÆŒÇ]/i)
                  ? b.title.charAt(0).toUpperCase() : '#'
                if (!grouped[letter]) grouped[letter] = []
                grouped[letter].push(b)
              })
              const letters = Object.keys(grouped).sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'fr'))

              return (
                <>
                  {/* Letter nav */}
                  <div className="flex flex-wrap gap-1.5">
                    {letters.map(letter => (
                      <a
                        key={letter}
                        href={`#letter-lib-${letter}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors hover:opacity-80"
                        style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--brand)' }}
                      >
                        {letter}
                      </a>
                    ))}
                  </div>

                  {/* Letter groups */}
                  {letters.map(letter => (
                    <div key={letter} id={`letter-lib-${letter}`} className="scroll-mt-24">
                      <h3 className="font-display text-2xl font-bold mb-3 pb-2" style={{ color: 'var(--brand)', borderBottom: '1px solid var(--border)' }}>
                        {letter}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {grouped[letter].map((book, i) => (
                          <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.3 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedBook(book)}
                          >
                            <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50">
                              <div className="relative aspect-[3/4]" style={{ background: 'rgba(212,175,55,0.05)' }}>
                                {book.cover ? (
                                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📖</div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
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
          // Rows view (like Netflix)
          <div className="space-y-8">
            {/* Featured row first */}
            {books.some(b => b.isFeatured) && (
              <BookRow
                title="En vedette"
                icon="⭐"
                books={books.filter(b => b.isFeatured)}
                onSelect={setSelectedBook}
              />
            )}
            {CATEGORIES.filter(c => c.id !== 'featured').map(cat => {
              const catBooks = getBooksByCategory(cat.id)
              if (catBooks.length === 0) return null
              return (
                <BookRow
                  key={cat.id}
                  title={cat.label}
                  icon={cat.icon}
                  books={catBooks}
                  onSelect={setSelectedBook}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onToggleFavorite={handleToggleFavorite}
            onRate={handleRate}
            onRead={(book) => { setSelectedBook(null); setReadingBook(book) }}
          />
        )}
      </AnimatePresence>

      {/* PDF Reader Modal (anti-download) */}
      <AnimatePresence>
        {readingBook && (
          <PdfReaderModal
            url={readingBook.pdfUrl}
            title={readingBook.title}
            onClose={() => setReadingBook(null)}
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
    </FeatureGate>
  )
}

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import FeatureGate from '@/components/FeatureGate'

// ── Types ──
type ShineVideo = {
  id: string
  title: string
  description: string
  thumbnail: string
  thumbnailDesktop: string | null
  videoUrl: string
  subtitleUrl: string
  category: string
  duration: string
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
      <h2 className="text-lg font-display font-semibold mb-3 px-1 flex items-center gap-2 text-[var(--text-primary)]">
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
                  className="w-full h-full object-contain bg-black/40"
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
                    <svg className="w-4 h-4" fill="var(--brand)" viewBox="0 0 24 24" stroke="none">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--brand)', color: '#09090b' }}
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
              <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(video.rating)} size="sm" />
                <span className="text-[11px] text-[var(--text-muted)]">
                  {video.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
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
function HeroBanner({ video, onOpen, onInfo }: { video: ShineVideo; onOpen: () => void; onInfo: () => void }) {
  return (
    <>
      {/* ─── Mobile: image compl\u00e8te en haut + infos en dessous ─── */}
      <div className="sm:hidden w-full">
        {/* Image compl\u00e8te visible */}
        <div className="relative w-full">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-auto object-contain"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(9,9,11,0.3) 30%, transparent 60%)' }} />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(9,9,11,0.7)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.3)', backdropFilter: 'blur(8px)' }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
            Recommand&eacute; pour vous
          </span>
        </div>
        {/* Infos sous l'image */}
        <div className="px-4 -mt-10 relative z-10 pb-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-2xl font-semibold tracking-tight mb-2" style={{ color: '#fff' }}>
              {video.title}
            </h1>
            <p className="text-[13px] leading-relaxed mb-4 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {video.description}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onOpen}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105"
                style={{ background: 'var(--brand)', color: '#09090b' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Regarder
              </button>
              <button onClick={onInfo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Plus d&apos;infos
              </button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={Math.round(video.rating)} size="sm" />
              <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {video.rating.toFixed(1)} / 5 · {video.reviewCount} avis · {video.duration}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Desktop: layout Netflix classique avec overlay ─── */}
      <div className="hidden sm:block relative w-full overflow-hidden sm:rounded-2xl" style={{ height: 'clamp(400px, 55vh, 600px)' }}>
        <img
          src={video.thumbnailDesktop || video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.92) 25%, rgba(9,9,11,0.5) 55%, rgba(9,9,11,0.15))' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(9,9,11,0.3) 25%, transparent 50%)' }} />

        <div className="absolute bottom-0 left-0 p-10 max-w-xl z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
              style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.3)' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
              Recommand&eacute; pour vous
            </span>
            <h1 className="font-display text-5xl font-semibold tracking-tight mb-3" style={{ color: '#fff' }}>
              {video.title}
            </h1>
            <p className="text-[15px] leading-relaxed mb-5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {video.description}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={onOpen}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105"
                style={{ background: 'var(--brand)', color: '#09090b' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Regarder
              </button>
              <button onClick={onInfo}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
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
    </>
  )
}

// ── Netflix-Style Full Screen Player ──
function FullScreenPlayer({ video, onClose, onShowInfo }: {
  video: ShineVideo
  onClose: () => void
  onShowInfo: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [subtitlesOn, setSubtitlesOn] = useState(true)
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false)
  const [isCasting, setIsCasting] = useState(false)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    resetHideTimer()
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [resetHideTimer])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('fullscreen-player-toggle', { detail: true }))
    return () => {
      window.dispatchEvent(new CustomEvent('fullscreen-player-toggle', { detail: false }))
    }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlay()
      }
      if (e.key === 'f') toggleFullscreen()
      if (e.key === 'm') toggleMute()
      if (e.key === 'ArrowRight') skip(10)
      if (e.key === 'ArrowLeft') skip(-10)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPlaying])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setIsPlaying(true) }
    else { v.pause(); setIsPlaying(false) }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }

  const toggleFullscreen = async () => {
    const v = videoRef.current as any
    const el = containerRef.current
    if (!el) return

    // Check if already fullscreen
    const isFS = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)

    if (isFS) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen()
      } catch {}
      setIsFullscreen(false)
    } else {
      try {
        // Try container first (desktop browsers)
        if (el.requestFullscreen) {
          await el.requestFullscreen()
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen()
        // Fallback to video element (iOS Safari)
        } else if (v?.webkitEnterFullscreen) {
          v.webkitEnterFullscreen()
        } else if (v?.requestFullscreen) {
          await v.requestFullscreen()
        }
        setIsFullscreen(true)
      } catch {
        // Last resort: try video element directly
        try {
          if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen()
        } catch {}
      }
    }
  }

  const skip = (seconds: number) => {
    const v = videoRef.current
    if (v) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds))
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = pct * v.duration
  }

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.volume = val
    v.muted = val === 0
    setVolume(val)
    setIsMuted(val === 0)
  }

  const toggleSubtitles = () => {
    const v = videoRef.current
    if (!v) return
    const track = v.textTracks[0]
    if (track) {
      const newState = !subtitlesOn
      track.mode = newState ? 'showing' : 'hidden'
      setSubtitlesOn(newState)
    }
    setShowSubtitleMenu(false)
  }

  // AirPlay (Safari / Apple TV)
  const startAirPlay = () => {
    const v = videoRef.current as any
    if (!v) return
    if (v.webkitShowPlaybackTargetPicker) {
      v.webkitShowPlaybackTargetPicker()
    } else {
      alert('AirPlay est disponible uniquement sur Safari (Mac, iPhone, iPad).\n\nSur Chrome, utilisez le bouton Chromecast à côté.')
    }
  }

  // Chromecast only (AirPlay has its own dedicated button)
  const startCast = async () => {
    const v = videoRef.current as any
    if (!v) return

    // 1. Try Google Cast Framework API (if SDK loaded)
    const castCtx = (window as any).cast?.framework?.CastContext?.getInstance()
    if (castCtx) {
      try {
        await castCtx.requestSession()
        const session = castCtx.getCurrentSession()
        if (session) {
          const chrome = (window as any).chrome
          const mediaInfo = new chrome.cast.media.MediaInfo(video.videoUrl, 'video/mp4')
          mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata()
          mediaInfo.metadata.title = video.title
          if (video.thumbnail) mediaInfo.metadata.images = [{ url: video.thumbnail }]
          const request = new chrome.cast.media.LoadRequest(mediaInfo)
          await session.loadMedia(request)
          setIsCasting(true)
          return
        }
      } catch {
        // User cancelled or no device
      }
    }

    // 2. Try Remote Playback API (Chrome/Edge)
    if (v.remote && typeof v.remote.prompt === 'function') {
      try {
        await v.remote.prompt()
        setIsCasting(true)
        v.remote.onconnecting = () => setIsCasting(true)
        v.remote.onconnect = () => setIsCasting(true)
        v.remote.ondisconnect = () => setIsCasting(false)
        return
      } catch {
        setIsCasting(false)
      }
    }

    // 3. No Chromecast method available - guide the user
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    if (isSafari) {
      alert('Chromecast n\'est pas supporté sur Safari.\n\nPour caster sur Apple TV, utilisez le bouton AirPlay juste à côté.\n\nPour Chromecast, ouvrez cette page dans Google Chrome.')
    } else {
      alert('Pour caster sur Chromecast :\n\n1. Cliquez sur les 3 points (⋮) en haut à droite de Chrome\n2. Sélectionnez "Caster..."\n3. Choisissez votre appareil Chromecast')
    }
  }

  // Sync fullscreen state when user exits via Escape or browser UI
  useEffect(() => {
    const handler = () => {
      const isFS = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      setIsFullscreen(isFS)
    }
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  // Listen for AirPlay availability
  useEffect(() => {
    const v = videoRef.current as any
    if (!v) return
    const handlePlaying = () => {
      if (v.webkitCurrentPlaybackTargetIsWireless) setIsCasting(true)
    }
    v.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', handlePlaying)
    return () => v.removeEventListener('webkitcurrentplaybacktargetiswirelesschanged', handlePlaying)
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center cursor-none"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
    >
      {/* Video */}
      {video.videoUrl ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          autoPlay
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
          controlsList="nodownload"
          onTimeUpdate={() => {
            const v = videoRef.current
            if (!v) return
            setCurrentTime(v.currentTime)
            setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0)
          }}
          onLoadedMetadata={() => {
            const v = videoRef.current
            if (v) { setDuration(v.duration); v.volume = volume }
          }}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          {video.subtitleUrl && (
            <track
              kind="subtitles"
              src={video.subtitleUrl}
              srcLang="fr"
              label="Fran\u00e7ais"
              default
            />
          )}
        </video>
      ) : (
        <div className="w-full h-full relative">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-contain" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-lg">Vidéo non disponible</p>
          </div>
        </div>
      )}

      {/* Top bar - Back + Title */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center gap-4 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)', pointerEvents: showControls ? 'auto' : 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white text-lg sm:text-xl font-display font-semibold truncate">{video.title}</h2>
          <div className="flex items-center gap-2">
            <p className="text-white/50 text-[12px]">{video.category} · {video.year}</p>
            {isCasting && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(201,169,97,0.2)', color: 'var(--brand)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
                Casting
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onShowInfo}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          title="Plus d'infos"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </button>
      </motion.div>

      {/* Center play/pause indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,169,97,0.9)' }}>
              <svg className="w-10 h-10 ml-1" fill="#09090b" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls bar */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-16 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', pointerEvents: showControls ? 'auto' : 'none' }}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetHideTimer}
        onTouchStart={resetHideTimer}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full cursor-pointer mb-4 group/progress relative"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full relative transition-all"
            style={{ width: `${progress}%`, background: 'var(--brand)' }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ background: 'var(--brand)', boxShadow: '0 0 8px rgba(201,169,97,0.5)' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              {isPlaying ? (
                <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
              ) : (
                <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            {/* Skip backward */}
            <button onClick={() => skip(-10)} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>

            {/* Skip forward */}
            <button onClick={() => skip(10)} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
              </svg>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                )}
              </button>
              <div
                className="w-20 h-1 rounded-full cursor-pointer hidden sm:block"
                style={{ background: 'rgba(255,255,255,0.2)' }}
                onClick={handleVolumeChange}
              >
                <div className="h-full rounded-full" style={{ width: `${isMuted ? 0 : volume * 100}%`, background: 'white' }} />
              </div>
            </div>

            {/* Time */}
            <span className="text-white text-[13px] font-mono hidden sm:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Subtitles toggle */}
            {video.subtitleUrl && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSubtitleMenu(!showSubtitleMenu) }}
                  className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative"
                  title="Sous-titres"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  {subtitlesOn && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: 'var(--brand)' }} />
                  )}
                </button>
                {showSubtitleMenu && (
                  <div
                    className="absolute bottom-full right-0 mb-2 rounded-lg p-2 min-w-[160px]"
                    style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.15)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[11px] font-semibold px-2 py-1 mb-1 text-[var(--text-muted)]">Sous-titres</p>
                    <button
                      onClick={toggleSubtitles}
                      className="w-full text-left px-2 py-1.5 rounded text-[13px] flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
                      style={{ color: !subtitlesOn ? 'white' : 'var(--text-muted)' }}
                    >
                      {!subtitlesOn && <span className="text-[var(--brand)]">&#10003;</span>}
                      D&eacute;sactiv&eacute;s
                    </button>
                    <button
                      onClick={toggleSubtitles}
                      className="w-full text-left px-2 py-1.5 rounded text-[13px] flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
                      style={{ color: subtitlesOn ? 'white' : 'var(--text-muted)' }}
                    >
                      {subtitlesOn && <span className="text-[var(--brand)]">&#10003;</span>}
                      Fran&ccedil;ais
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AirPlay (Safari) */}
            <button
              onClick={(e) => { e.stopPropagation(); startAirPlay() }}
              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform rounded-full hover:bg-white/10 active:bg-white/20"
              title="AirPlay"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18v12H3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21l5-5 5 5H7z" fill={isCasting ? 'var(--brand)' : 'none'} stroke={isCasting ? 'var(--brand)' : 'white'} />
              </svg>
            </button>

            {/* Chromecast / Remote Playback */}
            <button
              onClick={(e) => { e.stopPropagation(); startCast() }}
              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform rounded-full hover:bg-white/10 active:bg-white/20"
              title="Caster sur un appareil"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={isCasting ? 'var(--brand)' : 'white'} strokeWidth={1.5}>
                <path d="M2 16.1A5 5 0 015.9 20M2 12.05A9 9 0 019.95 20M2 8V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2h-6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="2" cy="20" r="1" fill={isCasting ? 'var(--brand)' : 'white'} stroke="none" />
              </svg>
            </button>

            {/* Fullscreen */}
            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen() }} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform rounded-full hover:bg-white/10 active:bg-white/20" title="Plein &eacute;cran (F)">
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Video Detail Modal ──
function VideoModal({ video, onClose, onToggleFavorite, onRate, onWatch }: {
  video: ShineVideo
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onRate: (id: string, rating: number) => void
  onWatch: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview')
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copyDone, setCopyDone] = useState(false)
  const [rayons, setRayons] = useState<{ id: string; name: string; avatar: string | null; partnerId: string }[]>([])
  const [rayonSearch, setRayonSearch] = useState('')
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())

  async function loadRayons() {
    const res = await fetch('/api/rayons')
    if (!res.ok) return
    const json = await res.json()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const connections = (json.connections || []) as { id: string; sender_id: string; receiver_id: string; profiles: Record<string, { prenom: string; pseudo: string | null; avatar_url: string | null }> }[]
    setRayons(connections.map(c => {
      const partnerId = c.sender_id === user.id ? c.receiver_id : c.sender_id
      const p = c.profiles?.[partnerId]
      return { id: c.id, partnerId, name: p?.pseudo || p?.prenom || 'Membre', avatar: p?.avatar_url || null }
    }))
  }

  function handleOpenShare() {
    setShowShare(true)
    if (rayons.length === 0) loadRayons()
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/shine-tv/preview/${video.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2500)
    })
  }

  async function handleSendToRayon(partnerId: string) {
    if (sentTo.has(partnerId)) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const previewUrl = `${window.location.origin}/shine-tv/preview/${video.id}`
    await supabase.from('private_messages').insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content: `🎬 Je partage avec toi cette vidéo Shine TV : *${video.title}*\n${previewUrl}`,
      message_type: 'text',
    })
    setSentTo(prev => new Set([...prev, partnerId]))
  }

  const filteredRayons = rayons.filter(r => r.name.toLowerCase().includes(rayonSearch.toLowerCase()))

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) return
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('shine_tv_reviews').insert({
        user_id: user.id,
        video_id: video.id,
        content: newReview.trim(),
        rating: newRating,
      })

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

        {/* Video preview - click to launch full player */}
        <div className="relative aspect-video bg-black cursor-pointer group/preview" onClick={onWatch}>
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface-card), transparent 50%)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-200 group-hover/preview:scale-110"
              style={{ background: 'rgba(201,169,97,0.9)', color: '#09090b' }}
            >
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[12px] font-semibold opacity-0 group-hover/preview:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
            Lancer la lecture
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2 text-[var(--text-primary)]">
                {video.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className="text-[13px] font-medium text-[var(--brand)]">{video.year}</span>
                <span className="text-[13px] text-[var(--text-muted)]">{video.duration}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium"
                  style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
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
                <svg className="w-5 h-5" fill={video.isFavorite ? 'var(--brand)' : 'none'} viewBox="0 0 24 24"
                  stroke={video.isFavorite ? 'var(--brand)' : 'white'} strokeWidth={1.5}>
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
              <button
                onClick={handleOpenShare}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ background: showShare ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.08)', border: showShare ? '1px solid rgba(201,169,97,0.3)' : '1px solid rgba(255,255,255,0.15)' }}
                title="Partager"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={showShare ? 'var(--brand)' : 'white'} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed mb-6 text-[var(--text-secondary)]">
            {video.description}
          </p>

          {/* Share panel */}
          {showShare && (
            <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid rgba(201,169,97,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Partager cette vidéo</h3>
                <button onClick={() => setShowShare(false)} className="text-[var(--text-muted)] hover:text-white text-lg leading-none cursor-pointer">×</button>
              </div>

              {/* Lien externe */}
              <div className="mb-5">
                <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-medium">Lien externe · preview 2 min</p>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 rounded-xl text-[12px] truncate text-[var(--text-muted)]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                    {typeof window !== 'undefined' ? `${window.location.origin}/shine-tv/preview/${video.id}` : `/shine-tv/preview/${video.id}`}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-all flex-shrink-0"
                    style={{ background: copyDone ? 'rgba(85,239,196,0.15)' : 'rgba(201,169,97,0.15)', color: copyDone ? '#55EFC4' : 'var(--brand)', border: copyDone ? '1px solid rgba(85,239,196,0.3)' : '1px solid rgba(201,169,97,0.2)' }}
                  >
                    {copyDone ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  Les non-membres verront les 2 premières minutes, puis seront invités à rejoindre SOS Shine.
                </p>
              </div>

              {/* Partage interne */}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-medium">Envoyer à un Rayon</p>
                {rayons.length === 0 ? (
                  <p className="text-[12px] text-[var(--text-muted)] text-center py-4">Aucun Rayon connecté pour l&apos;instant.</p>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Rechercher un Rayon…"
                      value={rayonSearch}
                      onChange={e => setRayonSearch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-[12px] outline-none mb-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {filteredRayons.map(r => (
                        <div key={r.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                            style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}>
                            {r.avatar
                              ? <img src={r.avatar} alt={r.name} className="w-full h-full rounded-full object-cover" />
                              : r.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="flex-1 text-[13px] text-[var(--text-primary)]">{r.name}</span>
                          <button
                            onClick={() => handleSendToRayon(r.partnerId)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all flex-shrink-0"
                            style={{
                              background: sentTo.has(r.partnerId) ? 'rgba(85,239,196,0.12)' : 'rgba(201,169,97,0.12)',
                              color: sentTo.has(r.partnerId) ? '#55EFC4' : 'var(--brand)',
                              border: sentTo.has(r.partnerId) ? '1px solid rgba(85,239,196,0.2)' : '1px solid rgba(201,169,97,0.2)',
                            }}
                          >
                            {sentTo.has(r.partnerId) ? '✓ Envoyé' : 'Envoyer'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Your rating */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderColor: 'rgba(201,169,97,0.1)' }}>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">Votre note :</span>
            <StarRating
              rating={video.userRating}
              size="lg"
              interactive
              onRate={(r) => onRate(video.id, r)}
            />
            {video.userRating > 0 && (
              <span className="text-[13px] font-semibold text-[var(--brand)]">
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
                background: tab === 'overview' ? 'rgba(201,169,97,0.12)' : 'transparent',
                color: tab === 'overview' ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              Aperçu
            </button>
            <button
              onClick={() => setTab('reviews')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200`}
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
                      {video.rating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mt-1">
                      <StarRating rating={Math.round(video.rating)} size="sm" />
                    </div>
                    <p className="text-[11px] mt-1 text-[var(--text-muted)]">Note moyenne</p>
                  </div>
                  <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-display font-semibold text-[var(--brand)]">
                      {video.reviewCount}
                    </div>
                    <p className="text-[11px] mt-2 text-[var(--text-muted)]">Avis membres</p>
                  </div>
                </div>

                {/* Similar videos section removed - requires simulation data */}
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
                    placeholder="Partagez votre expérience avec cette vidéo..."
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
export default function ShineTVPage() {
  const searchParams = useSearchParams()
  const douleurParam = searchParams.get('douleur')
  const [videos, setVideos] = useState<ShineVideo[]>([])
  const [search, setSearch] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<ShineVideo | null>(null)
  const [watchingVideo, setWatchingVideo] = useState<ShineVideo | null>(null)
  const [activeFilter, setActiveFilter] = useState(douleurParam ? 'douleur' : 'all')
  const [loading, setLoading] = useState(true)
  const [douleurName, setDouleurName] = useState<string | null>(null)

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
          .from('shine_tv_ratings')
          .select('video_id, rating')
          .eq('user_id', user.id)
        for (const r of ratingsData || []) {
          userRatingsMap[r.video_id] = r.rating
        }
      }

      // Load average ratings & review counts
      const videoIds = data.map((v: any) => v.id)
      const { data: avgRatings } = await supabase
        .from('shine_tv_ratings')
        .select('video_id, rating')
        .in('video_id', videoIds)

      const { data: reviewCounts } = await supabase
        .from('shine_tv_reviews')
        .select('video_id')
        .in('video_id', videoIds)

      const avgMap: Record<string, { sum: number; count: number }> = {}
      for (const r of avgRatings || []) {
        if (!avgMap[r.video_id]) avgMap[r.video_id] = { sum: 0, count: 0 }
        avgMap[r.video_id].sum += r.rating
        avgMap[r.video_id].count++
      }

      const reviewCountMap: Record<string, number> = {}
      for (const r of reviewCounts || []) {
        reviewCountMap[r.video_id] = (reviewCountMap[r.video_id] || 0) + 1
      }

      // Load user favorites
      let favoriteIds: string[] = []
      if (user) {
        const { data: favData } = await supabase
          .from('shine_tv_favorites')
          .select('video_id')
          .eq('user_id', user.id)
        favoriteIds = (favData || []).map((f: any) => f.video_id)
      }

      const mapped: ShineVideo[] = data.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description || '',
        thumbnail: v.thumbnail_url || '',
        thumbnailDesktop: v.thumbnail_desktop_url || null,
        videoUrl: v.video_url || '',
        subtitleUrl: v.subtitle_url || '',
        category: v.category,
        duration: `${v.duration_minutes} min`,
        year: v.year,
        rating: avgMap[v.id] ? avgMap[v.id].sum / avgMap[v.id].count : 0,
        userRating: userRatingsMap[v.id] || 0,
        isFavorite: favoriteIds.includes(v.id),
        reviewCount: reviewCountMap[v.id] || 0,
        douleurId: v.douleur_id || null,
      }))

      setVideos(mapped)
      setLoading(false)
    }

    loadVideos()
  }, [])

  const handleToggleFavorite = async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const video = videos.find(v => v.id === id)
    if (!video) return

    if (video.isFavorite) {
      await supabase.from('shine_tv_favorites').delete().eq('user_id', user.id).eq('video_id', id)
    } else {
      await supabase.from('shine_tv_favorites').insert({ user_id: user.id, video_id: id })
    }

    setVideos(prev => prev.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    if (selectedVideo?.id === id) {
      setSelectedVideo(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleRate = async (id: string, rating: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('shine_tv_ratings').upsert({
      user_id: user.id,
      video_id: id,
      rating,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,video_id' })

    setVideos(prev => prev.map(v => v.id === id ? { ...v, userRating: rating } : v))
    if (selectedVideo?.id === id) {
      setSelectedVideo(prev => prev ? { ...prev, userRating: rating } : null)
    }
  }

  const filteredVideos = videos.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'douleur'
      ? v.douleurId === douleurParam
      : activeFilter === 'all' || activeFilter === 'favorites'
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
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8" fill="#09090b" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
          <p className="font-display text-xl font-semibold text-[var(--brand)]">Shine TV</p>
          <p className="text-[13px] text-[var(--text-muted)]">Chargement de vos contenus...</p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate featureKey="shine_tv">
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Hero */}
      {heroVideo && !search && activeFilter === 'all' && (
        <HeroBanner video={heroVideo} onOpen={() => setWatchingVideo(heroVideo)} onInfo={() => setSelectedVideo(heroVideo)} />
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

          {/* Filter pills */}
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
              A - Z
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
            {CATEGORIES.slice(0, 6).map(cat => (
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
        {search || (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'encyclopedie' && activeFilter !== 'douleur') ? (
          // Grid view for search/filter
          <div>
            <p className="text-[13px] mb-4 text-[var(--text-muted)]">
              {filteredVideos.length} résultat{filteredVideos.length !== 1 ? 's' : ''}
              {search && <> pour &ldquo;<span className="text-[var(--brand)]">{search}</span>&rdquo;</>}
            </p>
            {filteredVideos.length === 0 ? (
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
                            <svg className="w-4 h-4" fill="var(--brand)" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                          </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{video.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(video.rating)} size="sm" />
                        <span className="text-[11px] text-[var(--text-muted)]">{video.rating.toFixed(1)}</span>
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
              Mes Favoris
            </h2>
            {filteredVideos.length === 0 ? (
              <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">💛</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  Aucun favori
                </h3>
                <p className="text-[14px] text-[var(--text-muted)]">
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
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{video.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(video.rating)} size="sm" />
                        <span className="text-[11px] text-[var(--text-muted)]">{video.rating.toFixed(1)}</span>
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
            {filteredVideos.length === 0 ? (
              <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-12 text-center rounded-xl">
                <div className="text-4xl mb-3">📺</div>
                <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  Aucune vidéo liée
                </h3>
                <p className="text-[14px] text-[var(--text-muted)]">
                  Aucune vidéo n&apos;est associée à cette douleur pour le moment.
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
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand)', color: '#09090b' }}>
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{video.title}</h3>
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
                        style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)' }}
                      >
                        {letter}
                      </a>
                    ))}
                  </div>

                  {/* Letter groups */}
                  {letters.map(letter => (
                    <div key={letter} id={`letter-tv-${letter}`} className="scroll-mt-24">
                      <h3 className="font-display text-2xl font-bold mb-3 pb-2 text-[var(--brand)] border-b border-[var(--border)]">
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
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand)', color: '#09090b' }}>
                                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <h3 className="text-[13px] font-medium truncate text-[var(--text-primary)]">{video.title}</h3>
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

      {/* Netflix Full Screen Player */}
      <AnimatePresence>
        {watchingVideo && (
          <FullScreenPlayer
            video={watchingVideo}
            onClose={() => setWatchingVideo(null)}
            onShowInfo={() => { setSelectedVideo(watchingVideo); setWatchingVideo(null) }}
          />
        )}
      </AnimatePresence>

      {/* Video Detail Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onToggleFavorite={handleToggleFavorite}
            onRate={handleRate}
            onWatch={() => { setWatchingVideo(selectedVideo); setSelectedVideo(null) }}
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

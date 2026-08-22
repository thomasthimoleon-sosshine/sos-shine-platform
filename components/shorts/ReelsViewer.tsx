'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ShineIcon from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  REELS — visionnage plein écran, vertical, un doigt
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Reproduit les codes du visionnage de réels : une vidéo occupe tout l'écran,
 *  on fait défiler verticalement pour passer à la suivante, la vidéo visible
 *  se lance seule et les autres se coupent. Rail d'actions à droite, texte en
 *  bas à gauche, barre de progression fine en bas.
 *
 *  Points techniques qui font la différence entre « ça y ressemble » et « c'est
 *  pareil » :
 *   · scroll-snap obligatoire sur l'axe Y, une vidéo = une page (100dvh)
 *   · IntersectionObserver : une seule vidéo joue à la fois, les autres sont
 *     remises à zéro (sinon le son se superpose au scroll rapide)
 *   · démarrage en sourdine — sans ça, les navigateurs refusent la lecture
 *     automatique et l'utilisateur voit une image figée
 *   · appui n'importe où = pause / reprise, comme sur un réel
 *   · 100dvh et non 100vh : sur mobile, la barre d'URL mange le 100vh
 */

export type Reel = {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnail: string
  category: string
  isFavorite: boolean
  rating: number
  reviewCount: number
}

type Props = {
  reels: Reel[]
  startIndex?: number
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onOpenDetails?: (id: string) => void
  /** Secondes visibles pour un compte gratuit. undefined = pas de limite. */
  previewSeconds?: number
}

export default function ReelsViewer({
  reels,
  startIndex = 0,
  onClose,
  onToggleFavorite,
  onOpenDetails,
  previewSeconds,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [index, setIndex] = useState(startIndex)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [capped, setCapped] = useState(false)

  /* ── Positionnement initial : on saute sans animation sur le bon réel ── */
  useEffect(() => {
    const el = itemRefs.current[startIndex]
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Une seule vidéo joue à la fois ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.i)
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setIndex(i)
          }
        }
      },
      { threshold: [0.6] }
    )
    itemRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [reels.length])

  /* ── Changement de réel : on relance, on remet les autres à zéro ── */
  useEffect(() => {
    setProgress(0)
    setExpanded(false)
    setCapped(false)
    setPaused(false)
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === index) {
        v.currentTime = 0
        v.play().catch(() => {/* lecture refusée : l'utilisateur touchera l'écran */})
      } else {
        v.pause()
        v.currentTime = 0
      }
    })
  }, [index])

  /* ── Le son se règle une fois pour toutes les vidéos ── */
  useEffect(() => {
    videoRefs.current.forEach(v => { if (v) v.muted = muted })
  }, [muted])

  const goTo = useCallback((i: number) => {
    const el = itemRefs.current[i]
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [])

  /* ── Clavier : flèches pour naviguer, échap pour sortir, espace pour pauser ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(Math.min(index + 1, reels.length - 1)) }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(Math.max(index - 1, 0)) }
      if (e.key === ' ') { e.preventDefault(); togglePlay() }
      if (e.key === 'm' || e.key === 'M') setMuted(m => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reels.length])

  /* ── On bloque le défilement de la page derrière ── */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function togglePlay() {
    const v = videoRefs.current[index]
    if (!v || capped) return
    if (v.paused) { v.play().catch(() => {}); setPaused(false) }
    else { v.pause(); setPaused(true) }
  }

  function handleTimeUpdate(i: number) {
    if (i !== index) return
    const v = videoRefs.current[i]
    if (!v || !v.duration) return
    setProgress((v.currentTime / v.duration) * 100)
    if (previewSeconds && v.currentTime >= previewSeconds) {
      v.pause()
      setCapped(true)
    }
  }

  const current = reels[index]

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      style={{ ["--reel-w" as string]: 'min(100%, calc(100vh * 9 / 16))' }}
    >
      {/* ── Barre du haut ── */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-4
                      bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center
                     bg-black/40 backdrop-blur-sm text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="pointer-events-none font-display text-[15px] tracking-wide text-[#C9A961]">
          Formats courts
        </span>

        <button
          onClick={() => setMuted(m => !m)}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
          className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center
                     bg-black/40 backdrop-blur-sm text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          {muted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.7-.58-1.86-1.45a11 11 0 010-3.96c.16-.87.98-1.45 1.86-1.45h2.24z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.7-.58-1.86-1.45a11 11 0 010-3.96c.16-.87.98-1.45 1.86-1.45h2.24z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Le fil vertical ── */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel, i) => (
          <div
            key={reel.id}
            data-i={i}
            ref={el => { itemRefs.current[i] = el }}
            className="relative h-full w-full snap-start snap-always flex items-center justify-center"
          >
            {/* Vidéo */}
            <video
              ref={el => { videoRefs.current[i] = el }}
              src={reel.videoUrl}
              poster={reel.thumbnail || undefined}
              className="h-full w-full object-contain sm:object-cover sm:max-w-[var(--reel-w)]"
              playsInline
              loop
              muted={muted}
              preload={Math.abs(i - index) <= 1 ? 'auto' : 'none'}
              controlsList="nodownload"
              onContextMenu={e => e.preventDefault()}
              onTimeUpdate={() => handleTimeUpdate(i)}
              onClick={togglePlay}
            />

            {/* Voile bas pour que le texte reste lisible sur une image claire */}
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

            {/* Indicateur de pause */}
            {paused && i === index && !capped && (
              <button
                onClick={togglePlay}
                aria-label="Reprendre"
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <span className="w-20 h-20 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-9 h-9 text-white/95 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            )}

            {/* Fin de l'aperçu gratuit */}
            {capped && i === index && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center
                              bg-black/80 backdrop-blur-md">
                <ShineIcon name="gratitude" className="w-10 h-10 mb-5" color="#C9A961" strokeWidth={1.2} />
                <p className="font-display text-2xl mb-2 text-[#F5EFE3]">La suite vous attend</p>
                <p className="text-sm text-white/60 max-w-xs mb-7">
                  Vous avez vu les {previewSeconds} premières secondes. L&apos;intégralité des formats
                  courts est incluse dans l&apos;abonnement.
                </p>
                <a
                  href="/rejoindre"
                  className="px-7 py-3.5 rounded-full text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #C9A961, #A88248)', color: '#0A0806' }}
                >
                  Débloquer — 49,90&nbsp;€/mois
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Surimpressions : elles épousent la colonne vidéo, pas la fenêtre.
             Sans ça, sur un grand écran la légende part se coller au bord
             gauche et le rail au bord droit, à 40 cm de la vidéo. ── */}
      <div className="pointer-events-none absolute inset-0 z-30 flex justify-center">
        <div className="relative h-full w-full sm:max-w-[var(--reel-w)]">

          {/* Rail d'actions */}
          {current && (
            <div className="pointer-events-auto absolute right-3 sm:right-4 bottom-28 flex flex-col items-center gap-5">
              <button
                onClick={() => onToggleFavorite(current.id)}
                aria-label={current.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <span className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center
                                 group-hover:bg-black/55 transition-colors">
                  <ShineIcon
                    name="eclat"
                    className="w-[22px] h-[22px]"
                    color={current.isFavorite ? '#C9A961' : '#FFFFFF'}
                    filled={current.isFavorite}
                  />
                </span>
                <span className="text-[11px] font-medium text-white/85">
                  {current.isFavorite ? 'Gardé' : 'Éclat'}
                </span>
              </button>

              {onOpenDetails && (
                <button
                  onClick={() => onOpenDetails(current.id)}
                  aria-label="Voir les avis"
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <span className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center
                                   group-hover:bg-black/55 transition-colors">
                    <ShineIcon name="parole" className="w-[22px] h-[22px] text-white" />
                  </span>
                  <span className="text-[11px] font-medium text-white/85">
                    {current.reviewCount > 0 ? current.reviewCount : 'Avis'}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  const url = `${window.location.origin}/dashboard/shine-shorts?id=${current.id}`
                  if (navigator.share) navigator.share({ title: current.title, url }).catch(() => {})
                  else navigator.clipboard?.writeText(url).catch(() => {})
                }}
                aria-label="Partager"
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <span className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center
                                 group-hover:bg-black/55 transition-colors">
                  <ShineIcon name="diffuser" className="w-[22px] h-[22px] text-white" />
                </span>
                <span className="text-[11px] font-medium text-white/85">Partager</span>
              </button>
            </div>
          )}

          {/* Légende */}
          {current && (
            <div className="pointer-events-auto absolute left-4 sm:left-6 bottom-10 max-w-[78%] pr-14">
              <p className="text-[11px] uppercase tracking-[0.2em] mb-1.5 text-[#C9A961]">{current.category}</p>
              <h2 className="font-display text-[19px] sm:text-[22px] leading-snug text-white mb-1.5">{current.title}</h2>
              {current.description && (
                <p
                  onClick={() => setExpanded(e => !e)}
                  className={`text-[13px] leading-relaxed text-white/70 cursor-pointer ${expanded ? '' : 'line-clamp-2'}`}
                >
                  {current.description}
                </p>
              )}
            </div>
          )}

          {/* Progression */}
          <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/12">
            <div className="h-full transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%`, background: '#C9A961' }} />
          </div>
        </div>
      </div>

      {/* ── Repères de position (ordinateur seulement) ── */}
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 bottom-4 z-30 items-center gap-2">
        <span className="text-[11px] text-white/45">{index + 1} / {reels.length}</span>
      </div>
    </div>
  )
}

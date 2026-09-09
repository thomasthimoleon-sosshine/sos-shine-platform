'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'

// Worker pdf.js hébergé en local (aucune dépendance externe).
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

/**
 * Lecteur « livre » : rend chaque page du PDF en image puis les présente avec
 * un vrai effet de feuilletage (page qui se tourne). Double page sur ordinateur,
 * une seule page sur mobile. Lecture en ligne uniquement (pas de téléchargement).
 */

// Une page du livre — react-pageflip a besoin d'un composant qui transmet la ref.
const FlipPage = React.forwardRef<HTMLDivElement, { src: string }>(function FlipPage({ src }, ref) {
  return (
    <div ref={ref} style={{ background: '#0b0b0d', overflow: 'hidden' }}>
      <img src={src} alt="" draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }} />
    </div>
  )
})

export default function BookFlipReader({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [pages, setPages] = useState<string[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  const [error, setError] = useState(false)
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null)

  // Protections (pas de téléchargement / impression / clic droit) + scroll bloqué.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) { e.preventDefault(); e.stopPropagation() }
      if (e.key === 'ArrowRight') bookRef.current?.pageFlip()?.flipNext()
      if (e.key === 'ArrowLeft') bookRef.current?.pageFlip()?.flipPrev()
      if (e.key === 'Escape') onClose()
    }
    const onCtx = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('contextmenu', onCtx, true)
    document.body.style.overflow = 'hidden'
    setIsMobile(window.matchMedia('(max-width: 820px)').matches)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('contextmenu', onCtx, true)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Rendu des pages du PDF en images.
  useEffect(() => {
    let cancelled = false
    async function render() {
      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise
        if (cancelled) return
        const total = pdf.numPages
        setProgress({ done: 0, total })
        const out: string[] = []
        // échelle de rendu : nette sans être trop lourde
        const targetW = 900
        for (let i = 1; i <= total; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const base = page.getViewport({ scale: 1 })
          const scale = Math.min(2, targetW / base.width)
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)
          const ctx = canvas.getContext('2d')!
          await page.render({ canvasContext: ctx, viewport, canvas }).promise
          out.push(canvas.toDataURL('image/jpeg', 0.82))
          if (i === 1) {
            const aspect = base.width / base.height
            const hMax = window.innerHeight * (window.matchMedia('(max-width:820px)').matches ? 0.82 : 0.84)
            let ph = hMax
            let pw = ph * aspect
            const perPage = window.matchMedia('(max-width:820px)').matches ? 1 : 2
            const wMax = (window.innerWidth * 0.94) / perPage
            if (pw > wMax) { pw = wMax; ph = pw / aspect }
            setDims({ w: Math.round(pw), h: Math.round(ph) })
          }
          setProgress({ done: i, total })
          setPages([...out])
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }
    render()
    return () => { cancelled = true }
  }, [url])

  const ready = dims && pages.length > 0 && progress.done === progress.total && progress.total > 0

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#09090b' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 bg-[var(--surface-card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-5 h-5 shrink-0 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h2 className="font-display text-[15px] font-semibold truncate text-[var(--text-primary)]">{title}</h2>
        </div>
        <button onClick={onClose} aria-label="Fermer"
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Corps */}
      <div className="flex-1 relative flex items-center justify-center select-none overflow-hidden px-2">
        {error ? (
          <div className="text-center px-8">
            <p className="text-sm text-[var(--text-secondary)]">Ce livre n’a pas pu être ouvert.</p>
            <button onClick={onClose} className="mt-4 text-xs uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Fermer</button>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <div className="w-9 h-9 mx-auto mb-4 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">
              Préparation du livre… {progress.total ? `${progress.done}/${progress.total}` : ''}
            </p>
          </div>
        ) : (
          <>
            {/* @ts-expect-error - props runtime de react-pageflip */}
            <HTMLFlipBook
              width={dims!.w} height={dims!.h}
              size="fixed"
              usePortrait={isMobile}
              showCover={true}
              mobileScrollSupport={false}
              maxShadowOpacity={0.5}
              flippingTime={700}
              drawShadow={true}
              ref={bookRef}
              onFlip={(e: { data: number }) => setCurrent(e.data)}
              style={{}}
            >
              {pages.map((src, i) => (<FlipPage key={i} src={src} />))}
            </HTMLFlipBook>

            {/* Flèches discrètes (desktop) */}
            <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} aria-label="Page précédente"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} aria-label="Page suivante"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Bas : compteur + mention */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 shrink-0 bg-[var(--surface-card)] border-t border-[var(--border)]">
        {ready && <span className="text-[11px] text-[var(--text-secondary)]">Page {Math.min(current + 1, pages.length)} / {pages.length}</span>}
        <span className="text-[11px] text-[var(--text-muted)]">· Lecture en ligne uniquement</span>
      </div>
    </motion.div>
  )
}

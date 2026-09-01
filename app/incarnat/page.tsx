'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Lenis from 'lenis'
import Typography from '@/components/incarnat/Typography'
import Cursor from '@/components/incarnat/Cursor'
import { incarnatState } from '@/components/incarnat/hooks/incarnatState'
import '@/components/incarnat/incarnat.css'

// La scène WebGL n'est jamais rendue côté serveur.
const Experience = dynamic(() => import('@/components/incarnat/Experience'), { ssr: false })

function webglOK() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function IncarnatPage() {
  const [mode, setMode] = useState<'loading' | 'full' | 'fallback'>('loading')
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !webglOK()) { setMode('fallback'); return }
    setMode('full')

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true })
    let raf = 0
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)

    lenis.on('scroll', (e: { progress: number }) => {
      incarnatState.progress = Math.min(1, Math.max(0, e.progress || 0))
    })

    const onMove = (e: PointerEvent) => {
      incarnatState.mouseX = (e.clientX / innerWidth) * 2 - 1
      incarnatState.mouseY = -((e.clientY / innerHeight) * 2 - 1)
    }
    addEventListener('pointermove', onMove, { passive: true })

    // Hook de dev uniquement (jamais en production) : piloter la progression.
    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as { __incarnat?: typeof incarnatState }).__incarnat = incarnatState
    }

    const navT = setTimeout(() => navRef.current?.classList.add('show'), 2000)

    return () => {
      cancelAnimationFrame(raf); lenis.destroy()
      removeEventListener('pointermove', onMove); clearTimeout(navT)
    }
  }, [])

  if (mode === 'fallback') {
    return (
      <main className="incarnat-page">
        <div className="i-fallback">
          <h1>INCARNAT</h1>
          <p>Ce que tu crois être toi ne l’est peut-être pas.</p>
          <p style={{ opacity: 0.7 }}>
            Tu appelles personnalité ce qui est parfois devenu protection.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="incarnat-page">
      <div className="incarnat-scroll" aria-hidden="true" />
      {mode === 'full' && <Experience />}
      <Typography />

      <div className="i-nav" ref={navRef}>
        <span className="i-brand">Incarnat</span>
        <nav className="i-links">
          <a href="#">Manifeste</a>
          <a href="#">Expérience</a>
          <a href="#">À propos</a>
          <a href="/reconquete">Entrer</a>
        </nav>
      </div>

      <SoundToggle />
      <div className="i-grain" />
      <div className="i-vignette" />
      <Cursor />
    </main>
  )
}

function SoundToggle() {
  const on = useRef(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const [label, setLabel] = useState<'in' | 'out'>('in')
  const toggle = () => {
    const w = window as unknown as { webkitAudioContext?: typeof AudioContext }
    if (on.current) { ctxRef.current?.suspend(); on.current = false; setLabel('in'); return }
    try {
      const Ctx = window.AudioContext || w.webkitAudioContext!
      const ctx = ctxRef.current || new Ctx()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') ctx.resume()
      const anyCtx = ctx as AudioContext & { _built?: boolean }
      if (!anyCtx._built) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 170
        const g = ctx.createGain(); g.gain.value = 0.05
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12
        const lg = ctx.createGain(); lg.gain.value = 0.035
        lfo.connect(lg); lg.connect(g.gain)
        src.connect(lp); lp.connect(g); g.connect(ctx.destination)
        src.start(); lfo.start(); anyCtx._built = true
      }
      on.current = true; setLabel('out')
    } catch { /* ignore */ }
  }
  return (
    <button className="i-son" onClick={toggle} aria-label="Entrer avec le son">
      {label === 'in' ? <>Entrer avec <b>le son</b></> : <>Couper <b>le son</b></>}
    </button>
  )
}

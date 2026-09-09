'use client'

import { useEffect, useRef } from 'react'
import { incarnatState } from './hooks/incarnatState'

// Enveloppe d'opacité : monte puis redescend sur un intervalle de progression.
function env(p: number, a: number, b: number, c: number, d: number) {
  if (p < a || p > d) return 0
  if (p < b) return (p - a) / (b - a)
  if (p > c) return 1 - (p - c) / (d - c)
  return 1
}
const clamp = (v: number) => Math.max(0, Math.min(1, v))

// Les pensées conditionnées, dispersées dans la profondeur.
const THOUGHTS = [
  { t: 'Sois fort.', x: 18, y: 30, z: -520, r: -4 },
  { t: 'Fais plaisir.', x: 70, y: 22, z: -300, r: 3 },
  { t: 'Ne dérange pas.', x: 26, y: 66, z: -700, r: 2 },
  { t: 'Réussis.', x: 76, y: 62, z: -180, r: -3 },
  { t: 'Reste raisonnable.', x: 44, y: 16, z: -880, r: 1 },
  { t: 'Sois aimé.', x: 58, y: 78, z: -420, r: -2 },
  { t: 'Ne montre pas ça.', x: 12, y: 48, z: -240, r: 4 },
]

export default function Typography() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const hero = root.current!.querySelector<HTMLElement>('[data-hero]')!
    const cue = root.current!.querySelector<HTMLElement>('[data-cue]')!
    const field = root.current!.querySelector<HTMLElement>('[data-field]')!
    const thoughts = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-thought]'))
    const central = root.current!.querySelector<HTMLElement>('[data-central]')!

    const tick = () => {
      const p = incarnatState.progress
      const rev = incarnatState.reveal

      // HERO — INCARNAT + sous-titre, révélé au chargement, s'efface en entrant
      const heroOp = clamp(rev) * (1 - clamp(p / 0.1))
      hero.style.opacity = String(heroOp)
      hero.style.transform = `translate(-50%,-50%) scale(${1 + p * 0.6})`
      cue.style.opacity = String(clamp(rev) * (1 - clamp(p / 0.05)))

      // CHAMP DE PENSÉES — Chapitre 01, profondeur qui défile
      const fieldOn = env(p, 0.08, 0.16, 0.42, 0.52)
      field.style.opacity = String(fieldOn)
      // la profondeur avance avec le scroll : les mots foncent vers/derrière la caméra
      const dolly = (p - 0.08) * 2600
      thoughts.forEach((el, i) => {
        const th = THOUGHTS[i]
        const z = th.z + dolly
        // opacité propre : apparaît en approchant, disparaît en passant tout près
        const near = clamp(1 - Math.abs(z + 120) / 620)
        el.style.opacity = String(fieldOn * near)
        el.style.transform =
          `translate(-50%,-50%) translateZ(${z}px) rotate(${th.r}deg)`
        el.style.filter = `blur(${clamp(-z / 900) * 3}px)`
      })

      // PHRASE CENTRALE — la bascule
      const cOn = env(p, 0.5, 0.58, 0.72, 0.82)
      central.style.opacity = String(cOn)
      central.style.transform = `translate(-50%,-50%) scale(${0.98 + cOn * 0.02})`

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={root} className="incarnat-type" aria-hidden="false">
      {/* HERO */}
      <div className="i-hero" data-hero>
        <h1 className="i-title">INCARNAT</h1>
        <p className="i-sub">Ce que tu crois être toi ne l’est peut-être pas.</p>
      </div>
      <div className="i-cue" data-cue><span>Avance</span></div>

      {/* CHAMP DE PENSÉES (Chapitre 01) */}
      <div className="i-field" data-field>
        {THOUGHTS.map((th, i) => (
          <span
            key={i}
            data-thought
            className="i-thought"
            style={{ left: `${th.x}%`, top: `${th.y}%` }}
          >
            {th.t}
          </span>
        ))}
      </div>

      {/* PHRASE CENTRALE */}
      <p className="i-central" data-central>
        Tu appelles personnalité<br />ce qui est parfois devenu <em>protection.</em>
      </p>

      {/* contenu essentiel, accessible même sans mouvement (lecteurs d'écran / reduced-motion) */}
      <div className="i-sr">
        <h2>Incarnat</h2>
        <p>Ce que tu crois être toi ne l’est peut-être pas.</p>
        <p>Sois fort. Fais plaisir. Ne dérange pas. Réussis. Reste raisonnable. Sois aimé. Ne montre pas ça.</p>
        <p>Tu appelles personnalité ce qui est parfois devenu protection.</p>
      </div>
    </div>
  )
}

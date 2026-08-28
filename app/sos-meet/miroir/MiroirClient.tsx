'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MeetNav from '../MeetNav'

const C = {
  ink: '#0A090B', velvet: '#120E11', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360', body: '#CBC1B8',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

type Schema = { title: string; body: string; protocol?: string }
type Mirror = { intro: string; forces: string[]; schemas: Schema[]; edge: string | null }
type Next = { id: string; title: string; tagline: string; minutes: number; sensitive: boolean } | null
type Deepen = { next: Next; depth: number } | null

export default function MiroirClient() {
  const [phase, setPhase] = useState<'loading' | 'auth' | 'incomplete' | 'ready'>('loading')
  const [mirror, setMirror] = useState<Mirror | null>(null)
  const [deepen, setDeepen] = useState<Deepen>(null)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    fetch('/api/sosmeet/me').then(async (r) => {
      if (r.status === 401) { setPhase('auth'); return }
      const d = await r.json()
      setFirstName(d.profile?.first_name || '')
      if (!d.mirror) { setPhase('incomplete'); return }
      setMirror(d.mirror); setDeepen(d.deepen || null); setPhase('ready')
    }).catch(() => setPhase('auth'))
  }, [])

  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties
  const shell = 'min-h-screen relative'

  if (phase === 'loading') return <main className={shell} style={bg}><div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div></main>

  if (phase === 'auth') return (
    <main className={shell} style={bg}><div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Connecte-toi</h1>
      <a href="/login?next=/sos-meet/miroir" className="mt-6 px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Me connecter</a>
    </div></main>
  )

  if (phase === 'incomplete') return (
    <main className={shell} style={bg}>
      <MeetNav />
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <span className="text-[11px] tracking-[0.34em] uppercase" style={{ color: C.ember }}>Ton miroir</span>
        <h1 className="mt-3 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,5vw,2.6rem)' }}>Il t’attend</h1>
        <p className="text-[15px] leading-relaxed mb-7" style={{ color: C.smoke }}>
          Ton miroir se tisse à partir de tes réponses. Termine ton questionnaire, et découvre ce qu’il révèle de ta façon d’aimer.
        </p>
        <Link href="/sos-meet/questionnaire" className="inline-block px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Compléter mon profil</Link>
      </div>
    </main>
  )

  const m = mirror!
  return (
    <main className={shell} style={bg}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 45% at 50% -8%, rgba(155,27,46,0.14), transparent 55%)' }} />
      <MeetNav active="miroir" />
      <div className="relative max-w-2xl mx-auto px-6 py-8">
        <span className="text-[11px] tracking-[0.34em] uppercase" style={{ color: C.ember }}>Ton miroir{firstName ? ` · ${firstName}` : ''}</span>
        <h1 className="mt-3 mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6vw,3rem)', lineHeight: 1.05 }}>Ce que tu ne montres pas encore</h1>
        <p className="text-[15px] leading-relaxed mb-10" style={{ ...sans, color: C.body, lineHeight: 1.7 }}>{m.intro}</p>

        {/* Tes forces */}
        {m.forces.length > 0 && (
          <section className="mb-10">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: C.smoke2 }}>Ce qui est déjà là</div>
            <div className="flex flex-col gap-3">
              {m.forces.map((f, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span aria-hidden style={{ color: C.ember }}>✦</span>
                  <p className="text-[15px]" style={{ ...sans, color: C.body, lineHeight: 1.7 }}>{f}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tes schémas + pont protocole */}
        {m.schemas.length > 0 && (
          <section className="mb-10">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: C.smoke2 }}>Là où le chemin t’attend</div>
            <div className="flex flex-col gap-4">
              {m.schemas.map((s, i) => (
                <div key={i} className="rounded-2xl p-6" style={{ background: C.velvet, border: `1px solid ${C.line}` }}>
                  <h3 className="mb-2" style={{ ...serif, fontWeight: 500, fontSize: '1.3rem', color: C.alabaster }}>{s.title}</h3>
                  <p className="text-[14.5px] mb-4" style={{ ...sans, color: C.body, lineHeight: 1.7 }}>{s.body}</p>
                  {s.protocol && (
                    <Link href="/encyclopedie" className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.08em] px-4 py-2.5 rounded-full" style={{ border: `1px solid ${C.line}`, color: C.alabaster }}>
                      Traverser {s.protocol} sur SOS Shine <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Point de vigilance */}
        {m.edge && (
          <section className="mb-10 rounded-2xl p-6" style={{ background: 'rgba(155,27,46,0.08)', border: '1px solid rgba(155,27,46,0.22)' }}>
            <div className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: C.ember }}>À garder en conscience</div>
            <p className="text-[15px]" style={{ ...sans, color: C.body, lineHeight: 1.7 }}>{m.edge}</p>
          </section>
        )}

        {/* La profondeur : se dévoiler encore */}
        {deepen?.next && (
          <section className="rounded-2xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: C.smoke2 }}>Aller plus profond</div>
            <h3 className="mb-1.5" style={{ ...serif, fontWeight: 400, fontSize: '1.5rem' }}>{deepen.next.title}</h3>
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: C.smoke }}>{deepen.next.tagline}</p>
            <Link href={`/sos-meet/questionnaire?palier=${deepen.next.id}`} className="inline-block px-7 py-3.5 rounded-full text-[13px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
              Me dévoiler encore · {deepen.next.minutes} min →
            </Link>
            <p className="mt-4 text-[12px]" style={{ color: C.smoke2 }}>Plus tu te dévoiles, plus ton miroir et tes rencontres s’affinent.</p>
          </section>
        )}
      </div>
    </main>
  )
}

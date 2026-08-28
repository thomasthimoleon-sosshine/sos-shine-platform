'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MeetNav from '../MeetNav'

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

type Sincerity = { label: string; tone: 'high' | 'medium' | 'low'; note: string }
type Candidate = {
  userId: string; firstName: string; age: number | null; city: string | null
  score: number; reasons: string[]; coherent: boolean
  prose: string; sincerity: Sincerity; protocols: string[]
}

// Couleurs charte SOS Meet (pas d'or ni de vert) : clair = sûr, fumé = neutre, braise = à confirmer.
const SINC_COLOR: Record<Sincerity['tone'], string> = { high: '#F2EBE4', medium: '#A99A96', low: '#C1121F' }

export default function DecouverteClient() {
  const [phase, setPhase] = useState<'loading' | 'auth' | 'incomplete' | 'ready'>('loading')
  const [list, setList] = useState<Candidate[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const [matched, setMatched] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sosmeet/discover')
      .then(async (r) => {
        if (r.status === 401) { setPhase('auth'); return }
        if (r.status === 409) { setPhase('incomplete'); return }
        const d = await r.json()
        setList(Array.isArray(d.candidates) ? d.candidates : [])
        setPhase('ready')
      })
      .catch(() => setPhase('auth'))
  }, [])

  async function connect(c: Candidate) {
    setBusy(c.userId)
    try {
      const res = await fetch('/api/sosmeet/interest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUser: c.userId }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok) {
        setSent((s) => ({ ...s, [c.userId]: true }))
        if (d.matched) setMatched(c.firstName || 'cette personne')
      }
    } catch { /* ignore */ } finally { setBusy(null) }
  }

  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties
  const shell = 'min-h-screen relative'

  if (phase === 'loading') return <main className={shell} style={bg}><div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div></main>

  if (phase === 'auth') return (
    <main className={shell} style={bg}><div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Connecte-toi</h1>
      <a href="/login?next=/sos-meet/decouverte" className="mt-6 px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Me connecter</a>
    </div></main>
  )

  if (phase === 'incomplete') return (
    <main className={shell} style={bg}><div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.8rem,5vw,2.4rem)' }}>Encore une étape</h1>
      <p className="text-[15px] mb-7" style={{ color: C.smoke }}>Termine ton profil de compatibilité pour découvrir les personnes qui te correspondent.</p>
      <Link href="/sos-meet/questionnaire" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Compléter mon profil</Link>
    </div></main>
  )

  return (
    <main className={shell} style={bg}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 45% at 50% -8%, rgba(155,27,46,0.14), transparent 55%)' }} />
      <MeetNav active="decouverte" />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <h1 className="mb-2" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,5.5vw,3.2rem)' }}>Celles et ceux qui te correspondent</h1>
        <p className="text-[15px] mb-10" style={{ color: C.smoke }}>Le visage reste voilé, l’émotionnel d’abord. Quand l’intérêt devient réciproque, il se dévoile.</p>

        {list.length === 0 ? (
          <div className="text-center py-20" style={{ color: C.smoke }}>
            <p className="text-[16px]" style={{ ...serif }}>Personne pour l’instant.</p>
            <p className="text-[14px] mt-2" style={{ color: C.smoke2 }}>Les profils arrivent au fil des inscriptions. Reviens bientôt.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((c) => (
              <div key={c.userId} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                {/* Photo voilée */}
                <div className="relative aspect-[4/5] flex items-center justify-center" style={{ background: 'radial-gradient(120% 90% at 50% 15%, rgba(155,27,46,0.35), #0d0a0c 65%)' }}>
                  <div className="text-center">
                    <div style={{ ...serif, fontSize: 'clamp(2.4rem,7vw,3.4rem)', lineHeight: 1 }}>{c.score}<span style={{ fontSize: '1.1rem', color: C.smoke }}>%</span></div>
                    <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.smoke2 }}>Compatibilité</span>
                  </div>
                  <span className="absolute top-3 right-3 text-[11px]" style={{ color: 'rgba(242,235,228,0.4)' }}>voilé</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 style={{ ...serif, fontWeight: 500, fontSize: '19px' }}>{c.firstName}{c.age ? `, ${c.age}` : ''}</h3>
                    {c.city && <span className="text-[12px]" style={{ color: C.smoke2 }}>· {c.city}</span>}
                  </div>

                  {/* Sincérité, affichée en transparence (dérivée de la cohérence des réponses) */}
                  <div className="mt-2 inline-flex items-center gap-1.5 self-start text-[11px] px-2.5 py-1 rounded-full"
                    title={c.sincerity.note}
                    style={{ color: SINC_COLOR[c.sincerity.tone], background: 'rgba(255,255,255,0.04)', border: `1px solid ${SINC_COLOR[c.sincerity.tone]}44` }}>
                    <span aria-hidden>{c.sincerity.tone === 'high' ? '✓' : c.sincerity.tone === 'medium' ? '◐' : '⚠'}</span>{c.sincerity.label}
                  </div>

                  {/* Portrait généré : un seul texte fluide, en paragraphes (corps en sans, lisible) */}
                  {c.prose && (
                    <div className="mt-3 flex flex-col gap-3">
                      {c.prose.split('\n\n').map((para, i) => (
                        <p key={i} className="text-[15px]" style={{ ...sans, color: '#CBC1B8', lineHeight: 1.78 }}>{para}</p>
                      ))}
                    </div>
                  )}

                  {/* Chemin accompli, protocoles SOS Shine traversés */}
                  {c.protocols?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] tracking-[0.24em] uppercase mb-1.5" style={{ color: C.ember }}>✦ Chemin accompli</div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.protocols.map((p, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(155,27,46,0.12)', color: C.alabaster, border: '1px solid rgba(155,27,46,0.3)' }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {c.reasons.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(155,27,46,0.12)', color: C.smoke }}>{r}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-4">
                    {sent[c.userId] ? (
                      <div className="text-center text-[13px] py-3" style={{ color: C.ember }}>✦ Intérêt envoyé</div>
                    ) : (
                      <button onClick={() => connect(c)} disabled={busy === c.userId}
                        className="w-full py-3 rounded-full text-[13px] tracking-[0.1em] uppercase disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
                        {busy === c.userId ? '…' : 'Se connecter'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bandeau match réciproque */}
      {matched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(10,9,11,0.8)', backdropFilter: 'blur(6px)' }} onClick={() => setMatched(null)}>
          <div className="max-w-sm w-full text-center rounded-3xl p-9" style={{ background: C.card, border: `1px solid rgba(155,27,46,0.4)` }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...serif, fontSize: 44, color: C.garnet }}>♥</div>
            <h2 className="mt-2 mb-3" style={{ ...serif, fontWeight: 400, fontSize: '1.9rem' }}>Vous vous êtes trouvés</h2>
            <p className="text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>
              L’intérêt est réciproque avec <b style={{ color: C.alabaster }}>{matched}</b>. Le visage se dévoile, et la conversation peut commencer.
            </p>
            <a href="/sos-meet/messages" className="inline-block mt-6 px-7 py-3 rounded-full text-[13px] tracking-[0.1em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Ouvrir la conversation →</a>
            <button onClick={() => setMatched(null)} className="block mx-auto mt-4 text-[12px] tracking-[0.1em] uppercase" style={{ color: C.smoke }}>Continuer à découvrir</button>
          </div>
        </div>
      )}
    </main>
  )
}

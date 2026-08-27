'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getPalier, PALIERS, type PalierId, type PalierProgress } from '@/lib/sosmeet/paliers'

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }

export default function QuestionnaireClient({ palier = 'essentiel' }: { palier?: PalierId }) {
  const current = getPalier(palier) || PALIERS[0]
  const questions = current.questions
  const total = questions.length
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timings, setTimings] = useState<Record<string, number>>({})
  const [ageInput, setAgeInput] = useState('')
  const [phase, setPhase] = useState<'loading' | 'auth' | 'run' | 'saving' | 'done'>('loading')
  const [result, setResult] = useState<{ coherent: boolean; band: string } | null>(null)
  const [nextStep, setNextStep] = useState<PalierProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const shownAt = useRef<number>(0)

  // Reprise + garde d'auth
  useEffect(() => {
    fetch('/api/sosmeet/questionnaire')
      .then(async (r) => {
        if (r.status === 401) { setPhase('auth'); return }
        const d = await r.json()
        if (d.answers && typeof d.answers === 'object') {
          setAnswers(d.answers)
          const answered = questions.findIndex((q) => d.answers[q.id] == null)
          setIdx(answered === -1 ? 0 : answered)
        }
        setPhase('run')
      })
      .catch(() => setPhase('auth'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const q = questions[idx]

  useEffect(() => { shownAt.current = typeof performance !== 'undefined' ? performance.now() : Date.now() }, [idx, phase])

  function record(qid: string, value: number) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const ms = Math.max(0, Math.round(now - shownAt.current))
    setTimings((t) => ({ ...t, [qid]: ms }))
    setAnswers((a) => ({ ...a, [qid]: value }))
  }

  function next() { if (idx < total - 1) setIdx(idx + 1); else finish() }
  function back() { if (idx > 0) setIdx(idx - 1) }

  function choose(optIndex: number) {
    record(q.id, optIndex)
    setTimeout(() => { if (idx < total - 1) setIdx(idx + 1); else finish() }, 160)
  }
  function submitNumber() {
    const n = parseInt(ageInput, 10)
    if (isNaN(n) || n < 18 || n > 120) { setError('Indique un âge valide (18+).'); return }
    setError(null); record(q.id, n); next()
  }

  async function finish() {
    setPhase('saving')
    try {
      const res = await fetch('/api/sosmeet/questionnaire', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timings, palier }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok) { setResult(d.sincerity || null); setNextStep(d.next || null); setPhase('done'); return }
      setError(d.error || 'Enregistrement impossible.'); setPhase('run')
    } catch { setError('Connexion impossible.'); setPhase('run') }
  }

  // pré-remplir l'âge si repris
  useEffect(() => { if (q?.type === 'number' && answers[q.id] != null) setAgeInput(String(answers[q.id])) }, [idx, q, answers])

  const progress = useMemo(() => Math.round(((idx) / total) * 100), [idx, total])

  const shell = 'min-h-screen relative'
  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties

  if (phase === 'loading') return <main className={shell} style={bg}><div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div></main>

  if (phase === 'auth') return (
    <main className={shell} style={bg}>
      <div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Connecte-toi d’abord</h1>
        <p className="mt-3 mb-7 text-[15px]" style={{ color: C.smoke }}>Ton questionnaire est rattaché à ton compte.</p>
        <a href={`/login?next=/sos-meet/questionnaire%3Fpalier%3D${palier}`} className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Me connecter</a>
      </div>
    </main>
  )

  if (phase === 'done') return (
    <main className={shell} style={bg}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -8%, rgba(155,27,46,0.18), transparent 55%)' }} />
      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <div style={{ ...serif, fontSize: 44, color: C.garnet }}>♥</div>
        <h1 className="mt-2 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6vw,2.6rem)' }}>
          {palier === 'essentiel' ? 'Ton profil est prêt' : 'Te voilà un peu plus dévoilé·e'}
        </h1>
        <p className="text-[15px] leading-relaxed mb-6" style={{ color: C.smoke }}>
          Merci pour ta sincérité. {palier === 'essentiel' ? 'Ton profil de compatibilité est enregistré.' : 'Tes rencontres vont s’affiner.'}
          {result?.coherent && <><br /><span style={{ color: C.ember }}>✦ Profil cohérent</span></>}
        </p>

        {/* Le palier suivant : proposé, jamais imposé. */}
        {nextStep && (
          <div className="w-full mb-6 rounded-2xl px-6 py-6 text-left" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: C.smoke2 }}>Aller plus loin</span>
            <h2 className="mt-2 mb-1.5" style={{ ...serif, fontWeight: 400, fontSize: '1.35rem' }}>{nextStep.title}</h2>
            <p className="text-[14px] leading-relaxed mb-4" style={{ color: C.smoke }}>{nextStep.tagline}</p>
            {nextStep.sensitive && (
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: C.smoke2 }}>
                Ces questions touchent à ta vie intime. Elles restent privées et ne servent qu’à
                affiner tes rencontres, tu peux les passer.
              </p>
            )}
            <a href={`/sos-meet/questionnaire?palier=${nextStep.id}`}
              className="inline-block px-6 py-3 rounded-full text-[13px] tracking-[0.12em] uppercase"
              style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>
              {nextStep.title} · {nextStep.minutes} min →
            </a>
          </div>
        )}

        <a href="/sos-meet/decouverte" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase"
          style={nextStep
            ? { border: `1px solid ${C.line}`, color: C.alabaster }
            : { background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9', boxShadow: '0 14px 34px -14px rgba(155,27,46,0.6)' }}>
          Découvrir mes compatibilités →
        </a>
        <span className="mt-4 text-[12px]" style={{ color: C.smoke2 }}>
          {nextStep ? 'Tu peux y revenir quand tu veux.' : 'Tu t’es entièrement dévoilé·e. Tes matchs sont au plus fin.'}
        </span>
      </div>
    </main>
  )

  // ── phase run / saving ──
  return (
    <main className={shell} style={bg}>
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -8%, rgba(155,27,46,0.14), transparent 55%)' }} />
      {/* progress */}
      <div className="fixed top-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(242,235,228,0.06)' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${C.garnet}, ${C.ember})`, transition: 'width .3s' }} />
      </div>

      <div className="relative max-w-lg mx-auto px-6 min-h-screen flex flex-col justify-center py-20">
        <div className="flex items-center justify-between mb-8 text-[12px]" style={{ color: C.smoke2 }}>
          <span><span style={{ color: C.smoke }}>{current.title}</span> · {idx + 1} / {total}</span>
          {q.sensitive && <span style={{ color: C.smoke }}>· question intime</span>}
        </div>

        <h2 className="mb-8" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.6rem,4.6vw,2.3rem)', lineHeight: 1.12 }}>{q.text}</h2>

        {q.type === 'number' ? (
          <div>
            <input type="number" min={18} max={120} value={ageInput} onChange={(e) => setAgeInput(e.target.value)} placeholder="Ton âge"
              className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none border" style={{ ...sans, background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster }} />
            <button onClick={submitNumber} className="mt-5 w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase"
              style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Continuer</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {q.choices?.map((c, i) => {
              const active = answers[q.id] === i
              return (
                <button key={i} onClick={() => choose(i)}
                  className="text-left px-5 py-4 rounded-xl text-[15px] transition-colors"
                  style={{ border: `1px solid ${active ? C.garnet : C.line}`, background: active ? 'rgba(155,27,46,0.18)' : C.card, color: active ? C.alabaster : C.smoke }}>
                  {c.label}
                </button>
              )
            })}
          </div>
        )}

        {error && <p className="mt-4 text-[13px]" style={{ color: C.ember }}>{error}</p>}

        <div className="mt-8 flex items-center justify-between text-[13px]">
          <button onClick={back} disabled={idx === 0} className="disabled:opacity-30" style={{ color: C.smoke }}>← Précédent</button>
          {q.type !== 'number' && answers[q.id] != null && (
            <button onClick={next} style={{ color: C.ember }}>{idx === total - 1 ? 'Terminer' : 'Suivant →'}</button>
          )}
        </div>

        {phase === 'saving' && <p className="mt-6 text-center text-[13px]" style={{ color: C.smoke }}>Calcul de ton profil…</p>}
      </div>
    </main>
  )
}

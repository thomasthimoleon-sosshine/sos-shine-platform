'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { COUPLE_QUESTIONS, SECTIONS } from '@/lib/sosmeet/couple/questionnaire'

const C = {
  ink: '#0A090B', card: '#151016', line: 'rgba(242,235,228,0.12)',
  garnet: '#9B1B2E', garnetSoft: '#7d1723', ember: '#C1121F',
  alabaster: '#F2EBE4', smoke: '#A99A96', smoke2: '#6E6360',
}
const serif = { fontFamily: 'var(--sm-serif), Georgia, serif' }
const sans = { fontFamily: 'var(--sm-sans), system-ui, sans-serif' }
const cta: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9',
}
const ghost: React.CSSProperties = { border: `1px solid ${C.line}`, color: C.alabaster }

type Phase = 'loading' | 'auth' | 'nodup' | 'intro' | 'run' | 'sealing' | 'done' | 'sealed' | 'support'

export default function CoupleQuestionnaireClient() {
  const questions = COUPLE_QUESTIONS
  const total = questions.length

  const [phase, setPhase] = useState<Phase>('loading')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({})
  const [timings, setTimings] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [bothDone, setBothDone] = useState(false)
  const shownAt = useRef(0)
  const dirty = useRef(false)

  // ── Reprise ──
  useEffect(() => {
    fetch('/api/sosmeet/couple/answers')
      .then(async (r) => {
        if (r.status === 401) { setPhase('auth'); return }
        if (r.status === 404) { setPhase('nodup'); return }
        const d = await r.json()
        if (d.sealed) { setPhase('sealed'); return }
        const a = d.answers || {}
        setAnswers(a); setOpenAnswers(d.openAnswers || {})
        const next = questions.findIndex(q => q.type === 'text' ? !(d.openAnswers || {})[q.id] : a[q.id] == null)
        setIdx(next === -1 ? 0 : next)
        setPhase(Object.keys(a).length > 0 ? 'run' : 'intro')
      })
      .catch(() => setPhase('auth'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const q = questions[idx]
  const section = useMemo(() => SECTIONS.find(s => s.id === q?.section), [q])
  // Première question d'une section : on annonce la section.
  const opensSection = idx === 0 || questions[idx - 1]?.section !== q?.section

  useEffect(() => { shownAt.current = typeof performance !== 'undefined' ? performance.now() : Date.now() }, [idx, phase])

  // ── Sauvegarde automatique, discrète ──
  const save = useCallback(async () => {
    if (!dirty.current) return
    dirty.current = false
    try {
      await fetch('/api/sosmeet/couple/answers', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, openAnswers, timings }),
      })
    } catch { /* on retentera au prochain battement */ dirty.current = true }
  }, [answers, openAnswers, timings])

  useEffect(() => {
    if (phase !== 'run') return
    const t = setInterval(save, 6000)
    return () => { clearInterval(t); save() }
  }, [phase, save])

  function record(qid: string, value: number) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    setTimings(t => ({ ...t, [qid]: Math.max(0, Math.round(now - shownAt.current)) }))
    setAnswers(a => ({ ...a, [qid]: value }))
    dirty.current = true
  }

  function choose(optIndex: number) {
    record(q.id, optIndex)
    setTimeout(() => { if (idx < total - 1) setIdx(idx + 1); else finish() }, 150)
  }

  function next() { if (idx < total - 1) { setIdx(idx + 1) } else { finish() } }
  function back() { if (idx > 0) setIdx(idx - 1) }

  async function finish() {
    setPhase('sealing'); setError(null)
    await save()
    try {
      const r = await fetch('/api/sosmeet/couple/answers', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Impossible de valider.'); setPhase('run'); return }
      if (d.support) { setPhase('support'); return }
      setBothDone(!!d.bothDone); setPhase('done')
    } catch { setError('Connexion impossible.'); setPhase('run') }
  }

  const answeredCount = questions.filter(x => x.type === 'text' ? !!openAnswers[x.id] : answers[x.id] != null).length
  const progress = Math.round((answeredCount / total) * 100)

  const shell = 'min-h-screen relative'
  const bg = { ...sans, background: C.ink, color: C.alabaster } as React.CSSProperties
  const halo = <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -8%, rgba(155,27,46,0.14), transparent 55%)' }} />
  const center = 'relative max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center'

  if (phase === 'loading') return <main className={shell} style={bg}><div className="flex items-center justify-center min-h-screen text-[14px]" style={{ color: C.smoke }}>Un instant…</div></main>

  if (phase === 'auth') return (
    <main className={shell} style={bg}>{halo}<div className={center}>
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Connecte-toi d’abord</h1>
      <p className="mt-3 mb-7 text-[15px]" style={{ color: C.smoke }}>Tes réponses sont rattachées à ton compte, et à toi seul·e.</p>
      <a href="/login?next=/sos-meet/couple/questionnaire" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Me connecter</a>
    </div></main>
  )

  if (phase === 'nodup') return (
    <main className={shell} style={bg}>{halo}<div className={center}>
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Il faut d’abord votre duo</h1>
      <p className="mt-3 mb-7 text-[15px] leading-relaxed" style={{ color: C.smoke }}>L’un de vous l’ouvre, l’autre le rejoint. Ensuite chacun répond de son côté.</p>
      <Link href="/sos-meet/couple/duo" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Ouvrir notre duo</Link>
    </div></main>
  )

  if (phase === 'sealed') return (
    <main className={shell} style={bg}>{halo}<div className={center}>
      <h1 style={{ ...serif, fontWeight: 400, fontSize: '2rem' }}>Tu as déjà terminé</h1>
      <p className="mt-3 mb-7 text-[15px] leading-relaxed" style={{ color: C.smoke }}>Tes réponses sont scellées. C’est ce qui rend la lecture honnête.</p>
      <Link href="/sos-meet/couple/duo" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Voir où vous en êtes</Link>
    </div></main>
  )

  if (phase === 'support') return (
    <main className={shell} style={bg}>
      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col justify-center">
        <h1 className="mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.8rem,5.5vw,2.3rem)', lineHeight: 1.15 }}>Merci pour ta franchise</h1>
        <p className="text-[15.5px] leading-relaxed mb-5" style={{ color: C.smoke }}>
          Ce que tu viens de décrire demande autre chose qu’un exercice de couple. On préfère s’arrêter là plutôt que
          te proposer un rituel de reconnexion qui ne serait pas à la hauteur de ce que tu vis.
        </p>
        <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.garnet}` }}>
          <p className="text-[14.5px] leading-relaxed mb-3" style={{ color: C.alabaster }}>Si tu veux en parler, maintenant ou plus tard :</p>
          <ul className="text-[14.5px] leading-relaxed" style={{ color: C.smoke }}>
            <li className="mb-2"><b style={{ color: C.alabaster }}>3919</b> · Violences Femmes Info. Gratuit, anonyme, 24h/24.</li>
            <li className="mb-2"><b style={{ color: C.alabaster }}>17</b> ou <b style={{ color: C.alabaster }}>112</b> · en cas de danger immédiat.</li>
            <li><b style={{ color: C.alabaster }}>114</b> · par SMS, si tu ne peux pas parler.</li>
          </ul>
        </div>
        <p className="mt-6 text-[13px] leading-relaxed" style={{ color: C.smoke2 }}>
          Ton/ta partenaire ne verra jamais cet écran, ni ce qui l’a déclenché.
        </p>
      </div>
    </main>
  )

  if (phase === 'done') return (
    <main className={shell} style={bg}>{halo}<div className={center}>
      <div style={{ ...serif, fontSize: 42, color: C.garnet }}>♥</div>
      <h1 className="mt-2 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,6vw,2.5rem)' }}>C’est fait</h1>
      <p className="text-[15px] leading-relaxed mb-7" style={{ color: C.smoke }}>
        {bothDone
          ? 'Vous avez répondu tous les deux. Votre carte est en préparation, nous vous prévenons dès qu’elle est prête.'
          : 'Tes réponses sont scellées. On attend maintenant celles de ton/ta partenaire.'}
      </p>
      <Link href="/sos-meet/couple/duo" className="px-8 py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Voir où vous en êtes</Link>
    </div></main>
  )

  if (phase === 'intro') return (
    <main className={shell} style={bg}>{halo}
      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col justify-center py-20">
        <h1 className="mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,6vw,2.6rem)', lineHeight: 1.1 }}>Avant de commencer</h1>
        <ul className="text-[15.5px] leading-relaxed mb-9" style={{ color: C.smoke }}>
          <li className="mb-3.5"><b style={{ color: C.alabaster }}>Personne ne te relira.</b> Ton/ta partenaire ne verra jamais tes réponses. Il ou elle verra seulement que tu as terminé.</li>
          <li className="mb-3.5"><b style={{ color: C.alabaster }}>Réponds vite et franchement.</b> La première réaction est presque toujours la plus juste.</li>
          <li className="mb-3.5"><b style={{ color: C.alabaster }}>Tu peux t’arrêter.</b> Tout est enregistré au fur et à mesure, tu reprends où tu veux.</li>
          <li><b style={{ color: C.alabaster }}>À la fin, tes réponses se scellent.</b> Elles ne seront plus modifiables : c’est ce qui rend la lecture honnête.</li>
        </ul>
        <button onClick={() => setPhase('run')} className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>Commencer</button>
        <span className="mt-4 text-center text-[12.5px]" style={{ color: C.smoke2 }}>{total} questions, une vingtaine de minutes</span>
      </div>
    </main>
  )

  // ── run / sealing ──
  return (
    <main className={shell} style={bg}>{halo}
      <div className="fixed top-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(242,235,228,0.06)' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${C.garnet}, ${C.ember})`, transition: 'width .3s' }} />
      </div>

      <div className="relative max-w-lg mx-auto px-6 min-h-screen flex flex-col justify-center py-20">
        {opensSection && section && (
          <div className="mb-9 pb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
            <h2 style={{ ...serif, fontWeight: 400, fontSize: '1.5rem' }}>{section.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.smoke2 }}>{section.intro}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-7 text-[12px]" style={{ color: C.smoke2 }}>
          <span>{idx + 1} / {total}</span>
          {q.sensitive && <span style={{ color: C.smoke }}>· reste entre toi et nous</span>}
        </div>

        <h3 className="mb-8" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.45rem,4.4vw,2rem)', lineHeight: 1.16 }}>{q.text}</h3>

        {q.type === 'text' ? (
          <div>
            <textarea
              value={openAnswers[q.id] || ''}
              onChange={(e) => { setOpenAnswers(o => ({ ...o, [q.id]: e.target.value })); dirty.current = true }}
              placeholder={q.placeholder} rows={6} maxLength={4000}
              className="w-full px-4 py-3.5 rounded-xl text-[16px] outline-none border resize-none"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster, ...sans }} />
            <button onClick={next} className="mt-5 w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase" style={cta}>
              {idx === total - 1 ? 'Terminer' : 'Continuer'}
            </button>
            <button onClick={next} className="mt-3 w-full py-2 text-[13px]" style={{ color: C.smoke2 }}>Passer cette question</button>
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

        {error && <p className="mt-5 text-[13.5px]" style={{ color: C.ember }}>{error}</p>}

        <div className="mt-8 flex items-center justify-between text-[13px]">
          <button onClick={back} disabled={idx === 0} className="disabled:opacity-30" style={{ color: C.smoke }}>← Précédent</button>
          {q.type !== 'text' && answers[q.id] != null && (
            <button onClick={next} style={{ color: C.ember }}>{idx === total - 1 ? 'Terminer' : 'Suivant →'}</button>
          )}
        </div>

        {phase === 'sealing' && <p className="mt-6 text-center text-[13px]" style={{ color: C.smoke }}>On scelle tes réponses…</p>}
      </div>
    </main>
  )
}

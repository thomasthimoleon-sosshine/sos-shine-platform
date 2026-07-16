'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTIONS, DIMENSIONS, SCALE, TOTAL_QUESTIONS, type Question } from '@/lib/sosmeet/questions'
import { computeScores, type Answers } from '@/lib/sosmeet/scoring'

const C = { cream: '#FAF7F2', violet: '#6B4E9B', lavender: '#9B7EC8', gold: '#C9A96E', ink: '#2B2733' }
const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' }
const sans = { fontFamily: 'var(--font-figtree), -apple-system, system-ui, sans-serif' }
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const dimOf = (key: string) => DIMENSIONS.find((d) => d.key === key)!

export default function ProfilClient() {
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [phase, setPhase] = useState<'email' | 'intro' | 'quiz' | 'done'>('email')
  const [sensitiveConsent, setSensitiveConsent] = useState(false)
  const [answers, setAnswers] = useState<Answers>({})
  const [idx, setIdx] = useState(0)
  const [saveNote, setSaveNote] = useState('')
  const [gateError, setGateError] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Init : email depuis l'URL ou localStorage, puis reprise des réponses
  useEffect(() => {
    let e = ''
    try {
      e = new URLSearchParams(window.location.search).get('email') || localStorage.getItem('sosmeet_email') || ''
    } catch {}
    if (e) {
      setEmail(e)
      setPhase('intro')
      fetch(`/api/sosmeet/profile?email=${encodeURIComponent(e)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.answers && Object.keys(d.answers).length) {
            setAnswers(d.answers)
            // reprendre à la première question non répondue
            const firstUnanswered = QUESTIONS.findIndex((q) => typeof d.answers[q.id] !== 'number')
            setIdx(firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered)
          }
        })
        .catch(() => {})
    }
  }, [])

  const save = useCallback((next: Answers, completed = false) => {
    try { localStorage.setItem('sosmeet_answers', JSON.stringify(next)) } catch {}
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch('/api/sosmeet/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answers: next, sensitiveConsent, completed }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.error) setSaveNote(d.error)
          else { setSaveNote('Enregistré ✓'); setTimeout(() => setSaveNote(''), 1500) }
        })
        .catch(() => {})
    }, completed ? 0 : 900)
  }, [email, sensitiveConsent])

  function answer(q: Question, value: number) {
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    save(next)
    setTimeout(() => {
      if (idx < QUESTIONS.length - 1) setIdx(idx + 1)
      else { save(next, true); setPhase('done') }
    }, 180)
  }

  function startQuiz() {
    setPhase('quiz')
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    setGateError(null)
    const v = emailInput.toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setGateError('Adresse email invalide.'); return }
    try { localStorage.setItem('sosmeet_email', v) } catch {}
    setEmail(v)
    setPhase('intro')
  }

  const answeredN = QUESTIONS.filter((q) => typeof answers[q.id] === 'number').length
  const pct = Math.round((answeredN / TOTAL_QUESTIONS) * 100)

  const wrap = 'min-h-screen overflow-x-hidden'
  const bg = { ...sans, background: C.cream, color: C.ink }

  // ── PHASE : email ──
  if (phase === 'email') {
    return (
      <main style={bg} className={wrap}>
        <div className="max-w-md mx-auto px-6 py-24">
          <Link href="/sos-meet" className="text-[13px]" style={{ color: C.violet }}>← SOS Meet</Link>
          <h1 className="font-normal leading-tight mt-6 mb-3" style={{ ...serif, fontSize: 'clamp(1.8rem,5vw,2.4rem)' }}>Votre profil de compatibilité</h1>
          <p className="text-[15px] leading-relaxed mb-8" style={{ color: 'rgba(43,39,51,0.66)' }}>
            Entrez l&apos;email utilisé pour la liste d&apos;attente. Vos réponses seront sauvegardées : vous pourrez reprendre plus tard.
          </p>
          <form onSubmit={submitEmail} className="space-y-4">
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="vous@email.com"
              className="w-full px-4 py-3.5 rounded-2xl text-[15px] outline-none border" style={{ background: '#fff', borderColor: 'rgba(43,39,51,0.12)', color: C.ink }} />
            {gateError && <p className="text-[13px]" style={{ color: '#c0392b' }}>{gateError}</p>}
            <button type="submit" className="w-full py-4 rounded-full text-[15px] font-semibold" style={{ background: `linear-gradient(135deg,${C.violet},${C.lavender})`, color: C.cream }}>Continuer</button>
          </form>
          <p className="text-[13px] mt-6" style={{ color: 'rgba(43,39,51,0.5)' }}>
            Pas encore inscrit·e ? <Link href="/sos-meet#waitlist" style={{ color: C.violet }}>Rejoindre la liste d&apos;attente</Link>
          </p>
        </div>
      </main>
    )
  }

  // ── PHASE : intro + consentement sensible ──
  if (phase === 'intro') {
    return (
      <main style={bg} className={wrap}>
        <div className="max-w-xl mx-auto px-6 py-20">
          <span className="text-[11px] tracking-[0.2em] uppercase font-semibold px-4 py-1.5 rounded-full" style={{ background: 'rgba(107,78,155,0.08)', color: C.violet }}>~10–15 minutes</span>
          <h1 className="font-normal leading-tight mt-6 mb-4" style={{ ...serif, fontSize: 'clamp(2rem,5.5vw,2.8rem)' }}>Créons votre profil, en profondeur.</h1>
          <p className="text-[16px] leading-relaxed mb-6" style={{ color: 'rgba(43,39,51,0.7)' }}>
            {TOTAL_QUESTIONS} questions pour cerner qui vous êtes vraiment — vos intentions, votre chemin, vos schémas émotionnels,
            vos valeurs — afin de vous faire rencontrer des personnes réellement alignées. Aucune bonne ou mauvaise réponse.
            Vous pouvez vous arrêter et reprendre à tout moment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {DIMENSIONS.map((d) => (
              <div key={d.key} className="rounded-2xl px-3 py-2.5 text-[13px] flex items-center gap-2" style={{ background: '#fff', border: '1px solid rgba(43,39,51,0.07)' }}>
                <span>{d.emoji}</span><span style={{ color: 'rgba(43,39,51,0.7)' }}>{d.label}</span>
              </div>
            ))}
          </div>
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input type="checkbox" checked={sensitiveConsent} onChange={(e) => setSensitiveConsent(e.target.checked)} className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: C.violet }} />
            <span className="text-[13px] leading-relaxed" style={{ color: 'rgba(43,39,51,0.65)' }}>
              Certaines questions touchent votre spiritualité et votre intimité (données sensibles, RGPD art. 9).
              J&apos;accepte qu&apos;elles soient traitées, en Europe, dans le seul but d&apos;améliorer mes futures rencontres. Je peux tout supprimer à tout moment.
            </span>
          </label>
          <button disabled={!sensitiveConsent} onClick={startQuiz} className="w-full py-4 rounded-full text-[15px] font-semibold disabled:opacity-50"
            style={{ background: `linear-gradient(135deg,${C.violet},${C.lavender})`, color: C.cream }}>
            {answeredN > 0 ? 'Reprendre mon profil' : 'Commencer'}
          </button>
        </div>
      </main>
    )
  }

  // ── PHASE : done ──
  if (phase === 'done') {
    const scores = computeScores(answers)
    return (
      <main style={bg} className={wrap}>
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="font-normal leading-tight mb-3" style={{ ...serif, fontSize: 'clamp(1.9rem,5vw,2.6rem)' }}>Votre profil est prêt.</h1>
          <p className="text-[15px] leading-relaxed mb-10" style={{ color: 'rgba(43,39,51,0.66)' }}>
            Merci pour votre présence et votre sincérité. Dès l&apos;ouverture de la bêta, nous vous présenterons des personnes
            réellement alignées sur qui vous êtes.
          </p>
          <div className="text-left space-y-3 mb-10">
            {DIMENSIONS.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between text-[13px] mb-1"><span style={{ color: 'rgba(43,39,51,0.7)' }}>{d.emoji} {d.label}</span><span style={{ color: C.violet }}>{scores[d.key]}</span></div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(107,78,155,0.1)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${scores[d.key]}%`, background: `linear-gradient(90deg,${C.violet},${C.lavender})` }} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/sos-meet" className="inline-block px-7 py-3.5 rounded-full text-[15px] font-semibold" style={{ background: C.gold, color: '#3a2f14' }}>
            Revenir à SOS Meet
          </Link>
        </div>
      </main>
    )
  }

  // ── PHASE : quiz ──
  const q = QUESTIONS[idx]
  const d = dimOf(q.dim)
  const options = q.type === 'choice' ? q.choices! : SCALE
  const current = answers[q.id]

  return (
    <main style={bg} className={wrap}>
      {/* progress bar */}
      <div className="sticky top-0 z-20" style={{ background: C.cream }}>
        <div className="max-w-xl mx-auto px-6 pt-5 pb-3">
          <div className="flex items-center justify-between text-[12px] mb-2" style={{ color: 'rgba(43,39,51,0.55)' }}>
            <span>{d.emoji} {d.label}</span>
            <span>{answeredN}/{TOTAL_QUESTIONS}{saveNote && <span style={{ color: C.violet }}> · {saveNote}</span>}</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(107,78,155,0.12)' }}>
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${C.violet},${C.lavender})` }} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div key={q.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease }}>
            <h2 className="font-normal leading-snug mb-8" style={{ ...serif, fontSize: 'clamp(1.5rem,4.4vw,2.1rem)' }}>{q.text}</h2>
            <div className="space-y-2.5">
              {options.map((o, i) => {
                const active = current === o.value
                return (
                  <button key={i} onClick={() => answer(q, o.value)}
                    className="w-full text-left px-5 py-4 rounded-2xl text-[15px] transition-all hover:scale-[1.01]"
                    style={{
                      background: active ? `linear-gradient(135deg,${C.violet},${C.lavender})` : '#fff',
                      color: active ? C.cream : C.ink,
                      border: `1px solid ${active ? 'transparent' : 'rgba(43,39,51,0.1)'}`,
                    }}>
                    {o.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}
                className="text-[14px] disabled:opacity-30" style={{ color: 'rgba(43,39,51,0.6)' }}>← Précédent</button>
              {typeof current === 'number' && (
                <button onClick={() => { if (idx < QUESTIONS.length - 1) setIdx(idx + 1); else { save(answers, true); setPhase('done') } }}
                  className="text-[14px] font-semibold" style={{ color: C.violet }}>
                  {idx < QUESTIONS.length - 1 ? 'Suivant →' : 'Terminer →'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}

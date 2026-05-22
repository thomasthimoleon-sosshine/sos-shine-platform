'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { QUESTIONS } from '@/lib/quiz-v3/questions'
import { calculateProfile } from '@/lib/quiz-v3/scoring'
import type { Answers } from '@/lib/quiz-v3/types'

// ─── Types ─────────────────────────────────────────────────────────────
type Stage =
  | 'intro'
  | 'quiz'
  | 'nameCapture'
  | 'birthdateCapture'
  | 'emailCapture'
  | 'generating'
  | 'result'

type Protocol = { id: string; title: string; slug: string; dimension_weights: Record<string, number> }

// ─── Helpers ────────────────────────────────────────────────────────────
const PHASE_LABELS: Record<number, string> = {
  1: 'Entrée émotionnelle',
  2: 'Relations & attachement',
  3: 'Corps & somatique',
  4: 'Mental & conditionnements',
  5: 'Spirituel & projection',
}

const PHASE_BREAKS: Record<number, Stage> = {
  8: 'nameCapture',       // after Q8 → ask prénom
  16: 'birthdateCapture', // after Q16 → ask birthdate
  32: 'emailCapture',     // after Q32 → ask email
}

function splitResultSections(text: string): { title: string; body: string }[] {
  const titles = [
    'Ce que je perçois de vous',
    'Ce qui s\'est construit',
    'Ce qui se rejoue',
    'Le chemin qui s\'ouvre',
    'Votre protocole de départ',
  ]
  const sections: { title: string; body: string }[] = []
  let remaining = text

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]
    const idx = remaining.indexOf(title)
    if (idx === -1) continue
    const afterTitle = remaining.slice(idx + title.length).replace(/^\s*\n?/, '')
    const nextTitleIdx = i < titles.length - 1
      ? (() => {
          const nt = titles[i + 1]
          const ni = afterTitle.indexOf(nt)
          return ni === -1 ? afterTitle.length : ni
        })()
      : afterTitle.length
    sections.push({ title, body: afterTitle.slice(0, nextTitleIdx).trim() })
    remaining = afterTitle.slice(nextTitleIdx)
  }

  return sections
}

// ─── Intro Screen ───────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="max-w-sm w-full space-y-10">
        <Link href="/" className="inline-block">
          <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 mx-auto" />
        </Link>

        <div className="space-y-6">
          <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full"
            style={{ background: 'rgba(201,169,97,0.15)', border: '1px solid rgba(201,169,97,0.3)' }}>
            <span style={{ color: 'var(--brand)', fontSize: 20 }}>◆</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
              Lecture approfondie
            </p>
            <h1 className="font-display text-2xl font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Le scanner émotionnel<br />complet
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              40 questions pour un diagnostic sur 12 dimensions de votre vie intérieure.
              À la fin, une fiche personnalisée générée uniquement pour vous.
            </p>
          </div>

          <div className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            {[
              '40 questions · 12 à 15 minutes',
              'Résultat personnalisé par IA',
              'Fiche PDF téléchargeable',
            ].map(t => (
              <div key={t} className="flex items-center justify-center gap-2">
                <span style={{ color: 'var(--brand)' }}>◇</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
          >
            Commencer le scanner →
          </button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Gratuit · Résultat immédiat · PDF offert
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Name Capture ────────────────────────────────────────────────────────
function NameCapture({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="max-w-sm w-full space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Phase 2 - Relations & attachement
          </p>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Avant de continuer…
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Comment puis-je vous appeler ?
          </p>
        </div>
        <input
          type="text"
          autoFocus
          placeholder="Votre prénom"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          className="w-full px-4 py-3 rounded-xl text-center text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(201,169,97,0.3)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          className="w-full py-4 rounded-full text-sm font-semibold transition-all"
          style={{
            background: name.trim()
              ? 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))'
              : 'rgba(255,255,255,0.08)',
            color: name.trim() ? '#000000' : 'var(--text-muted)',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Continuer →
        </button>
      </div>
    </motion.div>
  )
}

// ─── Birthdate Capture ───────────────────────────────────────────────────
function BirthdateCapture({ firstName, onSubmit }: { firstName: string; onSubmit: (date?: string) => void }) {
  const [date, setDate] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="max-w-sm w-full space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Phase 3 - Corps & somatique
          </p>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Une dernière chose, {firstName}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Votre date de naissance ? <span style={{ color: 'var(--text-muted)' }}>(facultatif)</span><br />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Elle nous permet d&apos;affiner votre lecture. Jamais partagée.
            </span>
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(201,169,97,0.3)',
            color: date ? 'var(--text-primary)' : 'var(--text-muted)',
            colorScheme: 'dark',
          }}
        />
        <div className="space-y-2">
          <button
            onClick={() => onSubmit(date || undefined)}
            className="w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
          >
            Continuer →
          </button>
          <button
            onClick={() => onSubmit(undefined)}
            className="w-full py-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Passer cette question
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Email Capture ───────────────────────────────────────────────────────
function EmailCapture({ firstName, onSubmit }: { firstName: string; onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="max-w-sm w-full space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Presque terminé, {firstName}
          </p>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Phase 5 - Spirituel & projection
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Pour vous envoyer votre fiche complète et personnalisée
            avec votre PDF téléchargeable…
          </p>
        </div>
        <input
          type="email"
          autoFocus
          placeholder="votre@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && valid && onSubmit(email)}
          className="w-full px-4 py-3 rounded-xl text-center text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${valid ? 'rgba(201,169,97,0.5)' : 'rgba(201,169,97,0.2)'}`,
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={() => valid && onSubmit(email)}
          disabled={!valid}
          className="w-full py-4 rounded-full text-sm font-semibold transition-all"
          style={{
            background: valid
              ? 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))'
              : 'rgba(255,255,255,0.08)',
            color: valid ? '#000000' : 'var(--text-muted)',
            cursor: valid ? 'pointer' : 'not-allowed',
          }}
        >
          Recevoir ma fiche →
        </button>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Pas de spam · Désabonnement en un clic
        </p>
      </div>
    </motion.div>
  )
}

// ─── Generating Screen ───────────────────────────────────────────────────
function GeneratingScreen({ firstName }: { firstName: string }) {
  const steps = [
    'Analyse de vos 40 réponses…',
    'Cartographie des 12 dimensions…',
    'Génération de votre fiche personnalisée…',
    'Mise en forme de votre lecture…',
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="max-w-sm w-full space-y-10">
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(201,169,97,0.3)', borderTopColor: 'var(--brand)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ color: 'var(--brand)', fontSize: 24 }}>◆</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Lecture en cours, {firstName}…
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {steps[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i <= step ? 'var(--brand)' : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Result Screen ───────────────────────────────────────────────────────
function ResultScreen({
  firstName,
  text,
  isStreaming,
  protocolTitle,
  protocolSlug,
  email,
}: {
  firstName: string
  text: string
  isStreaming: boolean
  protocolTitle?: string
  protocolSlug?: string
  email: string
}) {
  const sections = splitResultSections(text)
  const ctaUrl = protocolSlug
    ? `/protocole/${protocolSlug}?email=${encodeURIComponent(email)}`
    : `/signup?source=quiz-v3&email=${encodeURIComponent(email)}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-6 text-center space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
          Votre lecture personnalisée
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {firstName}, voici ce que je perçois
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Fiche générée sur mesure · {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-2xl mx-auto px-6 pb-16 space-y-8">
        {sections.length > 0 ? (
          sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 space-y-4"
              style={{
                background: i === 4
                  ? 'linear-gradient(160deg, rgba(201,169,97,0.1), rgba(201,169,97,0.03))'
                  : 'rgba(255,255,255,0.03)',
                border: i === 4
                  ? '1px solid rgba(201,169,97,0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {s.body}
              </p>
            </motion.div>
          ))
        ) : (
          // Raw streaming text while parsing
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {text}
              {isStreaming && <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ background: 'var(--brand)', verticalAlign: 'text-bottom' }} />}
            </p>
          </div>
        )}

        {/* CTA */}
        {!isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 text-center pt-4"
          >
            <a
              href={ctaUrl}
              className="block w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
            >
              {protocolTitle ? `Commencer : ${protocolTitle}` : 'Créer mon espace et commencer'}
            </a>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Gratuit · accès immédiat · upgrade possible ensuite
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Question Screen ─────────────────────────────────────────────────────
function QuestionScreen({
  qIndex,
  firstName,
  onAnswer,
}: {
  qIndex: number
  firstName: string
  onAnswer: (key: 'A' | 'B' | 'C' | 'D') => void
}) {
  const q = QUESTIONS[qIndex]
  const totalQ = QUESTIONS.length
  const progress = ((qIndex) / totalQ) * 100
  const phaseLabel = PHASE_LABELS[q.phase]
  const displayText = firstName ? q.text.replace('{prenom}', firstName) : q.text

  return (
    <motion.div
      key={qIndex}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28 }}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--surface)' }}
    >
      {/* Progress bar */}
      <div className="w-full h-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'var(--brand)', width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8 flex-1">
        {/* Phase + counter */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Phase {q.phase} - {phaseLabel}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {qIndex + 1} / {totalQ}
          </span>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)', opacity: 0.6 }}>
            Q{qIndex + 1}
          </p>
          <h2 className="font-display text-xl font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
            {displayText}
          </h2>
        </div>

        {/* Choices */}
        <div className="space-y-3 flex-1">
          {q.choices.map((choice) => (
            <button
              key={choice.key}
              onClick={() => onAnswer(choice.key)}
              className="w-full text-left px-5 py-4 rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}
                >
                  {choice.key}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {choice.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function QuizApprofondiPage() {
  const [stage, setStage] = useState<Stage>('intro')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [firstName, setFirstName] = useState('')
  const [birthdate, setBirthdate] = useState<string | undefined>()
  const [email, setEmail] = useState('')
  const [resultText, setResultText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [protocolTitle, setProtocolTitle] = useState<string | undefined>()
  const [protocolSlug, setProtocolSlug] = useState<string | undefined>()
  const sessionId = useRef(`qv3_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  const abortRef = useRef<AbortController | null>(null)

  const fetchAndGenerate = useCallback(async (
    finalAnswers: Answers,
    prenom: string,
    userEmail: string,
    dob?: string,
  ) => {
    setStage('generating')

    // Fetch protocols to find best match
    let topTitle: string | undefined
    let topSlug: string | undefined
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: protocols } = await (supabase as any).from('protocols').select('*')
      if (protocols && protocols.length > 0) {
        const first: Protocol = protocols[0]
        topTitle = first.title
        topSlug = first.slug
        setProtocolTitle(first.title)
        setProtocolSlug(first.slug)
      }
    } catch { /* protocols optional */ }

    const profile = calculateProfile(finalAnswers, prenom, userEmail, dob, topTitle, topSlug)

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/quiz-v3/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        setResultText('Une erreur est survenue lors de la génération. Veuillez réessayer.')
        setStage('result')
        return
      }

      setStage('result')
      setIsStreaming(true)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setResultText(full)
      }
      setIsStreaming(false)

      // ── Sauvegarde + envoi email après streaming complet ──
      fetch('/api/quiz-v3/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, profile, resultText: full }),
      }).catch(() => { /* non-bloquant */ })

    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setResultText('Une erreur est survenue. Veuillez réessayer.')
        setStage('result')
      }
    }
  }, [])

  const handleAnswer = useCallback((key: 'A' | 'B' | 'C' | 'D') => {
    const q = QUESTIONS[qIndex]
    const newAnswers = { ...answers, [q.id]: key }
    setAnswers(newAnswers)

    const nextIndex = qIndex + 1
    const breakStage = PHASE_BREAKS[nextIndex] // nextIndex=8 means we just answered Q8

    if (breakStage) {
      setQIndex(nextIndex)
      setStage(breakStage)
      return
    }

    if (nextIndex >= QUESTIONS.length) {
      // All 40 done
      fetchAndGenerate(newAnswers, firstName, email, birthdate)
      return
    }

    setQIndex(nextIndex)
  }, [qIndex, answers, firstName, email, birthdate, fetchAndGenerate])

  const handleNameSubmit = useCallback((name: string) => {
    setFirstName(name)
    setStage('quiz')
  }, [])

  const handleBirthdateSubmit = useCallback((dob?: string) => {
    setBirthdate(dob)
    setStage('quiz')
  }, [])

  const handleEmailSubmit = useCallback((userEmail: string) => {
    setEmail(userEmail)
    setStage('quiz')
  }, [])

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <IntroScreen key="intro" onStart={() => setStage('quiz')} />
        )}
        {stage === 'quiz' && (
          <QuestionScreen key={`q-${qIndex}`} qIndex={qIndex} firstName={firstName} onAnswer={handleAnswer} />
        )}
        {stage === 'nameCapture' && (
          <NameCapture key="name" onSubmit={handleNameSubmit} />
        )}
        {stage === 'birthdateCapture' && (
          <BirthdateCapture key="birth" firstName={firstName} onSubmit={handleBirthdateSubmit} />
        )}
        {stage === 'emailCapture' && (
          <EmailCapture key="email" firstName={firstName} onSubmit={handleEmailSubmit} />
        )}
        {stage === 'generating' && (
          <GeneratingScreen key="generating" firstName={firstName} />
        )}
        {stage === 'result' && (
          <ResultScreen
            key="result"
            firstName={firstName}
            text={resultText}
            isStreaming={isStreaming}
            protocolTitle={protocolTitle}
            protocolSlug={protocolSlug}
            email={email}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

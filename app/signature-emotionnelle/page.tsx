'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QUESTIONS, type AllResponses, type QuizResponse } from '@/lib/quiz-v2'
import { processQuizResults } from '@/lib/quiz-v2/scoring'
import type { DimensionScores } from '@/lib/quiz-v2/dimensions'
import { QuizProgress } from '@/components/quiz-v2/QuizProgress'
import { SingleChoice } from '@/components/quiz-v2/SingleChoice'
import { MultiChoice } from '@/components/quiz-v2/MultiChoice'
import { SliderInput } from '@/components/quiz-v2/legacy/SliderInput'
import { FreeTextInput } from '@/components/quiz-v2/legacy/FreeTextInput'
import { EmailCapture } from '@/components/quiz-v2/EmailCapture'
import { ResultPage } from '@/components/quiz-v2/ResultPage'

type Phase = 'intro' | 'quiz' | 'nameCapture' | 'email' | 'result'

function generateSessionId() {
  return `qv2_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

async function trackEvent(sessionId: string, quizResponseId: string | null, eventType: string, eventData?: Record<string, unknown>) {
  try {
    await fetch('/api/quiz-v2/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, quizResponseId, eventType, eventData }),
    })
  } catch { /* non-critical */ }
}

async function saveResponse(sessionId: string, responseId: string | null, data: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch('/api/quiz-v2/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, responseId, ...data }),
    })
    const json = await res.json()
    return json.id || responseId
  } catch {
    return responseId
  }
}

// ═══════════════════════════════════════════
// INTRO SCREEN - no first name
// ═══════════════════════════════════════════
function IntroScreen({ onStart }: { onStart: () => void }) {
  const TICKER_ITEMS = ['✨ Événement SOS Shine', '📍 Sud de la France', '📅 13 juin 2026', '🕕 18h - 21h30', '→ Réserver ma place']
  const items3x = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Ticker événement */}
      <a href="/ceremonie" className="fixed top-0 left-0 right-0 z-50 overflow-hidden" style={{ background: '#C9A961', height: '36px' }}>
        <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
        <div className="flex items-center h-full whitespace-nowrap" style={{ animation: 'ticker 22s linear infinite' }}>
          {items3x.map((item, i) => (
            <span key={i} className="text-xs font-semibold px-4 py-2 mx-3" style={{ color: '#000' }}>{item}</span>
          ))}
        </div>
      </a>

      <div className="max-w-sm w-full space-y-10 pt-9">
        <Link href="/" className="inline-block">
          <img src="/images/logo-shine.png" alt="SOS Shine" className="h-24 mx-auto" />
        </Link>

        <div className="space-y-4">
          <h1 className="font-sans text-[22px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            Découvre le schéma émotionnel<br />
            qui influence tes réactions.
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            12 questions · 3 minutes · résultat immédiat
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full py-4 rounded-full text-sm font-semibold cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--gold-deep, #B8960F))', color: '#000000' }}
          >
            Commencer →
          </button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Gratuit · Aucun engagement · Résultat immédiat
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// NAME CAPTURE - after Q4, more engaged
// ═══════════════════════════════════════════
function NameCaptureScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <div className="max-w-sm w-full text-center space-y-8">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--brand)' }}>
            Un prénom, maintenant.
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Pour personnaliser la suite.
          </p>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton prénom"
            autoFocus
            className="w-full px-5 py-4 rounded-xl text-base text-center outline-none font-sans"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          />
          <button
            onClick={() => name.trim() && onSubmit(name.trim())}
            disabled={!name.trim()}
            className="w-full py-4 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-30"
            style={{
              background: name.trim() ? 'linear-gradient(135deg, var(--brand), var(--gold-deep, #B8960F))' : 'rgba(255,255,255,0.06)',
              color: name.trim() ? '#000' : 'var(--text-muted)',
            }}
          >
            Continuer →
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// QUESTION SCREEN
// ═══════════════════════════════════════════
function QuestionScreen({
  question,
  response,
  onUpdate,
  onNext,
  onPrev,
  canGoBack,
  isLast,
}: {
  question: (typeof QUESTIONS)[0]
  response: QuizResponse
  onUpdate: (r: QuizResponse) => void
  onNext: () => void
  onPrev: () => void
  canGoBack: boolean
  isLast: boolean
}) {
  const hasAnswer = (() => {
    if (question.type === 'single') return (response.choiceIndexes?.length || 0) > 0 || (response.freeText?.trim().length || 0) > 0
    if (question.type === 'multi') return (response.choiceIndexes?.length || 0) > 0 || (response.freeText?.trim().length || 0) > 0
    if (question.type === 'slider') return true
    if (question.type === 'freetext' || question.type === 'freetext_suggestions') return (response.freeText?.trim().length || 0) > 0
    return false
  })()

  const [isOtherSelected, setIsOtherSelected] = useState(
    !!(response.freeText && (!response.choiceIndexes || response.choiceIndexes.length === 0))
  )

  // Single choice auto-advances; show manual button only for other types (or when "other" text field is open)
  const showContinueButton =
    (question.type === 'single' && isOtherSelected) ||
    question.type === 'multi' ||
    question.type === 'slider' ||
    question.type === 'freetext' ||
    question.type === 'freetext_suggestions'

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-lg mx-auto px-6 pt-4 pb-8"
    >
      {question.intro && (
        <p className="text-[11px] mb-3 tracking-wider uppercase font-sans" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {question.intro}
        </p>
      )}

      <h2 className="font-sans font-bold text-base sm:text-[17px] mb-5 leading-snug whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
        {question.shortQuestion || question.question}
      </h2>

      {question.type === 'single' && question.choices && (
        <SingleChoice
          choices={question.choices}
          hasOther={question.hasOther}
          selected={response.choiceIndexes?.[0] ?? null}
          otherText={isOtherSelected ? (response.freeText || '') : ''}
          onSelect={(idx) => { setIsOtherSelected(false); onUpdate({ choiceIndexes: [idx], freeText: '' }) }}
          onOtherChange={(text) => onUpdate({ choiceIndexes: [], freeText: text })}
          onSelectOther={() => { setIsOtherSelected(true); onUpdate({ choiceIndexes: [], freeText: response.freeText || '' }) }}
          isOtherSelected={isOtherSelected}
          onAutoAdvance={onNext}
          microReveal={question.microReveal}
        />
      )}

      {question.type === 'multi' && question.choices && (
        <MultiChoice
          choices={question.choices}
          hasOther={question.hasOther}
          maxSelections={question.multiMax}
          selected={response.choiceIndexes || []}
          otherText={response.freeText || ''}
          onToggle={(idx) => {
            const current = response.choiceIndexes || []
            const next = current.includes(idx) ? current.filter((i: number) => i !== idx) : [...current, idx]
            onUpdate({ ...response, choiceIndexes: next })
          }}
          onOtherChange={(text) => onUpdate({ ...response, freeText: text })}
          isOtherSelected={isOtherSelected}
          onToggleOther={() => { setIsOtherSelected(!isOtherSelected); if (isOtherSelected) onUpdate({ ...response, freeText: '' }) }}
        />
      )}

      {question.type === 'slider' && question.sliderLabels && (
        <SliderInput
          value={response.sliderValue ?? 5}
          onChange={(v) => onUpdate({ ...response, sliderValue: v })}
          onMount={() => { if (response.sliderValue === undefined) onUpdate({ ...response, sliderValue: 5 }) }}
          onAutoAdvance={onNext}
          labels={question.sliderLabels}
          hasOther={question.hasOther}
          otherText={response.freeText || ''}
          onOtherChange={(text) => onUpdate({ ...response, freeText: text })}
        />
      )}

      {question.type === 'freetext' && (
        <FreeTextInput
          value={response.freeText || ''}
          onChange={(text) => onUpdate({ freeText: text })}
          maxChars={question.maxChars}
        />
      )}

      {question.type === 'freetext_suggestions' && (
        <FreeTextInput
          value={response.freeText || ''}
          onChange={(text) => onUpdate({ freeText: text })}
          maxChars={question.maxChars}
          suggestions={question.suggestions}
        />
      )}

      {/* Spacer for sticky nav */}
      <div className="h-28" />

      {/* Sticky bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-[env(safe-area-inset-bottom,20px)] pt-4"
        style={{ background: 'linear-gradient(to top, var(--dark, #000000) 70%, transparent)' }}>
        <div className="max-w-lg mx-auto space-y-2">
          {showContinueButton && (
            <motion.button
              onClick={onNext}
              disabled={!hasAnswer}
              className="w-full py-4 rounded-full text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: hasAnswer ? 'linear-gradient(135deg, var(--brand), var(--gold-deep, #B8960F))' : 'rgba(255,255,255,0.06)',
                color: hasAnswer ? '#000000' : 'var(--text-muted)',
                opacity: hasAnswer ? 1 : 0.4,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: hasAnswer ? 1 : 0.4, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isLast ? 'Voir mon résultat →' : 'Continuer →'}
            </motion.button>
          )}
          {canGoBack && (
            <div className="text-center">
              <button onClick={onPrev} className="text-xs py-2 px-4 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                ← Précédente
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
// Emails that always start fresh - never restore a previous result
const TEST_QUIZ_EMAILS = new Set(['julialaureau@sosshine.com', 'ttse335@gmail.com'])

export default function SignatureEmotionnellePage() {
  const router = useRouter()

  // Restore progress from sessionStorage if available
  const saved = typeof window !== 'undefined' ? sessionStorage.getItem('quiz_v2_progress') : null
  const savedData = saved ? JSON.parse(saved) : null

  // Test users never land on a previous result - they always see the intro
  const isTestUser = savedData?.email && TEST_QUIZ_EMAILS.has(savedData.email.toLowerCase())
  const restoreData = (isTestUser && savedData?.phase === 'result') ? null : savedData

  const [phase, setPhase] = useState<Phase>(restoreData?.phase || 'intro')
  const [firstName, setFirstName] = useState(restoreData?.firstName || '')
  const [currentQ, setCurrentQ] = useState(restoreData?.currentQ || 0)
  const [responses, setResponses] = useState<AllResponses>(restoreData?.responses || {})
  const [sessionId] = useState(restoreData?.sessionId || generateSessionId)
  const [responseId, setResponseId] = useState<string | null>(restoreData?.responseId || null)
  const [email, setEmail] = useState(restoreData?.email || '')
  const [emailLoading, setEmailLoading] = useState(false)
  const [scores, setScores] = useState<DimensionScores>(restoreData?.scores || {})
  const [dominant, setDominant] = useState(restoreData?.dominant || '1')
  const [secondary, setSecondary] = useState(restoreData?.secondary || '2')
  const [q15Response, setQ15Response] = useState(restoreData?.q15Response || '')

  // Save progress to sessionStorage on every change (including result, so browser back restores it)
  useEffect(() => {
    if (phase !== 'intro' && phase !== 'nameCapture') {
      sessionStorage.setItem('quiz_v2_progress', JSON.stringify({
        phase, firstName, currentQ, responses, sessionId, responseId, email,
        scores, dominant, secondary, q15Response,
      }))
    }
  }, [phase, firstName, currentQ, responses, sessionId, responseId, email, scores, dominant, secondary, q15Response])

  // Note: returning-user auto-redirect intentionally removed.
  // Retaking the quiz must always be possible to get a fresh result.

  const [microTension, setMicroTension] = useState<string | null>(null)

  const question = QUESTIONS[currentQ]

  const handleStart = useCallback(async () => {
    try { sessionStorage.removeItem('quiz_v2_progress') } catch {}
    // Reset all state so retakes start completely fresh
    setCurrentQ(0)
    setResponses({})
    setScores({})
    setDominant('1')
    setSecondary('2')
    setQ15Response('')
    setFirstName('')
    setEmail('')
    setResponseId(null)
    setPhase('quiz')
    const id = await saveResponse(sessionId, null, { currentQuestion: 1 })
    setResponseId(id)
    trackEvent(sessionId, id, 'quiz_started', {})
  }, [sessionId])

  const handleNameCapture = useCallback(async (name: string) => {
    setFirstName(name)
    await saveResponse(sessionId, responseId, { firstName: name })
    setPhase('quiz')
    setCurrentQ(4) // continue at Q5
  }, [sessionId, responseId])

  const handleUpdateResponse = useCallback((r: QuizResponse) => {
    setResponses((prev: AllResponses) => ({ ...prev, [question.id]: r }))
  }, [question?.id])

  const handleNext = useCallback(async () => {
    // Check email capture FIRST (before any async)
    if (currentQ === 9) {
      // Save before showing email
      await saveResponse(sessionId, responseId, { responses, currentQuestion: question.id })
      trackEvent(sessionId, responseId, 'quiz_question_answered', { questionId: question.id })
      setMicroTension('La moitié du chemin est là. Ce qui vient maintenant va chercher la racine.')
      setTimeout(() => {
        setMicroTension(null)
        setPhase('email')
      }, 2200)
      return
    }

    // Check completion
    if (currentQ === 14) {
      const result = processQuizResults(responses)
      setScores(result.scores)
      setDominant(result.dominant)
      setSecondary(result.secondary)
      setQ15Response(responses[15]?.freeText || '')

      const rid = await saveResponse(sessionId, responseId, {
        responses,
        scores: result.scores,
        dominantDimension: result.dominant,
        secondaryDimension: result.secondary,
        q15Response: responses[15]?.freeText || '',
        completedAt: new Date().toISOString(),
      })

      trackEvent(sessionId, rid, 'quiz_completed', {
        dominant: result.dominant,
        secondary: result.secondary,
      })

      try {
        await fetch('/api/quiz-v2/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            responseId: rid,
            email,
            firstName,
            scores: result.scores,
            dominant: result.dominant,
            q15Response: responses[15]?.freeText || '',
          }),
        })
      } catch { /* non-critical */ }

      setPhase('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Normal next question - save in background
    saveResponse(sessionId, responseId, { responses, currentQuestion: question.id }).then(rid => {
      if (rid) setResponseId(rid)
    })
    trackEvent(sessionId, responseId, 'quiz_question_answered', { questionId: question.id, questionType: question.type })

    // Name capture after Q4 (if no name yet)
    if (currentQ === 3 && !firstName) {
      setPhase('nameCapture')
      return
    }

    // Micro-tension after Q5
    if (currentQ === 4) {
      setMicroTension('Ce que tu viens d\'écrire - tu ne le formules probablement pas souvent. On va plus loin.')
      setTimeout(() => {
        setMicroTension(null)
        setCurrentQ((prev: number) => prev + 1)
      }, 2200)
      return
    }

    setCurrentQ((prev: number) => prev + 1)
  }, [currentQ, question, responses, sessionId, responseId, email, firstName])

  const handlePrev = useCallback(() => {
    if (currentQ > 0) setCurrentQ((prev: number) => prev - 1)
  }, [currentQ])

  const handleEmailSubmit = useCallback(async (capturedEmail: string) => {
    setEmailLoading(true)
    setEmail(capturedEmail)
    // No redirect for returning users - always let them complete the new quiz.

    await saveResponse(sessionId, responseId, {
      email: capturedEmail,
      emailCapturedAt: new Date().toISOString(),
    })

    trackEvent(sessionId, responseId, 'quiz_email_captured', { email: capturedEmail })

    try {
      await fetch('/api/quiz-v2/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responseId, email: capturedEmail, firstName }),
      })
    } catch { /* non-critical */ }

    setEmailLoading(false)
    setPhase('quiz')
    setCurrentQ(10)
  }, [sessionId, responseId, firstName])

  // Auto-start when coming from landing CTA with ?start=1
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('start') === '1' && phase === 'intro') {
      handleStart()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'result') {
      trackEvent(sessionId, responseId, 'result_page_viewed', { dominant })
    }
  }, [phase, sessionId, responseId, dominant])

  return (
    <main className="min-h-screen relative z-10" style={{ background: 'var(--dark, #000000)' }}>
      <AnimatePresence>
        {microTension && (
          <motion.div
            key="micro-tension"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 px-8"
            style={{ background: 'var(--dark, #000000)' }}
          >
            <motion.p
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-display text-xl sm:text-2xl font-light text-center max-w-xs leading-relaxed"
              style={{ color: 'var(--brand)' }}
            >
              {microTension}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <IntroScreen key="intro" onStart={handleStart} />
        )}

        {phase === 'nameCapture' && (
          <NameCaptureScreen key="nameCapture" onSubmit={handleNameCapture} />
        )}

        {phase === 'quiz' && question && (
          <div key="quiz">
            <div className="sticky top-0 z-10 px-6 py-4" style={{ background: 'var(--dark, #000000)' }}>
              <QuizProgress current={currentQ + 1} total={15} />
            </div>
            <AnimatePresence mode="wait">
              <QuestionScreen
                key={question.id}
                question={question}
                response={responses[question.id] || {}}
                onUpdate={handleUpdateResponse}
                onNext={handleNext}
                onPrev={handlePrev}
                canGoBack={currentQ > 0 && currentQ < 10}
                isLast={currentQ === 14}
              />
            </AnimatePresence>
          </div>
        )}

        {phase === 'email' && (
          <EmailCapture key="email" onSubmit={handleEmailSubmit} loading={emailLoading} />
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ResultPage
              firstName={firstName}
              scores={scores}
              dominant={dominant}
              secondary={secondary}
              q15Response={q15Response}
              email={email}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

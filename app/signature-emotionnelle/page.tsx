'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { QUESTIONS, type AllResponses, type QuizResponse } from '@/lib/quiz-v2'
import { processQuizResults } from '@/lib/quiz-v2/scoring'
import type { DimensionScores } from '@/lib/quiz-v2/dimensions'
import { QuizProgress } from '@/components/quiz-v2/QuizProgress'
import { SingleChoice } from '@/components/quiz-v2/SingleChoice'
import { MultiChoice } from '@/components/quiz-v2/MultiChoice'
import { SliderInput } from '@/components/quiz-v2/SliderInput'
import { FreeTextInput } from '@/components/quiz-v2/FreeTextInput'
import { EmailCapture } from '@/components/quiz-v2/EmailCapture'
import { ResultPage } from '@/components/quiz-v2/ResultPage'

type Phase = 'intro' | 'quiz' | 'email' | 'result'

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
// INTRO SCREEN
// ═══════════════════════════════════════════
function IntroScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <div className="max-w-md w-full text-center space-y-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep, #B8960F))', color: '#050505' }}>S</div>
          <span className="font-display text-lg font-medium" style={{ color: 'var(--gold)' }}>SOS Shine</span>
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Découvre ta Signature Émotionnelle
        </h1>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          15 questions pour comprendre pourquoi tu réagis comme ça. Ton profil émotionnel, tes schémas, et par où commencer.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton prénom"
            autoFocus
            className="w-full px-5 py-4 rounded-xl text-sm text-center outline-none transition-all focus:ring-2 focus:ring-[var(--gold)]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && onStart(name.trim())}
          />
          <button
            onClick={() => name.trim() && onStart(name.trim())}
            disabled={!name.trim()}
            className="w-full py-4 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep, #B8960F))', color: '#050505' }}
          >
            COMMENCER · 6 MIN
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Gratuit. Aucun engagement. Résultat immédiat.
        </p>
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
    if (question.type === 'slider') return response.sliderValue !== undefined
    if (question.type === 'freetext' || question.type === 'freetext_suggestions') return (response.freeText?.trim().length || 0) > 0
    return false
  })()

  const [isOtherSelected, setIsOtherSelected] = useState(
    !!(response.freeText && (!response.choiceIndexes || response.choiceIndexes.length === 0))
  )

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-lg mx-auto px-6 py-8"
    >
      {question.intro && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {question.intro}
        </p>
      )}

      <h2 className="font-display text-lg sm:text-xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>
        {question.question}
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

      <div className="flex justify-between items-center mt-10">
        {canGoBack ? (
          <button onClick={onPrev} className="text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            ← Précédente
          </button>
        ) : <span />}

        <button
          onClick={onNext}
          disabled={!hasAnswer}
          className="px-8 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: hasAnswer ? 'linear-gradient(135deg, var(--gold), var(--gold-deep, #B8960F))' : 'rgba(255,255,255,0.06)',
            color: hasAnswer ? '#050505' : 'var(--text-muted)',
          }}
        >
          {isLast ? 'Voir mon résultat' : 'Suivant →'}
        </button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function SignatureEmotionnellePage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [firstName, setFirstName] = useState('')
  const [currentQ, setCurrentQ] = useState(0)
  const [responses, setResponses] = useState<AllResponses>({})
  const [sessionId] = useState(generateSessionId)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const [scores, setScores] = useState<DimensionScores>({})
  const [dominant, setDominant] = useState('1')
  const [secondary, setSecondary] = useState('2')
  const [q15Response, setQ15Response] = useState('')

  const question = QUESTIONS[currentQ]

  const handleStart = useCallback(async (name: string) => {
    setFirstName(name)
    setPhase('quiz')
    const id = await saveResponse(sessionId, null, { firstName: name, currentQuestion: 1 })
    setResponseId(id)
    trackEvent(sessionId, id, 'quiz_started', { firstName: name })
  }, [sessionId])

  const handleUpdateResponse = useCallback((r: QuizResponse) => {
    setResponses((prev: AllResponses) => ({ ...prev, [question.id]: r }))
  }, [question?.id])

  const handleNext = useCallback(async () => {
    const rid = await saveResponse(sessionId, responseId, {
      responses,
      currentQuestion: question.id,
    })
    if (rid) setResponseId(rid)

    trackEvent(sessionId, rid, 'quiz_question_answered', {
      questionId: question.id,
      questionType: question.type,
    })

    if (currentQ === 9) {
      setPhase('email')
      return
    }

    if (currentQ === 14) {
      const result = processQuizResults(responses)
      setScores(result.scores)
      setDominant(result.dominant)
      setSecondary(result.secondary)
      setQ15Response(responses[15]?.freeText || '')

      await saveResponse(sessionId, rid, {
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

    setCurrentQ(prev => prev + 1)
  }, [currentQ, question, responses, sessionId, responseId, email, firstName])

  const handlePrev = useCallback(() => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1)
  }, [currentQ])

  const handleEmailSubmit = useCallback(async (capturedEmail: string) => {
    setEmailLoading(true)
    setEmail(capturedEmail)

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

  useEffect(() => {
    if (phase === 'result') {
      trackEvent(sessionId, responseId, 'result_page_viewed', { dominant })
    }
  }, [phase, sessionId, responseId, dominant])

  return (
    <main className="min-h-screen" style={{ background: 'var(--dark, #050505)' }}>
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <IntroScreen key="intro" onStart={handleStart} />
        )}

        {phase === 'quiz' && question && (
          <div key="quiz">
            <div className="sticky top-0 z-10 px-6 py-4" style={{ background: 'var(--dark, #050505)' }}>
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

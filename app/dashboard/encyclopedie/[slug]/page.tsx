'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import SubscriptionGate from '@/components/SubscriptionGate'
import type { Douleur, DouleurStep, UserProgress, DouleurQuizQuestion } from '@/types/database'
import { formatXP } from '@/lib/xp'
import { getEncyclopediaPotentialXp, awardEncyclopediaXp } from '@/lib/XpEngine'
import FavoriteButton from '@/components/FavoriteButton'

type StepConfig = {
  num: number
  title: string
  subtitle: string
  icon: string
  color: string
  description: string
  video: string | null
  audio: string | null
  pdf: string | null
  image: string | null
  exercise_content: string | null
}

// Build steps from dynamic douleur_steps or fallback to legacy columns
function buildSteps(douleur: Douleur, dynamicSteps: DouleurStep[]): StepConfig[] {
  if (dynamicSteps.length > 0) {
    return dynamicSteps.map((s, i) => ({
      num: i + 1,
      title: s.title,
      subtitle: s.subtitle || 'Vidéo, audio & ressources',
      icon: s.icon || '📋',
      color: s.color || '#D4AF37',
      description: s.description || '',
      video: s.video_url,
      audio: s.audio_url,
      pdf: s.pdf_url,
      image: s.image_url,
      exercise_content: s.exercise_content,
    }))
  }

  // Legacy fallback (hardcoded 3 steps)
  return [
    {
      num: 1, title: 'Comprendre', subtitle: 'Vidéo, audio & ressources', icon: '🎬', color: '#55EFC4',
      description: 'Analyse émotionnelle. Explication du problème. Apaisement mental. Une approche humaine et directe.',
      video: douleur.video_url, audio: douleur.step1_audio_url, pdf: douleur.step1_pdf_url, image: douleur.step1_image_url, exercise_content: null,
    },
    {
      num: 2, title: 'Libérer & Intégrer', subtitle: 'Audio, vidéo & ressources', icon: '✨', color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation intérieure et reconnexion à soi.',
      video: douleur.step2_video_url, audio: douleur.audio_energy_url, pdf: douleur.step2_pdf_url, image: douleur.step2_image_url, exercise_content: null,
    },
    {
      num: 3, title: 'Agir', subtitle: 'Exercices, audio & ressources', icon: '⚡', color: '#E17055',
      description: 'PDF d\'exercices pratiques et audio guidé. Passez à l\'action concrète. Reprogrammation émotionnelle. Ancrez vos transformations dans le quotidien.',
      video: douleur.step3_video_url, audio: douleur.audio_meditation_url, pdf: douleur.pdf_url, image: douleur.step3_image_url, exercise_content: douleur.exercise_content,
    },
  ]
}

export default function DouleurDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [dynamicSteps, setDynamicSteps] = useState<DouleurStep[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(1)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [notPublished, setNotPublished] = useState(false)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<DouleurQuizQuestion[]>([])
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [quizPassed, setQuizPassed] = useState(false)
  const [bestAttempt, setBestAttempt] = useState<{ score: number; total: number; passed: boolean } | null>(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)

  // Encyclopedia XP state
  const [encXpResult, setEncXpResult] = useState<{
    potentialXp: number; xpEarned: number; xpDeltaAwarded: number; xpRemaining: number
  } | null>(null)
  const [encyclopediaPrevProgress, setEncyclopediaPrevProgress] = useState<{ best_score_percentage: number; xp_awarded: number } | null>(null)

  useEffect(() => {
    function normalizeSlug(s: string): string {
      return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }

    async function load() {
      try {
        const supabase = createClient()
        const decodedSlug = decodeURIComponent(slug)
        const normalizedSlug = normalizeSlug(decodedSlug)

        const { data: allDouleurs, error } = await supabase
          .from('douleurs')
          .select('*')
          .eq('is_published', true)

        if (error) {
          console.error('Erreur chargement challenges:', error.message)
          setFetchError(error.message)
          setLoading(false)
          return
        }

        const published = (allDouleurs ?? []) as Douleur[]

        if (published.length > 0) {
          const match = published.find((d) => {
            const dbSlugNormalized = normalizeSlug(d.slug)
            const titleNormalized = normalizeSlug(d.title)
            return (
              d.slug === slug ||
              d.slug === decodedSlug ||
              d.slug === normalizedSlug ||
              dbSlugNormalized === normalizedSlug ||
              titleNormalized === normalizedSlug
            )
          })

          if (match) {
            setDouleur(match)

            // Load dynamic steps
            const { data: steps } = await supabase
              .from('douleur_steps')
              .select('*')
              .eq('douleur_id', match.id)
              .order('step_number', { ascending: true })

            if (steps && steps.length > 0) {
              setDynamicSteps(steps as DouleurStep[])
            }

            setLoading(false)
            return
          }
        }

        // Not found in published — check if it exists but is unpublished
        const { data: allUnpublished } = await supabase
          .from('douleurs')
          .select('id, title, slug, is_published')

        if (allUnpublished) {
          const items = allUnpublished as { id: string; title: string; slug: string; is_published: boolean }[]
          const unpublishedMatch = items.find((d) => {
            const dbSlugNormalized = normalizeSlug(d.slug)
            const titleNormalized = normalizeSlug(d.title)
            return (
              d.slug === slug ||
              d.slug === decodedSlug ||
              d.slug === normalizedSlug ||
              dbSlugNormalized === normalizedSlug ||
              titleNormalized === normalizedSlug
            )
          })

          if (unpublishedMatch && !unpublishedMatch.is_published) {
            setNotPublished(true)
          }
        }
      } catch (err) {
        console.error('Exception chargement challenge:', err)
        setFetchError(err instanceof Error ? err.message : 'Erreur inattendue')
      }
      setLoading(false)
    }
    load()
  }, [slug])

  // Load user progress + quiz for this challenge
  useEffect(() => {
    async function loadProgress() {
      if (!douleur) return
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('douleur_id', douleur.id)
        .maybeSingle()

      if (data) setProgress(data as UserProgress)

      // Load quiz questions
      const { data: questions } = await supabase
        .from('douleur_quiz_questions')
        .select('*')
        .eq('douleur_id', douleur.id)
        .order('sort_order', { ascending: true })

      if (questions && questions.length > 0) {
        setQuizQuestions(questions as DouleurQuizQuestion[])
      }

      // Load best attempt
      const { data: attempts } = await supabase
        .from('douleur_quiz_attempts')
        .select('score, total, passed')
        .eq('user_id', user.id)
        .eq('douleur_id', douleur.id)
        .order('score', { ascending: false })
        .limit(1)

      if (attempts && attempts.length > 0) {
        setBestAttempt(attempts[0] as { score: number; total: number; passed: boolean })
        if (attempts[0].passed) setQuizPassed(true)
      }

      // Load encyclopedia progress (Boss Quest XP)
      const { data: encProgress } = await supabase
        .from('encyclopedia_progress')
        .select('best_score_percentage, xp_awarded')
        .eq('user_id', user.id)
        .eq('module_id', douleur.id)
        .maybeSingle()

      if (encProgress) {
        setEncyclopediaPrevProgress(encProgress as { best_score_percentage: number; xp_awarded: number })
      }
    }
    loadProgress()
  }, [douleur])

  const steps = douleur ? buildSteps(douleur, dynamicSteps) : []
  const totalSteps = steps.length

  async function markStepComplete(stepNum: number) {
    if (!douleur || !userId) return
    const supabase = createClient()

    // Use dynamic steps_completed JSON field
    const currentCompleted = progress?.steps_completed || {}
    const newCompleted = { ...currentCompleted, [String(stepNum)]: true }

    // Also update legacy fields for backward compatibility
    const legacyUpdates: Record<string, boolean | string> = {}
    if (stepNum === 1) legacyUpdates.step1_completed = true
    if (stepNum === 2) legacyUpdates.step2_completed = true
    if (stepNum === 3) legacyUpdates.step3_completed = true

    if (progress) {
      const updates: Record<string, boolean | string | Record<string, boolean>> = {
        ...legacyUpdates,
        steps_completed: newCompleted,
      }

      // Check if all steps are now complete
      const allComplete = steps.every((s) => newCompleted[String(s.num)])
      if (allComplete) {
        updates.completed_at = new Date().toISOString()
      }

      await supabase.from('user_progress').update(updates).eq('id', progress.id)
      setProgress({
        ...progress,
        ...legacyUpdates,
        steps_completed: newCompleted,
        completed_at: allComplete ? new Date().toISOString() : progress.completed_at,
      } as UserProgress)

      // No per-step XP in V2 — XP is awarded via Boss Quest quiz
    } else {
      const newData = {
        user_id: userId,
        douleur_id: douleur.id,
        step1_completed: stepNum === 1,
        step2_completed: stepNum === 2,
        step3_completed: stepNum === 3,
        steps_completed: newCompleted,
        completed_at: null,
      }
      const { data } = await supabase.from('user_progress').insert(newData).select().single()
      if (data) setProgress(data as UserProgress)
    }
  }

  function isStepCompleted(stepNum: number): boolean {
    if (!progress) return false
    // Check dynamic field first
    if (progress.steps_completed && progress.steps_completed[String(stepNum)]) return true
    // Legacy fallback
    if (stepNum === 1) return progress.step1_completed
    if (stepNum === 2) return progress.step2_completed
    if (stepNum === 3) return progress.step3_completed
    return false
  }

  async function submitQuiz() {
    if (!douleur || !userId || submittingQuiz) return
    setSubmittingQuiz(true)

    let score = 0
    for (const q of quizQuestions) {
      const userSelected = quizAnswers[q.id] || []
      const correct = q.correct_indices as number[]
      const isCorrect = correct.length === userSelected.length &&
        correct.every(c => userSelected.includes(c)) &&
        userSelected.every(u => correct.includes(u))
      if (isCorrect) score++
    }

    const total = quizQuestions.length
    const threshold = Math.ceil(total * 0.8)
    const passed = score >= threshold

    setQuizScore(score)
    setQuizPassed(passed)
    setQuizSubmitted(true)

    const supabase = createClient()
    await supabase.from('douleur_quiz_attempts').insert({
      user_id: userId,
      douleur_id: douleur.id,
      score,
      total,
      passed,
      answers: quizQuestions.map(q => quizAnswers[q.id] || []),
    })

    setBestAttempt({ score, total, passed })

    // Award encyclopedia XP via Boss Quest system (with delta logic)
    const scorePercentage = Math.round((score / total) * 100)
    try {
      const xpResult = await awardEncyclopediaXp(userId, douleur.id, scorePercentage, steps.length)
      setEncXpResult(xpResult)
    } catch { /* non-critical */ }

    setSubmittingQuiz(false)
  }

  function resetQuiz() {
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizScore(null)
  }

  function toggleQuizAnswer(questionId: string, optionIndex: number) {
    setQuizAnswers(prev => {
      const current = prev[questionId] || []
      const isSelected = current.includes(optionIndex)
      return {
        ...prev,
        [questionId]: isSelected
          ? current.filter(i => i !== optionIndex)
          : [...current, optionIndex],
      }
    })
  }

  const completedSteps = steps.filter(s => isStepCompleted(s.num)).length
  const allStepsCompleted = completedSteps === totalSteps
  const hasQuiz = quizQuestions.length > 0
  const quizStepNum = totalSteps + 1

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!douleur) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {notPublished ? 'Challenge en cours de préparation' : 'Challenge émotionnel non trouvé'}
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          {fetchError
            ? `Une erreur est survenue lors du chargement. Veuillez réessayer.`
            : notPublished
            ? `Ce challenge émotionnel existe mais n'est pas encore publié. L'administrateur doit le publier depuis le back-office.`
            : `Ce challenge émotionnel n'est pas encore disponible ou n'existe pas.`}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg text-sm font-medium mb-4 cursor-pointer"
          style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          Réessayer
        </button>
        <Link href="/dashboard/encyclopedie" className="block text-sm font-medium mt-2" style={{ color: 'var(--gold)' }}>
          Retour à l&apos;encyclopédie
        </Link>
      </div>
    )
  }

  const currentStep = steps[activeStep - 1]

  return (
    <SubscriptionGate>
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/encyclopedie" className="transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Encyclopédie
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span style={{ color: 'var(--text-primary)' }}>{douleur.title}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {douleur.title}
          </h1>
          <FavoriteButton slug={douleur.slug} />
          {progress?.completed_at && (
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.2)' }}>
              Complété
            </span>
          )}
        </div>
        <p className="mt-2 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {douleur.description}
        </p>

        {/* XP Potential Badge */}
        {hasQuiz && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              XP Potentiel : {formatXP(getEncyclopediaPotentialXp(steps.length))}
            </span>
            {encyclopediaPrevProgress && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(85,239,196,0.08)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.15)' }}>
                XP Obtenu : {formatXP(encyclopediaPrevProgress.xp_awarded)} / Restant : {formatXP(getEncyclopediaPotentialXp(steps.length) - encyclopediaPrevProgress.xp_awarded)}
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progression</span>
            <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>{completedSteps}/{totalSteps} étapes</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Steps navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step) => {
          const completed = isStepCompleted(step.num)
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
              style={{
                background: activeStep === step.num ? `${step.color}15` : 'var(--dark-card)',
                border: activeStep === step.num ? `1px solid ${step.color}40` : '1px solid var(--dark-border)',
                color: activeStep === step.num ? step.color : 'var(--text-secondary)',
              }}
            >
              {completed ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <span className="text-lg">{step.icon}</span>
              )}
              <span>Étape {step.num}</span>
            </button>
          )
        })}
        {/* Quiz step button */}
        {hasQuiz && (
          <button
            onClick={() => setActiveStep(quizStepNum)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
            style={{
              background: activeStep === quizStepNum ? 'rgba(212,175,55,0.15)' : 'var(--dark-card)',
              border: activeStep === quizStepNum ? '1px solid rgba(212,175,55,0.4)' : '1px solid var(--dark-border)',
              color: activeStep === quizStepNum ? '#D4AF37' : 'var(--text-secondary)',
              opacity: allStepsCompleted ? 1 : 0.5,
            }}
          >
            {quizPassed ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <span className="text-lg">📝</span>
            )}
            <span>Quiz</span>
          </button>
        )}
      </div>

      {/* Active step content */}
      {activeStep <= totalSteps && currentStep && <div className="rounded-2xl p-6 sm:p-8" style={{ background: `${currentStep.color}06`, border: `1px solid ${currentStep.color}15` }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${currentStep.color}15` }}>
            {currentStep.icon}
          </div>
          <div>
            <span className="text-xs font-medium block" style={{ color: currentStep.color, opacity: 0.7 }}>
              Étape {currentStep.num}/{totalSteps}
            </span>
            <h2 className="font-display text-xl font-semibold" style={{ color: currentStep.color }}>
              {currentStep.title}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentStep.subtitle}</p>
          </div>
        </div>

        {currentStep.description && (
          <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {currentStep.description}
          </p>
        )}

        {/* Content area — show ALL available media for this step */}
        {(() => {
          const hasAnyContent = currentStep.video || currentStep.audio || currentStep.pdf || currentStep.image || currentStep.exercise_content

          if (!hasAnyContent) {
            return (
              <div className="rounded-xl p-8 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', border: `1px dashed ${currentStep.color}30` }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${currentStep.color}15` }}>
                    <span className="text-2xl">{currentStep.icon}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Contenu bientôt disponible</p>
                </div>
              </div>
            )
          }

          return (
            <div className="space-y-4">
              {currentStep.video && (
                <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--dark)' }}>
                  <video
                    src={currentStep.video}
                    poster={currentStep.image || undefined}
                    controls
                    preload="metadata"
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Image standalone only when there's no video (otherwise it's used as poster) */}
              {!currentStep.video && currentStep.image && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark)' }}>
                  <img src={currentStep.image} alt={`${douleur?.title} — Étape ${currentStep.num}`} className="w-full h-auto rounded-xl" style={{ maxHeight: '500px', objectFit: 'contain' }} />
                </div>
              )}

              {currentStep.audio && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Audio — {currentStep.title}
                  </p>
                  {/* Audio relaxation disclaimer */}
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}>
                    <span className="text-lg flex-shrink-0 mt-0.5">🎧</span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Avant de lancer cet audio, installez-vous confortablement dans un endroit calme et détendu. Mettez votre casque audio, respirez profondément et laissez-vous guider en toute sérénité.
                    </p>
                  </div>
                  <audio src={currentStep.audio} controls className="w-full" />
                </div>
              )}

              {currentStep.pdf && (
                <a href={currentStep.pdf} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl transition-all hover:opacity-80"
                  style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}>
                  <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Télécharger le PDF</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Exercices & plan d&apos;action</p>
                  </div>
                </a>
              )}

              {currentStep.exercise_content && (
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <h4 className="font-semibold text-sm mb-3" style={{ color: currentStep.color }}>Exercice</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.exercise_content}
                  </p>
                </div>
              )}
            </div>
          )
        })()}

        {/* Step completion + navigation */}
        <div className="mt-8 pt-6 space-y-4" style={{ borderTop: `1px solid ${currentStep.color}15` }}>
          {!isStepCompleted(currentStep.num) ? (
            <button
              onClick={() => markStepComplete(currentStep.num)}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: `${currentStep.color}15`, color: currentStep.color, border: `1px solid ${currentStep.color}30` }}
            >
              Marquer l&apos;étape {currentStep.num} comme terminée
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(85,239,196,0.06)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.15)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Étape terminée
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="flex items-center gap-2 text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Étape précédente
            </button>
            <button
              onClick={() => setActiveStep(Math.min(hasQuiz ? quizStepNum : totalSteps, activeStep + 1))}
              disabled={activeStep === totalSteps && !hasQuiz}
              className="flex items-center gap-2 text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: currentStep.color }}
            >
              {activeStep === totalSteps && hasQuiz ? 'Passer au Quiz' : 'Étape suivante'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>}

      {/* ── Quiz Section ── */}
      {activeStep === quizStepNum && hasQuiz && (
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(212,175,55,0.12)' }}>
              📝
            </div>
            <div>
              <span className="text-xs font-medium block" style={{ color: '#D4AF37', opacity: 0.7 }}>
                Validation
              </span>
              <h2 className="font-display text-xl font-semibold" style={{ color: '#D4AF37' }}>
                Quiz de compréhension
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {quizQuestions.length} questions — Minimum {Math.ceil(quizQuestions.length * 0.8)}/{quizQuestions.length} pour valider
              </p>
            </div>
          </div>

          {!allStepsCompleted ? (
            <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(212,175,55,0.3)' }}>
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Terminez les {totalSteps} étapes d&apos;abord
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Vous devez compléter toutes les étapes avant de passer le quiz.
              </p>
            </div>
          ) : quizPassed && !quizSubmitted ? (
            <div className="space-y-4">
              <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(85,239,196,0.06)', border: '1px solid rgba(85,239,196,0.2)' }}>
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#55EFC4' }}>
                  Quiz validé !
                </h3>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Vous avez obtenu {bestAttempt?.score}/{bestAttempt?.total} — Bravo !
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Vous pouvez repasser le quiz si vous le souhaitez.
                </p>
              </div>
              <button onClick={resetQuiz}
                className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer transition-all"
                style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                Repasser le quiz
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bestAttempt && !quizSubmitted && (
                <div className="rounded-lg px-4 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                  Meilleur score précédent : {bestAttempt.score}/{bestAttempt.total}
                </div>
              )}

              {quizQuestions.map((q, qIdx) => {
                const userSelected = quizAnswers[q.id] || []
                const correct = q.correct_indices as number[]
                const isCorrectAnswer = quizSubmitted && correct.length === userSelected.length &&
                  correct.every(c => userSelected.includes(c)) && userSelected.every(u => correct.includes(u))

                return (
                  <div key={q.id} className="rounded-xl p-5" style={{
                    background: quizSubmitted
                      ? isCorrectAnswer ? 'rgba(85,239,196,0.04)' : 'rgba(255,107,107,0.04)'
                      : 'rgba(0,0,0,0.2)',
                    border: quizSubmitted
                      ? isCorrectAnswer ? '1px solid rgba(85,239,196,0.2)' : '1px solid rgba(255,107,107,0.2)'
                      : '1px solid var(--dark-border)',
                  }}>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-mono text-xs mr-2" style={{ color: '#D4AF37' }}>Q{qIdx + 1}</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userSelected.includes(oIdx)
                        const isCorrectOpt = correct.includes(oIdx)
                        let optStyle: React.CSSProperties = {
                          background: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '2px solid rgba(212,175,55,0.5)' : '2px solid var(--dark-border)',
                          color: isSelected ? '#D4AF37' : 'var(--text-secondary)',
                        }
                        if (quizSubmitted) {
                          if (isCorrectOpt) {
                            optStyle = {
                              background: 'rgba(85,239,196,0.1)',
                              border: '2px solid rgba(85,239,196,0.4)',
                              color: '#55EFC4',
                            }
                          } else if (isSelected && !isCorrectOpt) {
                            optStyle = {
                              background: 'rgba(255,107,107,0.1)',
                              border: '2px solid rgba(255,107,107,0.4)',
                              color: '#FF6B6B',
                            }
                          }
                        }
                        return (
                          <button key={oIdx} type="button"
                            onClick={() => !quizSubmitted && toggleQuizAnswer(q.id, oIdx)}
                            disabled={quizSubmitted}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all cursor-pointer disabled:cursor-default"
                            style={optStyle}>
                            <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs font-semibold"
                              style={{
                                background: isSelected || (quizSubmitted && isCorrectOpt) ? 'currentColor' : 'transparent',
                                border: isSelected || (quizSubmitted && isCorrectOpt) ? 'none' : '2px solid currentColor',
                                color: isSelected || (quizSubmitted && isCorrectOpt)
                                  ? (quizSubmitted && isCorrectOpt ? '#55EFC4' : quizSubmitted && !isCorrectOpt ? '#FF6B6B' : '#D4AF37')
                                  : 'var(--text-muted)',
                              }}>
                              {(isSelected || (quizSubmitted && isCorrectOpt)) && (
                                <span style={{ color: '#09090b' }}>
                                  {quizSubmitted && isCorrectOpt ? '✓' : quizSubmitted && isSelected && !isCorrectOpt ? '✕' : '✓'}
                                </span>
                              )}
                            </span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {quizSubmitted ? (
                <div className="space-y-4">
                  <div className="rounded-xl p-6 text-center" style={{
                    background: quizPassed ? 'rgba(85,239,196,0.06)' : 'rgba(255,107,107,0.06)',
                    border: quizPassed ? '1px solid rgba(85,239,196,0.2)' : '1px solid rgba(255,107,107,0.2)',
                  }}>
                    <div className="text-4xl mb-3">{quizPassed ? '🎉' : '📖'}</div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: quizPassed ? '#55EFC4' : '#FF6B6B' }}>
                      {quizPassed ? 'Félicitations !' : 'Continuez vos efforts'}
                    </h3>
                    <p className="text-2xl font-display font-bold mb-2" style={{ color: quizPassed ? '#55EFC4' : '#FF6B6B' }}>
                      {quizScore}/{quizQuestions.length}
                    </p>
                    {/* XP Result Display */}
                    {encXpResult && (
                      <div className="rounded-lg px-4 py-3 mt-2 space-y-1"
                        style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                        {encXpResult.xpDeltaAwarded > 0 ? (
                          <p className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
                            +{formatXP(encXpResult.xpDeltaAwarded)} XP gagné !
                          </p>
                        ) : (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Score non amélioré — pas d&apos;XP supplémentaire
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <span>XP Obtenu : {formatXP(encXpResult.xpEarned)} / {formatXP(encXpResult.potentialXp)}</span>
                          {encXpResult.xpRemaining > 0 && (
                            <span style={{ color: '#D4AF37' }}>Restant à débloquer : {formatXP(encXpResult.xpRemaining)}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {quizPassed ? (
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Vous avez validé ce challenge avec succès ! Votre compréhension est solide.
                      </p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          Un changement durable nécessite une compréhension profonde.
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Améliorez votre score pour débloquer plus d&apos;XP. Retravaillez les étapes et repassez le quiz.
                        </p>
                      </div>
                    )}
                  </div>
                  <button onClick={resetQuiz}
                    className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                    style={{
                      background: quizPassed ? 'rgba(85,239,196,0.1)' : 'rgba(212,175,55,0.15)',
                      color: quizPassed ? '#55EFC4' : '#D4AF37',
                      border: quizPassed ? '1px solid rgba(85,239,196,0.2)' : '1px solid rgba(212,175,55,0.3)',
                    }}>
                    {quizPassed ? 'Repasser le quiz' : 'Réessayer le quiz'}
                  </button>
                </div>
              ) : (
                <button onClick={submitQuiz}
                  disabled={submittingQuiz || Object.keys(quizAnswers).length < quizQuestions.length}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#D4AF37', color: '#09090b' }}>
                  {submittingQuiz ? 'Validation en cours...' : `Valider mes réponses (${Object.keys(quizAnswers).length}/${quizQuestions.length})`}
                </button>
              )}

              {/* Navigation back */}
              <div className="pt-2">
                <button onClick={() => setActiveStep(totalSteps)}
                  className="flex items-center gap-2 text-sm transition-colors cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Retour à l&apos;étape {totalSteps}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat button */}
      <Link
        href={`/dashboard/chat/${douleur.slug}`}
        className="block rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 group"
        style={{
          background: 'rgba(255, 107, 53, 0.06)',
          border: '1px solid rgba(255, 107, 53, 0.15)',
        }}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl transition-transform group-hover:scale-110" style={{ background: 'rgba(255, 107, 53, 0.12)' }}>
          🔥
        </div>
        <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Accéder au Feu de Camp — {douleur.title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Échangez avec ceux qui traversent la même épreuve que vous.
        </p>
      </Link>
    </div>
    </SubscriptionGate>
  )
}

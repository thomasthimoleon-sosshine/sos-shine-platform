'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import SubscriptionGate from '@/components/SubscriptionGate'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
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
  video2: string | null
  audio: string | null
  pdf: string | null
  image: string | null
  video_cover: string | null
  video2_cover: string | null
  audio_cover: string | null
  audio2_cover: string | null
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
      color: s.color || '#C9A961',
      description: s.description || '',
      video: s.video_url,
      video2: s.video_url_2,
      audio: s.audio_url,
      pdf: s.pdf_url,
      image: s.image_url,
      video_cover: (s as any).video_cover || null,
      video2_cover: (s as any).video2_cover || null,
      audio_cover: (s as any).audio_cover || null,
      audio2_cover: (s as any).audio2_cover || null,
      exercise_content: s.exercise_content,
    }))
  }

  // Legacy fallback (hardcoded 3 steps)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = douleur as any
  return [
    {
      num: 1, title: 'Comprendre', subtitle: 'Vidéo, audio & ressources', icon: '🎬', color: '#55EFC4',
      description: 'Analyse émotionnelle. Explication du problème. Apaisement mental. Une approche humaine et directe.',
      video: douleur.video_url, video2: d.video_url_2 || null, audio: douleur.step1_audio_url, pdf: douleur.step1_pdf_url, image: douleur.step1_image_url,
      video_cover: null, video2_cover: null, audio_cover: null, audio2_cover: null, exercise_content: null,
    },
    {
      num: 2, title: 'Libérer & Intégrer', subtitle: 'Audio, vidéo & ressources', icon: '✨', color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation intérieure et reconnexion à soi.',
      video: douleur.step2_video_url, video2: d.step2_video_url_2 || null, audio: douleur.audio_energy_url, pdf: douleur.step2_pdf_url, image: douleur.step2_image_url,
      video_cover: null, video2_cover: null, audio_cover: null, audio2_cover: null, exercise_content: null,
    },
    {
      num: 3, title: 'Agir', subtitle: 'Exercices, audio & ressources', icon: '⚡', color: '#E17055',
      description: 'PDF d\'exercices pratiques et audio guidé. Passez à l\'action concrète. Reprogrammation émotionnelle. Ancrez vos transformations dans le quotidien.',
      video: douleur.step3_video_url, video2: d.step3_video_url_2 || null, audio: douleur.audio_meditation_url, pdf: douleur.pdf_url, image: douleur.step3_image_url,
      video_cover: null, video2_cover: null, audio_cover: null, audio2_cover: null, exercise_content: douleur.exercise_content,
    },
  ]
}

export default function DouleurDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { hasFeature } = useFeatureAccess()
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [relatedDouleurs, setRelatedDouleurs] = useState<Array<{ id: string; title: string; slug: string; subtitle: string | null }>>([])
  const [linkedArticle, setLinkedArticle] = useState<{ slug: string; title: string; excerpt: string | null; cover_image: string | null; read_time: number | null } | null>(null)
  const [relatedTvVideos, setRelatedTvVideos] = useState<Array<{ id: string; title: string; thumbnail_url: string | null; duration_minutes: number }>>([])
  const [relatedShorts, setRelatedShorts] = useState<Array<{ id: string; title: string; thumbnail_url: string | null; duration_seconds: number }>>([])
  const [relatedAudible, setRelatedAudible] = useState<Array<{ id: string; title: string; cover_url: string | null; narrator: string | null; content_type: string }>>([])
  const [relatedBooks, setRelatedBooks] = useState<Array<{ id: string; title: string; author: string; cover_url: string | null; content_type: string }>>([])
  const [dynamicSteps, setDynamicSteps] = useState<DouleurStep[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(1)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [notPublished, setNotPublished] = useState(false)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLegacyAccess, setIsLegacyAccess] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isFreeUser, setIsFreeUser] = useState(false)
  const [showProtocolPaywall, setShowProtocolPaywall] = useState(false)

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
  // Load related content (other douleurs + TV + Shorts + Audible + Library books)
  useEffect(() => {
    async function loadRelated() {
      if (!douleur) return
      const supabase = createClient()

      // 1. Related douleurs: manual picks first, then auto (same category + tags)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const manualSlugs: string[] = (douleur as any).related_slugs || []
      if (manualSlugs.length > 0) {
        const { data } = await supabase
          .from('douleurs')
          .select('id, title, slug, subtitle')
          .eq('is_published', true)
          .in('slug', manualSlugs)
        if (data) setRelatedDouleurs(data as Array<{ id: string; title: string; slug: string; subtitle: string | null }>)
      } else {
        const related: Array<{ id: string; title: string; slug: string; subtitle: string | null }> = []
        const seenIds = new Set<string>([douleur.id])

        // Auto: same category
        if (douleur.category) {
          const { data: catData } = await supabase
            .from('douleurs')
            .select('id, title, slug, subtitle')
            .eq('is_published', true)
            .eq('category', douleur.category)
            .neq('id', douleur.id)
            .limit(6)
          if (catData) {
            for (const d of catData as typeof related) {
              if (!seenIds.has(d.id)) { related.push(d); seenIds.add(d.id) }
            }
          }
        }

        // Auto: tags overlap (if we have fewer than 6)
        if (related.length < 6 && Array.isArray(douleur.tags) && douleur.tags.length > 0) {
          const { data: tagData } = await supabase
            .from('douleurs')
            .select('id, title, slug, subtitle')
            .eq('is_published', true)
            .neq('id', douleur.id)
            .overlaps('tags', douleur.tags)
            .limit(6)
          if (tagData) {
            for (const d of tagData as typeof related) {
              if (!seenIds.has(d.id) && related.length < 6) { related.push(d); seenIds.add(d.id) }
            }
          }
        }

        setRelatedDouleurs(related)
      }

      // 2. Shine TV videos linked to this douleur
      const { data: tvData } = await supabase
        .from('shine_tv_videos')
        .select('id, title, thumbnail_url, duration_minutes')
        .eq('is_published', true)
        .eq('douleur_id', douleur.id)
        .limit(8)
      setRelatedTvVideos((tvData as Array<{ id: string; title: string; thumbnail_url: string | null; duration_minutes: number }>) || [])

      // 3. Shine Shorts linked to this douleur
      const { data: shortsData } = await supabase
        .from('shine_shorts')
        .select('id, title, thumbnail_url, duration_seconds')
        .eq('is_published', true)
        .eq('douleur_id', douleur.id)
        .limit(8)
      setRelatedShorts((shortsData as Array<{ id: string; title: string; thumbnail_url: string | null; duration_seconds: number }>) || [])

      // 4. Shine Audible tracks linked to this douleur
      const { data: audibleData } = await supabase
        .from('shine_audible_tracks')
        .select('id, title, cover_url, narrator, content_type')
        .eq('is_published', true)
        .eq('douleur_id', douleur.id)
        .limit(8)
      setRelatedAudible((audibleData as Array<{ id: string; title: string; cover_url: string | null; narrator: string | null; content_type: string }>) || [])

      // 5. Shine Library books linked to this douleur
      const { data: booksData } = await supabase
        .from('shine_library_books')
        .select('id, title, author, cover_url, content_type')
        .eq('is_published', true)
        .eq('douleur_id', douleur.id)
        .limit(8)
      setRelatedBooks((booksData as Array<{ id: string; title: string; author: string; cover_url: string | null; content_type: string }>) || [])
    }
    loadRelated()
  }, [douleur])

  // Load linked blog article (if any) from blog_articles.douleur_slug
  useEffect(() => {
    async function loadLinkedArticle() {
      if (!douleur?.slug) {
        setLinkedArticle(null)
        return
      }
      const supabase = createClient()
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('blog_articles')
          .select('slug, title, excerpt, cover_image, read_time')
          .eq('douleur_slug', douleur.slug)
          .eq('is_published', true)
          .limit(1)
          .maybeSingle()
        if (data) {
          setLinkedArticle(data as { slug: string; title: string; excerpt: string | null; cover_image: string | null; read_time: number | null })
        }
      } catch {
        // Column may not exist yet — fail silently
      }
    }
    loadLinkedArticle()
  }, [douleur?.slug])

  useEffect(() => {
    async function loadProgress() {
      if (!douleur) return
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsPreviewMode(true)
        return
      }
      setUserId(user.id)

      // Check if user has an active subscription
      try {
        const subRes = await fetch(`/api/subscription/features?user_id=${user.id}`)
        const subData = await subRes.json()
        if (!subData.is_active && !subData.is_admin) {
          // Free logged-in users: step 1 fully accessible — no preview mode cap
          setIsFreeUser(true)
        }
      } catch { /* non-critical */ }

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

      // Check legacy client access (free access to "Déconditionnement" for Julia's former clients)
      const normalizedSlug = slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const isDeconditionnement = normalizedSlug === 'deconditionnement' || normalizedSlug === 'conditionnement'
      if (isDeconditionnement && user.email) {
        const { data: legacyMatch } = await (supabase as any)
          .from('legacy_clients')
          .select('id')
          .ilike('email', user.email)
          .maybeSingle()
        if (legacyMatch) {
          setIsLegacyAccess(true)
        }
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
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!douleur) {
    // Fetch release date for unpublished protocols
    const releaseLabel = (() => {
      try {
        const { getReleaseDate } = require('@/lib/release-schedule')
        return getReleaseDate(slug)
      } catch { return null }
    })()

    if (fetchError) {
      return (
        <div className="max-w-3xl mx-auto text-center py-20">
          <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Une erreur est survenue
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Veuillez réessayer.</p>
          <button onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}>
            Réessayer
          </button>
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="rounded-2xl p-8 sm:p-10 text-center" style={{
          background: 'linear-gradient(160deg, var(--surface-card) 0%, rgba(201,169,97,0.04) 100%)',
          border: '1px solid rgba(201,169,97,0.15)',
        }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}>
            <span className="text-3xl">💛</span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ce protocole arrive {releaseLabel ? `en ${releaseLabel}` : 'bientôt'}
          </h2>

          <p className="text-sm sm:text-[15px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Nous mettons tout notre cœur à préparer ce contenu pour qu&apos;il soit à la hauteur de ce que vous traversez.
            Julia, William et Thomas travaillent dessus pour vous offrir un protocole complet — avec la même profondeur
            et la même bienveillance que tous les autres.
          </p>

          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              En attendant, <strong style={{ color: 'var(--brand)' }}>nous sommes là pour vous</strong>.
              Rejoignez le <Link href="/dashboard/communaute" className="underline font-medium" style={{ color: '#55EFC4' }}>chat communautaire</Link> pour
              échanger avec d&apos;autres membres qui traversent les mêmes épreuves, et participez à
              nos <Link href="/dashboard/evenements" className="underline font-medium" style={{ color: '#55EFC4' }}>lives</Link> où
              Julia, William et Thomas répondent à vos questions en direct.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
              Vous pouvez aussi nous écrire directement — nous vous guiderons personnellement
              vers les ressources qui peuvent déjà vous accompagner.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
            <Link href="/dashboard/communaute"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: 'rgba(85,239,196,0.1)',
                border: '1px solid rgba(85,239,196,0.25)',
                color: '#55EFC4',
              }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
              Rejoindre le chat
            </Link>

            <a href="mailto:julialaureau@sosshine.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
                color: '#000000',
                boxShadow: '0 4px 20px rgba(201,169,97,0.3)',
              }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Écrire à SOS Shine
            </a>
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            julialaureau@sosshine.com
          </p>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <Link href="/dashboard/encyclopedie" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--brand)' }}>
              ← Retour à l&apos;encyclopédie
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStep = steps[activeStep - 1]

  const previewCtaText = isFreeUser ? 'Choisir mon abonnement' : 'Créer mon compte gratuitement'
  const previewCtaLink = isFreeUser ? '/dashboard/tarifs' : '/signup'
  const previewCtaShort = isFreeUser ? 'Choisir mon abonnement' : 'Créer mon compte'

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/encyclopedie" className="transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Encyclopédie
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span style={{ color: 'var(--text-primary)' }}>{douleur.title}</span>
      </div>

      {/* SOS banner — appears at the top when an SOS meditation is configured */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(douleur as any)?.sos_audio_url && (
        <Link
          href={`/dashboard/encyclopedie/${douleur.slug}/sos`}
          className="block rounded-2xl p-5 transition-all hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(225,112,85,0.08))',
            border: '1px solid rgba(255,107,107,0.4)',
            boxShadow: '0 4px 20px rgba(255,107,107,0.15)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center pulse-ring"
              style={{ background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)' }}>
              <span className="text-2xl">🆘</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-0.5" style={{ color: '#FF6B6B' }}>
                Vous êtes en crise ?
              </p>
              <h3 className="font-display text-lg sm:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Méditation SOS 5 min — accès immédiat
              </h3>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FF6B6B" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>
      )}

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
        <p className="mt-2 text-sm md:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
          {douleur.description}
        </p>

        {/* Tags */}
        {Array.isArray(douleur.tags) && douleur.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {douleur.tags.map((tag: string) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide"
                style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.15)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* XP Potential Badge */}
        {hasQuiz && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(201,169,97,0.1)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.2)' }}>
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
            <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>{completedSteps}/{totalSteps} étapes</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Steps navigation */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const completed = isStepCompleted(step.num)
          return (
            <button
              key={step.num}
              onClick={() => {
                if (isFreeUser && step.num > 1) { setShowProtocolPaywall(true); return }
                setActiveStep(step.num)
              }}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: activeStep === step.num ? `${step.color}15` : 'var(--surface-card)',
                border: activeStep === step.num ? `1px solid ${step.color}40` : '1px solid var(--border)',
                color: activeStep === step.num ? step.color : isFreeUser && step.num > 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                opacity: isFreeUser && step.num > 1 ? 0.6 : 1,
              }}
            >
              {completed ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isFreeUser && step.num > 1 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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
              background: activeStep === quizStepNum ? 'rgba(201,169,97,0.15)' : 'var(--surface-card)',
              border: activeStep === quizStepNum ? '1px solid rgba(201,169,97,0.4)' : '1px solid var(--border)',
              color: activeStep === quizStepNum ? '#C9A961' : 'var(--text-secondary)',
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
          <p className="mb-6 text-sm md:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {currentStep.description}
          </p>
        )}

        {/* Content area — show ALL available media for this step */}
        {(() => {
          const hasAnyContent = currentStep.video || currentStep.video2 || currentStep.audio || currentStep.pdf || currentStep.image || currentStep.exercise_content

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

          function PreviewVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
            const videoRef = React.useRef<HTMLVideoElement>(null)
            const [locked, setLocked] = React.useState(false)

            React.useEffect(() => {
              const vid = videoRef.current
              if (!vid) return
              const onTime = () => {
                if (vid.currentTime >= 30) {
                  vid.pause()
                  setLocked(true)
                }
              }
              vid.addEventListener('timeupdate', onTime)
              return () => vid.removeEventListener('timeupdate', onTime)
            }, [])

            if (locked) {
              return (
                <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.9), rgba(201,169,97,0.05))', border: '1px solid rgba(201,169,97,0.2)' }}>
                  <div className="text-center py-10 px-6">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                      style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.25)' }}>
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--brand)' }}>
                      L&apos;extrait est terminé
                    </h3>
                    <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                      {isFreeUser
                        ? 'Choisissez votre abonnement pour accéder au protocole complet.'
                        : 'Créez votre compte pour accéder au protocole complet.'}
                    </p>
                    <Link href={previewCtaLink}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
                      style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000', boxShadow: '0 4px 20px rgba(201,169,97,0.3)' }}>
                      {previewCtaText}
                    </Link>
                    <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                      Sans engagement. Annulation en un clic.
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--dark)' }}>
                <video ref={videoRef} src={src} poster={poster} controls preload="metadata" className="w-full h-full" />
              </div>
            )
          }

          const lockedOverlay = (label: string) => (
            <div className="relative rounded-xl overflow-hidden aspect-video flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(201,169,97,0.05))', border: '1px solid rgba(201,169,97,0.15)' }}>
              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  {isFreeUser ? 'Abonnez-vous pour accéder à ce contenu' : 'Créez votre compte pour accéder à ce contenu'}
                </p>
                <Link href={previewCtaLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                  {previewCtaShort}
                </Link>
              </div>
            </div>
          )

          return (
            <div className="space-y-4">
              {currentStep.video && (
                isPreviewMode
                  ? <PreviewVideo src={currentStep.video} poster={currentStep.video_cover || currentStep.image || undefined} label={currentStep.title} />
                  : (
                <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--dark)' }}>
                  <video
                    src={currentStep.video}
                    poster={currentStep.video_cover || currentStep.image || undefined}
                    controls
                    preload="metadata"
                    className="w-full h-full"
                  />
                </div>
                )
              )}

              {/* Secondary video (optional) */}
              {currentStep.video2 && (
                isPreviewMode
                  ? <PreviewVideo src={currentStep.video2} poster={currentStep.video2_cover || undefined} label={currentStep.title} />
                  : (
                <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--dark)' }}>
                  <video
                    src={currentStep.video2}
                    poster={currentStep.video2_cover || undefined}
                    controls
                    preload="metadata"
                    className="w-full h-full"
                  />
                </div>
                )
              )}

              {/* Image: shown as standalone when no video, or as cover above audio */}
              {!currentStep.video && currentStep.image && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark)' }}>
                  <img src={currentStep.image} alt={`${douleur?.title} — Étape ${currentStep.num}`} className="w-full h-auto rounded-xl" />
                </div>
              )}

              {currentStep.audio && (
                isPreviewMode ? (() => {
                  function PreviewAudio({ src, title }: { src: string; title: string }) {
                    const audioRef = React.useRef<HTMLAudioElement>(null)
                    const [audioLocked, setAudioLocked] = React.useState(false)

                    React.useEffect(() => {
                      const aud = audioRef.current
                      if (!aud) return
                      const onTime = () => {
                        if (aud.currentTime >= 30) { aud.pause(); setAudioLocked(true) }
                      }
                      aud.addEventListener('timeupdate', onTime)
                      return () => aud.removeEventListener('timeupdate', onTime)
                    }, [])

                    return (
                      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,169,97,0.15)' }}>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Audio — {title}</p>
                        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.12)' }}>
                          <span className="text-lg flex-shrink-0 mt-0.5">🎧</span>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Avant de lancer cet audio, installez-vous confortablement dans un endroit calme et détendu. Mettez votre casque audio, respirez profondément et laissez-vous guider en toute sérénité.
                          </p>
                        </div>
                        {audioLocked ? (
                          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.2)' }}>
                            <p className="text-sm" style={{ color: 'var(--brand)' }}>Vous aimez ? Accédez à la suite</p>
                            <Link href={previewCtaLink} className="px-4 py-2 rounded-full text-xs font-semibold"
                              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                              {previewCtaShort}
                            </Link>
                          </div>
                        ) : (
                          <audio ref={audioRef} src={src} controls className="w-full" />
                        )}
                      </div>
                    )
                  }
                  return <PreviewAudio src={currentStep.audio!} title={currentStep.title} />
                })() : (
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}>
                  {currentStep.audio_cover && (
                    <img src={currentStep.audio_cover} alt={`Audio — ${currentStep.title}`} className="w-full" />
                  )}
                  <div className="p-4 space-y-3">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Audio — {currentStep.title}
                    </p>
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.12)' }}>
                      <span className="text-lg flex-shrink-0 mt-0.5">🎧</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Avant de lancer cet audio, installez-vous confortablement dans un endroit calme et détendu. Mettez votre casque audio, respirez profondément et laissez-vous guider en toute sérénité.
                      </p>
                    </div>
                    <audio src={currentStep.audio} controls className="w-full" />
                  </div>
                </div>
                )
              )}

              {currentStep.pdf && (
                isPreviewMode ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl cursor-pointer" onClick={() => window.location.href = isFreeUser ? '/dashboard/tarifs' : '/signup'}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,169,97,0.15)' }}>
                    <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--brand)' }}>PDF — Exercices & plan d&apos;action</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{isFreeUser ? 'Abonnez-vous pour télécharger' : 'Créez votre compte pour télécharger'}</p>
                    </div>
                  </div>
                ) : (
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
                )
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
              onClick={() => {
                if (isFreeUser && currentStep.num === 1) { setShowProtocolPaywall(true); return }
                markStepComplete(currentStep.num)
              }}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: `${currentStep.color}15`, color: currentStep.color, border: `1px solid ${currentStep.color}30` }}
            >
              {isFreeUser && currentStep.num === 1 ? 'Continuer mon évolution →' : `Marquer l'étape ${currentStep.num} comme terminée`}
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
              onClick={() => {
                const nextStep = Math.min(hasQuiz ? quizStepNum : totalSteps, activeStep + 1)
                if (isFreeUser && nextStep > 1) { setShowProtocolPaywall(true); return }
                setActiveStep(nextStep)
              }}
              disabled={activeStep === totalSteps && !hasQuiz && !isFreeUser}
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

      {/* Sujets complémentaires — shown after last step */}
      {activeStep === totalSteps && relatedDouleurs.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.15)' }}>
          <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--brand)' }}>
            Sujets complémentaires
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            L&apos;équipe SOS Shine vous recommande d&apos;explorer ces sujets pour approfondir votre transformation.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {relatedDouleurs.map((r) => (
              <Link key={r.id} href={`/dashboard/encyclopedie/${r.slug}`}
                className="rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--brand)' }}>{r.title}</p>
                {r.subtitle && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{r.subtitle}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Quiz Section ── */}
      {activeStep === quizStepNum && hasQuiz && (
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.15)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(201,169,97,0.12)' }}>
              📝
            </div>
            <div>
              <span className="text-xs font-medium block" style={{ color: '#C9A961', opacity: 0.7 }}>
                Validation
              </span>
              <h2 className="font-display text-xl font-semibold" style={{ color: '#C9A961' }}>
                Quiz de compréhension
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {quizQuestions.length} questions — Minimum {Math.ceil(quizQuestions.length * 0.8)}/{quizQuestions.length} pour valider
              </p>
            </div>
          </div>

          {!allStepsCompleted ? (
            <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(201,169,97,0.3)' }}>
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
                style={{ background: 'rgba(201,169,97,0.1)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.2)' }}>
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
                      : '1px solid var(--border)',
                  }}>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-mono text-xs mr-2" style={{ color: '#C9A961' }}>Q{qIdx + 1}</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userSelected.includes(oIdx)
                        const isCorrectOpt = correct.includes(oIdx)
                        let optStyle: React.CSSProperties = {
                          background: isSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '2px solid rgba(201,169,97,0.5)' : '2px solid var(--border)',
                          color: isSelected ? '#C9A961' : 'var(--text-secondary)',
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
                                  ? (quizSubmitted && isCorrectOpt ? '#55EFC4' : quizSubmitted && !isCorrectOpt ? '#FF6B6B' : '#C9A961')
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
                        style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.15)' }}>
                        {encXpResult.xpDeltaAwarded > 0 ? (
                          <p className="text-sm font-semibold" style={{ color: '#C9A961' }}>
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
                            <span style={{ color: '#C9A961' }}>Restant à débloquer : {formatXP(encXpResult.xpRemaining)}</span>
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
                      background: quizPassed ? 'rgba(85,239,196,0.1)' : 'rgba(201,169,97,0.15)',
                      color: quizPassed ? '#55EFC4' : '#C9A961',
                      border: quizPassed ? '1px solid rgba(85,239,196,0.2)' : '1px solid rgba(201,169,97,0.3)',
                    }}>
                    {quizPassed ? 'Repasser le quiz' : 'Réessayer le quiz'}
                  </button>
                </div>
              ) : (
                <button onClick={submitQuiz}
                  disabled={submittingQuiz || Object.keys(quizAnswers).length < quizQuestions.length}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#C9A961', color: '#09090b' }}>
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

      {/* ═══ CONTENUS LIÉS À CE CHALLENGE ═══ */}
      {(relatedTvVideos.length > 0 || relatedShorts.length > 0 || relatedAudible.length > 0 || relatedBooks.length > 0) && (
        <div className="pt-8 mt-4 space-y-10" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Contenus liés à ce challenge
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Retrouvez tout ce qui traite de ce sujet sur la plateforme.
            </p>
          </div>

          {/* Shine TV */}
          {relatedTvVideos.length > 0 && (() => {
            const unlocked = hasFeature('shine_tv')
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
                    🎬 Shine TV ({relatedTvVideos.length})
                  </h4>
                  {!unlocked && (
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}>
                      Réservé Sérénité
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedTvVideos.map((v) => (
                    unlocked ? (
                      <Link key={v.id} href={`/dashboard/shine-tv?video=${v.id}`}
                        className="rounded-xl overflow-hidden block transition-all hover:scale-[1.01]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="aspect-video relative" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{v.title}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{v.duration_minutes} min</p>
                        </div>
                      </Link>
                    ) : (
                      <div key={v.id} className="rounded-xl overflow-hidden relative cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="aspect-video relative" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{v.title}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{v.duration_minutes} min</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Shine Shorts */}
          {relatedShorts.length > 0 && (() => {
            const unlocked = hasFeature('shine_shorts')
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
                    📱 Shine Shorts ({relatedShorts.length})
                  </h4>
                  {!unlocked && (
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}>
                      Réservé Sérénité
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {relatedShorts.map((s) => (
                    unlocked ? (
                      <Link key={s.id} href={`/dashboard/shine-shorts?short=${s.id}`}
                        className="rounded-xl overflow-hidden block transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="aspect-[9/16] relative" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {s.thumbnail_url && <img src={s.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                        </div>
                        <div className="p-2">
                          <p className="font-medium text-xs line-clamp-2" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                        </div>
                      </Link>
                    ) : (
                      <div key={s.id} className="rounded-xl overflow-hidden relative cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="aspect-[9/16] relative" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {s.thumbnail_url && <img src={s.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="font-medium text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{s.title}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Shine Audible */}
          {relatedAudible.length > 0 && (() => {
            const unlocked = hasFeature('shine_audible')
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
                    🎧 Shine Audible ({relatedAudible.length})
                  </h4>
                  {!unlocked && (
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}>
                      Réservé Sérénité
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedAudible.map((a) => (
                    unlocked ? (
                      <Link key={a.id} href={`/dashboard/shine-audible?track=${a.id}`}
                        className="rounded-xl overflow-hidden flex gap-3 transition-all hover:scale-[1.01]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="w-20 aspect-square flex-shrink-0" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {a.cover_url && <img src={a.cover_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="py-2 pr-3 flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                          {a.narrator && <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{a.narrator}</p>}
                        </div>
                      </Link>
                    ) : (
                      <div key={a.id} className="rounded-xl overflow-hidden flex gap-3 cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="w-20 aspect-square flex-shrink-0 relative" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {a.cover_url && <img src={a.cover_url} alt="" className="w-full h-full object-cover opacity-40" />}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        </div>
                        <div className="py-2 pr-3 flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{a.title}</p>
                          {a.narrator && <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{a.narrator}</p>}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Shine Librairie */}
          {relatedBooks.length > 0 && (() => {
            const unlocked = hasFeature('shine_librairie')
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
                    📚 Shine Librairie ({relatedBooks.length})
                  </h4>
                  {!unlocked && (
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}>
                      Réservé Sérénité
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedBooks.map((b) => (
                    unlocked ? (
                      <Link key={b.id} href={`/dashboard/shine-librairie?book=${b.id}`}
                        className="rounded-xl overflow-hidden flex gap-3 transition-all hover:scale-[1.01]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="w-16 aspect-[3/4] flex-shrink-0" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {b.cover_url && <img src={b.cover_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="py-2 pr-3 flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                          <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{b.author}</p>
                        </div>
                      </Link>
                    ) : (
                      <div key={b.id} className="rounded-xl overflow-hidden flex gap-3 cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="w-16 aspect-[3/4] flex-shrink-0 relative" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          {b.cover_url && <img src={b.cover_url} alt="" className="w-full h-full object-cover opacity-40" />}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        </div>
                        <div className="py-2 pr-3 flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{b.title}</p>
                          <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{b.author}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Linked blog article */}
      {linkedArticle && (
        <div className="pt-8 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3 font-semibold" style={{ color: '#74C0FC' }}>
            Article du blog lié
          </p>
          <Link href={`/blog/${linkedArticle.slug}`} className="block rounded-2xl overflow-hidden transition-all hover:scale-[1.005]" style={{ background: 'rgba(116,192,252,0.04)', border: '1px solid rgba(116,192,252,0.2)' }}>
            <div className="flex flex-col md:flex-row gap-0">
              {linkedArticle.cover_image && (
                <div className="md:w-48 h-32 md:h-auto flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <img src={linkedArticle.cover_image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-5 md:p-6">
                <h3 className="font-display text-lg md:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {linkedArticle.title}
                </h3>
                {linkedArticle.excerpt && (
                  <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {linkedArticle.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: '#74C0FC' }}>
                  {linkedArticle.read_time ? `${linkedArticle.read_time} min de lecture` : 'Lire l\'article'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

    </div>

    {/* Protocol paywall overlay — for free users trying to access steps 2/3 */}
    {showProtocolPaywall && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowProtocolPaywall(false) }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-w-md w-full rounded-2xl p-8 space-y-6"
          style={{
            background: 'linear-gradient(160deg, var(--surface-card, #1a1a1a), rgba(201,169,97,0.04))',
            border: '1px solid rgba(201,169,97,0.25)',
          }}
        >
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tu viens de comprendre. Maintenant, il faut transformer.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              L&apos;étape 1 t&apos;a donné la clé intellectuelle. Les étapes 2 et 3 vont dans le corps, libèrent le schéma en profondeur, et ancrent de nouvelles réponses dans ta vie réelle.
            </p>
          </div>

          <ul className="space-y-2">
            {[
              'Libérer ce schéma à la racine',
              'Reconnecter ton corps et ton histoire',
              'Changer concrètement tes réactions au quotidien',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }}>→</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <a
              href="/dashboard/tarifs"
              className="block w-full py-4 rounded-full text-sm font-semibold text-center transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))',
                color: '#000000',
                boxShadow: '0 4px 24px rgba(201,169,97,0.3)',
              }}
            >
              Accéder à Sérénité — 49,90€/mois
            </a>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Protocole complet · Shine TV · Lives · Communauté · Annulable à tout moment
            </p>
            <button
              onClick={() => setShowProtocolPaywall(false)}
              className="block w-full py-3 text-xs text-center transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              Pas maintenant
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}

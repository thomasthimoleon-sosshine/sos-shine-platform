'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Douleur, UserProgress } from '@/types/database'
import { XP_REWARDS } from '@/lib/xp'
import FavoriteButton from '@/components/FavoriteButton'

export default function DouleurDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(1)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [notPublished, setNotPublished] = useState(false)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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

        // Strategy: load ALL published douleurs and match client-side
        // This handles all slug/accent/encoding edge cases
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
          // Try multiple matching strategies
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
            console.warn(`Challenge "${unpublishedMatch.title}" (slug: ${unpublishedMatch.slug}) exists but is_published=false`)
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

  // Load user progress for this challenge
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
    }
    loadProgress()
  }, [douleur])

  async function markStepComplete(stepNum: number) {
    if (!douleur || !userId) return
    const supabase = createClient()

    const field = stepNum === 1 ? 'step1_completed' : stepNum === 2 ? 'step2_completed' : 'step3_completed'

    if (progress) {
      // Update existing progress
      const updates: Record<string, boolean | string> = { [field]: true }
      const newProgress = { ...progress, [field]: true }

      // Check if all 3 steps are now complete
      const allComplete = (stepNum === 1 || newProgress.step1_completed) &&
        (stepNum === 2 || newProgress.step2_completed) &&
        (stepNum === 3 || newProgress.step3_completed)

      if (allComplete) {
        updates.completed_at = new Date().toISOString()
      }

      await supabase.from('user_progress').update(updates).eq('id', progress.id)
      setProgress({ ...newProgress, completed_at: allComplete ? new Date().toISOString() : newProgress.completed_at } as UserProgress)

      // Award XP
      try {
        await supabase.rpc('add_xp', { p_user_id: userId, p_amount: XP_REWARDS.step_completed, p_reason: 'step_completed' })
        if (allComplete) {
          await supabase.rpc('add_xp', { p_user_id: userId, p_amount: XP_REWARDS.challenge_completed, p_reason: 'challenge_completed' })
        }
      } catch { /* non-critical */ }
    } else {
      // Create new progress entry
      const newData = {
        user_id: userId,
        douleur_id: douleur.id,
        step1_completed: stepNum === 1,
        step2_completed: stepNum === 2,
        step3_completed: stepNum === 3,
        completed_at: null,
      }
      const { data } = await supabase.from('user_progress').insert(newData).select().single()
      if (data) setProgress(data as UserProgress)

      try {
        await supabase.rpc('add_xp', { p_user_id: userId, p_amount: XP_REWARDS.step_completed, p_reason: 'step_completed' })
      } catch { /* non-critical */ }
    }
  }

  function isStepCompleted(stepNum: number): boolean {
    if (!progress) return false
    if (stepNum === 1) return progress.step1_completed
    if (stepNum === 2) return progress.step2_completed
    return progress.step3_completed
  }

  const completedSteps = progress ? [progress.step1_completed, progress.step2_completed, progress.step3_completed].filter(Boolean).length : 0

  const steps = [
    {
      num: 1,
      title: 'Comprendre',
      subtitle: 'Vidéo, audio & ressources',
      icon: '🎬',
      color: '#55EFC4',
      description: 'Analyse émotionnelle. Explication du problème. Apaisement mental. Une approche humaine et directe.',
    },
    {
      num: 2,
      title: 'Libérer & Intégrer',
      subtitle: 'Audio, vidéo & ressources',
      icon: '✨',
      color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation intérieure et reconnexion à soi.',
    },
    {
      num: 3,
      title: 'Agir',
      subtitle: 'Exercices, audio & ressources',
      icon: '⚡',
      color: '#E17055',
      description: 'PDF d\'exercices pratiques et audio guidé. Passez à l\'action concrète. Reprogrammation émotionnelle. Ancrez vos transformations dans le quotidien.',
    },
  ]

  // Helper: get all media URLs for a given step
  function getStepMedia(stepNum: number) {
    if (!douleur) return { video: null, audio: null, pdf: null, image: null }
    if (stepNum === 1) return {
      video: douleur.video_url,
      audio: douleur.step1_audio_url,
      pdf: douleur.step1_pdf_url,
      image: douleur.step1_image_url,
    }
    if (stepNum === 2) return {
      video: douleur.step2_video_url,
      audio: douleur.audio_energy_url,
      pdf: douleur.step2_pdf_url,
      image: douleur.step2_image_url,
    }
    return {
      video: douleur.step3_video_url,
      audio: douleur.audio_meditation_url,
      pdf: douleur.pdf_url,
      image: douleur.step3_image_url,
    }
  }

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

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progression</span>
            <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>{completedSteps}/3 étapes</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps / 3) * 100}%` }}
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
      </div>

      {/* Active step content */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: `${currentStep.color}06`, border: `1px solid ${currentStep.color}15` }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${currentStep.color}15` }}>
            {currentStep.icon}
          </div>
          <div>
            <span className="text-xs font-medium block" style={{ color: currentStep.color, opacity: 0.7 }}>
              Étape {currentStep.num}/3
            </span>
            <h2 className="font-display text-xl font-semibold" style={{ color: currentStep.color }}>
              {currentStep.title}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentStep.subtitle}</p>
          </div>
        </div>

        <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {currentStep.description}
        </p>

        {/* Content area — show ALL available media for this step */}
        {(() => {
          const media = getStepMedia(currentStep.num)
          const hasAnyContent = media.video || media.audio || media.pdf || media.image || (currentStep.num === 3 && douleur?.exercise_content)

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
              {/* Video */}
              {media.video && (
                <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--dark)' }}>
                  <video src={media.video} controls className="w-full h-full" />
                </div>
              )}

              {/* Image */}
              {media.image && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark)' }}>
                  <img src={media.image} alt={`${douleur?.title} — Étape ${currentStep.num}`} className="w-full h-auto rounded-xl" style={{ maxHeight: '500px', objectFit: 'contain' }} />
                </div>
              )}

              {/* Audio */}
              {media.audio && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}>
                  <p className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    {currentStep.num === 1 ? 'Audio' : currentStep.num === 2 ? 'Audio de libération' : 'Audio guidé'}
                  </p>
                  <audio src={media.audio} controls className="w-full" />
                </div>
              )}

              {/* PDF */}
              {media.pdf && (
                <a href={media.pdf} target="_blank" rel="noopener noreferrer"
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

              {/* Exercise content (step 3 only) */}
              {currentStep.num === 3 && douleur?.exercise_content && (
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <h4 className="font-semibold text-sm mb-3" style={{ color: currentStep.color }}>Exercice</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    {douleur.exercise_content}
                  </p>
                </div>
              )}
            </div>
          )
        })()}

        {/* Step completion + navigation */}
        <div className="mt-8 pt-6 space-y-4" style={{ borderTop: `1px solid ${currentStep.color}15` }}>
          {/* Mark as completed button */}
          {!isStepCompleted(currentStep.num) ? (
            <button
              onClick={() => markStepComplete(currentStep.num)}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: `${currentStep.color}15`, color: currentStep.color, border: `1px solid ${currentStep.color}30` }}
            >
              Marquer l&apos;étape {currentStep.num} comme terminée (+{XP_REWARDS.step_completed} XP)
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
              onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
              disabled={activeStep === 3}
              className="flex items-center gap-2 text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: currentStep.color }}
            >
              Étape suivante
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

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
  )
}

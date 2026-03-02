'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'
import FavoriteButton from '@/components/FavoriteButton'

export default function DouleurDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(1)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [notPublished, setNotPublished] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()

        // Normalize the slug: decode URI, lowercase, remove accents
        const normalizedSlug = decodeURIComponent(slug)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        // Try 1: exact slug match with is_published = true
        let { data, error } = await supabase
          .from('douleurs')
          .select('*')
          .eq('slug', normalizedSlug)
          .eq('is_published', true)
          .maybeSingle()

        // Try 2: if not found with normalized slug, try original slug
        if (!data && !error && normalizedSlug !== slug) {
          const res = await supabase
            .from('douleurs')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .maybeSingle()
          data = res.data
          error = res.error
        }

        // Try 3: if still not found, check if it exists but is NOT published
        if (!data && !error) {
          const { data: unpublished } = await supabase
            .from('douleurs')
            .select('id, title, slug, is_published')
            .or(`slug.eq.${normalizedSlug},slug.eq.${slug}`)
            .maybeSingle()

          if (unpublished && !unpublished.is_published) {
            setNotPublished(true)
            console.warn(`Challenge "${unpublished.title}" (slug: ${unpublished.slug}) exists but is_published=false`)
          }
        }

        if (error) {
          console.error('Erreur chargement challenge:', error.message)
          setFetchError(error.message)
        } else if (data) {
          setDouleur(data as Douleur)
        }
      } catch (err) {
        console.error('Exception chargement challenge:', err)
        setFetchError(err instanceof Error ? err.message : 'Erreur inattendue')
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const steps = [
    {
      num: 1,
      title: 'Comprendre',
      subtitle: 'Vidéo de coaching immersive',
      icon: '🎬',
      color: '#55EFC4',
      description: 'Analyse émotionnelle. Explication du problème. Apaisement mental. Une approche humaine et directe.',
      contentType: 'video' as const,
    },
    {
      num: 2,
      title: 'Libérer & Intégrer',
      subtitle: 'Vidéo de libération et d\'intégration',
      icon: '✨',
      color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation intérieure et reconnexion à soi.',
      contentType: 'audio_energy' as const,
    },
    {
      num: 3,
      title: 'Agir',
      subtitle: 'PDF & audio guidé',
      icon: '⚡',
      color: '#E17055',
      description: 'PDF d\'exercices pratiques et audio guidé. Passez à l\'action concrète. Reprogrammation émotionnelle. Ancrez vos transformations dans le quotidien.',
      contentType: 'pdf' as const,
    },
  ]

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

  function getContentUrl(step: typeof steps[0]): string | null {
    if (!douleur) return null
    switch (step.contentType) {
      case 'video': return douleur.video_url
      case 'audio_energy': return douleur.audio_energy_url
      case 'pdf': return douleur.pdf_url
      default: return null
    }
  }

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
        </div>
        <p className="mt-2 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {douleur.description}
        </p>
      </div>

      {/* Steps navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step) => (
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
            <span className="text-lg">{step.icon}</span>
            <span>Étape {step.num}</span>
          </button>
        ))}
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

        {/* Content area */}
        {(() => {
          const contentUrl = getContentUrl(currentStep)

          if (currentStep.contentType === 'video') {
            return contentUrl ? (
              <div className="rounded-xl overflow-hidden aspect-video mb-4" style={{ background: 'var(--dark)' }}>
                <video src={contentUrl} controls className="w-full h-full" />
              </div>
            ) : (
              <div className="rounded-xl aspect-video flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', border: `1px dashed ${currentStep.color}30` }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${currentStep.color}15` }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Vidéo bientôt disponible</p>
                </div>
              </div>
            )
          }

          if (currentStep.contentType === 'audio_energy') {
            return contentUrl ? (
              <div className="rounded-xl overflow-hidden aspect-video mb-4" style={{ background: 'var(--dark)' }}>
                <video src={contentUrl} controls className="w-full h-full" />
              </div>
            ) : (
              <div className="rounded-xl aspect-video flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', border: `1px dashed ${currentStep.color}30` }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${currentStep.color}15` }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Vidéo bientôt disponible</p>
                </div>
              </div>
            )
          }

          if (currentStep.contentType === 'pdf') {
            return (
              <div className="space-y-4">
                {/* PDF */}
                {contentUrl ? (
                  <a href={contentUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl transition-all"
                    style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Télécharger le PDF</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Exercices & plan d&apos;action</p>
                    </div>
                  </a>
                ) : (
                  <div className="p-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', border: `1px dashed ${currentStep.color}30` }}>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${currentStep.color}15` }}>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PDF bientôt disponible</p>
                    </div>
                  </div>
                )}
                {/* Audio */}
                {douleur.audio_meditation_url ? (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}>
                    <p className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Audio guidé</p>
                    <audio src={douleur.audio_meditation_url} controls className="w-full" />
                  </div>
                ) : null}
                {douleur.exercise_content && (
                  <div className="p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <h4 className="font-semibold text-sm mb-3" style={{ color: currentStep.color }}>Exercice</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                      {douleur.exercise_content}
                    </p>
                  </div>
                )}
              </div>
            )
          }

          return null
        })()}

        {/* Step navigation */}
        <div className="flex justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${currentStep.color}15` }}>
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

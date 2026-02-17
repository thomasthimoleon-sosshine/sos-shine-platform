'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'

export default function DouleurDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('douleurs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (data) {
        setDouleur(data as Douleur)
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
      title: 'Libération Énergétique',
      subtitle: 'Soin énergétique',
      icon: '✨',
      color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent.',
      contentType: 'audio_energy' as const,
    },
    {
      num: 3,
      title: 'Intégration & Méditation',
      subtitle: 'Méditation guidée',
      icon: '🧘',
      color: '#E17055',
      description: 'Stabilisation intérieure. Reconnexion à soi. Nouvelle fréquence émotionnelle.',
      contentType: 'audio_meditation' as const,
    },
    {
      num: 4,
      title: 'Action & Reprogrammation',
      subtitle: 'Exercices pratiques',
      icon: '⚡',
      color: '#D4AF37',
      description: 'Carnets de bord. PDF téléchargeable. Habitudes positives. Plan d\'action concret.',
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
          Douleur non trouvée
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Cette douleur n&apos;est pas encore disponible ou n&apos;existe pas.
        </p>
        <Link href="/dashboard/encyclopedie" className="text-sm font-medium" style={{ color: 'var(--gold)' }}>
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
      case 'audio_meditation': return douleur.audio_meditation_url
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
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {douleur.title}
        </h1>
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
              Étape {currentStep.num}/4
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

          if (currentStep.contentType === 'audio_energy' || currentStep.contentType === 'audio_meditation') {
            return contentUrl ? (
              <div className="rounded-xl p-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <audio src={contentUrl} controls className="w-full" />
              </div>
            ) : (
              <div className="rounded-xl p-8 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', border: `1px dashed ${currentStep.color}30` }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${currentStep.color}15` }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Audio bientôt disponible</p>
                </div>
              </div>
            )
          }

          if (currentStep.contentType === 'pdf') {
            return (
              <div className="space-y-4">
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
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PDF & exercices bientôt disponibles</p>
                    </div>
                  </div>
                )}
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
            onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
            disabled={activeStep === 4}
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

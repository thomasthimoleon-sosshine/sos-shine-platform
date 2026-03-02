'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'

// Page récapitulative avant paiement
const SIGNUP_URL = '/rejoindre'

export default function PublicDouleurDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

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
            document.title = `${match.title} — Encyclopédie SOS Shine`
            const metaDesc = document.querySelector('meta[name="description"]')
            if (metaDesc) metaDesc.setAttribute('content', `Protocole en 3 étapes pour surmonter ${match.title.toLowerCase()} : vidéos, soins énergétiques et méditations guidées. Rejoins la communauté SOS Shine.`)
            setLoading(false)
            return
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

  const steps = [
    {
      num: 1,
      title: 'Comprendre',
      subtitle: 'Vidéo de coaching immersive',
      icon: '\u{1F3AC}',
      color: '#55EFC4',
      description: 'Analyse émotionnelle. Explication du problème. Apaisement mental. Une approche humaine et directe.',
      contentType: 'video' as const,
    },
    {
      num: 2,
      title: 'Libérer & Intégrer',
      subtitle: 'Vidéo de libération et d\'intégration',
      icon: '\u2728',
      color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation intérieure et reconnexion à soi.',
      contentType: 'audio_energy' as const,
    },
    {
      num: 3,
      title: 'Agir',
      subtitle: 'PDF & audio guidé',
      icon: '\u26A1',
      color: '#E17055',
      description: 'PDF d\'exercices pratiques et audio guidé. Passez à l\'action concrète. Reprogrammation émotionnelle. Ancrez vos transformations dans le quotidien.',
      contentType: 'pdf' as const,
    },
  ]

  function handlePlayClick() {
    setShowModal(true)
  }

  function goToSignup() {
    router.push(SIGNUP_URL)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center" style={{ background: 'var(--dark)' }}>
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!douleur) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--dark)' }}>
        <header className="px-6 md:px-20 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: 'var(--dark)' }}>S</div>
            <span className="font-display text-lg font-medium" style={{ color: 'var(--gold)' }}>SOS Shine</span>
          </Link>
        </header>
        <div className="max-w-3xl mx-auto text-center py-20 px-6">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Challenge émotionnel non trouvé
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {fetchError
              ? `Une erreur est survenue lors du chargement. Veuillez réessayer.`
              : `Ce challenge émotionnel n'est pas encore disponible ou n'existe pas.`}
          </p>
          {fetchError && (
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg text-sm font-medium mb-4 cursor-pointer"
              style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              Réessayer
            </button>
          )}
          <Link href="/encyclopedie" className="block text-sm font-medium" style={{ color: 'var(--gold)' }}>
            Retour à l&apos;encyclopédie
          </Link>
        </div>
      </main>
    )
  }

  const currentStep = steps[activeStep - 1]

  function hasContent(step: typeof steps[0]): boolean {
    if (!douleur) return false
    switch (step.contentType) {
      case 'video': return !!douleur.video_url
      case 'audio_energy': return !!douleur.audio_energy_url
      case 'pdf': return !!douleur.pdf_url || !!douleur.audio_meditation_url || !!douleur.exercise_content
      default: return false
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--dark)' }}>
      {/* Header bar */}
      <header className="px-6 md:px-20 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: 'var(--dark)' }}>
            S
          </div>
          <span className="font-display text-lg font-medium" style={{ color: 'var(--gold)' }}>SOS Shine</span>
        </Link>
        <Link
          href={SIGNUP_URL}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{ background: 'var(--gold)', color: 'var(--dark)' }}
        >
          Rejoindre
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/encyclopedie" className="transition-colors" style={{ color: 'var(--text-muted)' }}
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
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
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
              {hasContent(step) && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
              )}
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
              <h2 className="font-display text-xl font-semibold">
                {currentStep.title}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentStep.subtitle}</p>
            </div>
          </div>

          <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {currentStep.description}
          </p>

          {/* Locked content area */}
          {(() => {
            if (currentStep.contentType === 'video') {
              return douleur.video_url ? (
                /* Video preview - locked */
                <div
                  className="rounded-xl overflow-hidden aspect-video mb-4 relative cursor-pointer group"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  onClick={handlePlayClick}
                >
                  {/* Blurred overlay to hint at content */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                        style={{ background: `${currentStep.color}20`, border: `2px solid ${currentStep.color}40` }}>
                        <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </div>
                      {/* Lock icon */}
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: currentStep.color }}>
                          Contenu réservé aux membres
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Background gradient to simulate video presence */}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentStep.color}08, rgba(0,0,0,0.5), ${currentStep.color}05)` }} />
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
              return douleur.audio_energy_url ? (
                /* Video preview - locked */
                <div
                  className="rounded-xl overflow-hidden aspect-video mb-4 relative cursor-pointer group"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  onClick={handlePlayClick}
                >
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                        style={{ background: `${currentStep.color}20`, border: `2px solid ${currentStep.color}40` }}>
                        <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: currentStep.color }}>
                          Contenu réservé aux membres
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentStep.color}08, rgba(0,0,0,0.5), ${currentStep.color}05)` }} />
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
                  {douleur.pdf_url ? (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer group transition-all"
                      style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}
                      onClick={handlePlayClick}
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>PDF disponible</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          <p className="text-xs" style={{ color: currentStep.color }}>Réservé aux membres</p>
                        </div>
                      </div>
                    </div>
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
                    <div
                      className="rounded-xl p-4 cursor-pointer group"
                      style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}
                      onClick={handlePlayClick}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{ background: `${currentStep.color}20`, border: `1px solid ${currentStep.color}30` }}>
                          <svg className="w-5 h-5 ml-0.5" fill={currentStep.color} viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Audio guidé</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <p className="text-xs" style={{ color: currentStep.color }}>Réservé aux membres</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {douleur.exercise_content && (
                    <div className="p-5 rounded-xl relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <h4 className="font-semibold text-sm mb-3" style={{ color: currentStep.color }}>Exercice</h4>
                      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                        {douleur.exercise_content}
                      </p>
                      {/* Blur overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-24 flex items-end justify-center pb-4"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                        <button onClick={handlePlayClick} className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all hover:opacity-90 cursor-pointer"
                          style={{ background: `${currentStep.color}20`, color: currentStep.color, border: `1px solid ${currentStep.color}30` }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          Voir la suite
                        </button>
                      </div>
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

        {/* CTA - Unlock */}
        <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212,175,55,0.12)' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            Débloquez le protocole complet
          </h3>
          <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Accédez aux vidéos, aux PDF d&apos;exercices et aux audios guidés pour &quot;{douleur.title}&quot;.
          </p>
          <Link
            href={SIGNUP_URL}
            className="inline-block px-8 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}
          >
            Rejoindre SOS Shine — 29,90&euro;/mois
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Accès illimité à toute l&apos;encyclopédie et la communauté
          </p>
        </div>
      </div>

      {/* Modal - Redirect to signup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-md w-full rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at center, var(--gold), transparent)' }} />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              
              <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Accès réservé
              </h3>
              
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Pour accéder aux protocoles de libération (vidéos, soins, méditations et PDF), vous devez faire partie du sanctuaire SOS Shine.
              </p>

              <div className="space-y-3">
                <Link
                  href="/rejoindre"
                  className="block w-full py-3.5 rounded-full font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                  style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                >
                  Découvrir les avantages
                </Link>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="block w-full py-3.5 rounded-full text-sm font-medium transition-colors w-full"
                  style={{ border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}
                >
                  Continuer l&apos;exploration
                </button>
              </div>

              <p className="text-[11px] mt-6" style={{ color: 'var(--text-muted)' }}>
                Déjà membre ? <Link href="/login" className="gold-underline" style={{ color: 'var(--gold)' }}>Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

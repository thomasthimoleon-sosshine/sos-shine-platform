'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Douleur, DouleurStep } from '@/types/database'

// Page récapitulative avant paiement
const SIGNUP_URL = '/signup'

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

function buildSteps(douleur: Douleur, dynamicSteps: DouleurStep[]): StepConfig[] {
  if (dynamicSteps.length > 0) {
    return dynamicSteps.map((s, i) => ({
      num: i + 1,
      title: s.title,
      subtitle: s.subtitle || 'Vidéo, audio & ressources',
      icon: s.icon || '📋',
      color: s.color || 'var(--brand)',
      description: s.description || '',
      video: s.video_url,
      audio: s.audio_url,
      pdf: s.pdf_url,
      image: s.image_url,
      exercise_content: s.exercise_content,
    }))
  }

  // Legacy fallback
  return [
    {
      num: 1, title: 'Comprendre', subtitle: 'Vidéo, audio & ressources', icon: '\u{1F3AC}', color: '#55EFC4',
      description: 'Analyse émotionnelle. Explication du problème. Apaisement mental. Une approche humaine et directe.',
      video: douleur.video_url, audio: douleur.step1_audio_url, pdf: douleur.step1_pdf_url, image: douleur.step1_image_url, exercise_content: null,
    },
    {
      num: 2, title: 'Libérer & Intégrer', subtitle: 'Audio, vidéo & ressources', icon: '\u2728', color: '#74C0FC',
      description: 'Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation intérieure et reconnexion à soi.',
      video: douleur.step2_video_url, audio: douleur.audio_energy_url, pdf: douleur.step2_pdf_url, image: douleur.step2_image_url, exercise_content: null,
    },
    {
      num: 3, title: 'Agir', subtitle: 'Exercices, audio & ressources', icon: '\u26A1', color: '#E17055',
      description: 'PDF d\'exercices pratiques et audio guidé. Passez à l\'action concrète. Reprogrammation émotionnelle. Ancrez vos transformations dans le quotidien.',
      video: douleur.step3_video_url, audio: douleur.audio_meditation_url, pdf: douleur.pdf_url, image: douleur.step3_image_url, exercise_content: douleur.exercise_content,
    },
  ]
}

export default function PublicDouleurDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [douleur, setDouleur] = useState<Douleur | null>(null)
  const [dynamicSteps, setDynamicSteps] = useState<DouleurStep[]>([])
  const [linkedArticle, setLinkedArticle] = useState<{ slug: string; title: string; excerpt: string | null; cover_image: string | null; read_time: number | null } | null>(null)
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
            document.title = `${match.title} - Encyclopédie SOS Shine`

            // Load dynamic steps
            const { data: steps } = await supabase
              .from('douleur_steps')
              .select('*')
              .eq('douleur_id', match.id)
              .order('step_number', { ascending: true })

            if (steps && steps.length > 0) {
              setDynamicSteps(steps as DouleurStep[])
              const stepCount = steps.length
              const metaDesc = document.querySelector('meta[name="description"]')
              if (metaDesc) metaDesc.setAttribute('content', `Protocole en ${stepCount} étapes pour surmonter ${match.title.toLowerCase()} : vidéos, soins énergétiques et méditations guidées. Rejoins la communauté SOS Shine.`)
            } else {
              const metaDesc = document.querySelector('meta[name="description"]')
              if (metaDesc) metaDesc.setAttribute('content', `Protocole en 3 étapes pour surmonter ${match.title.toLowerCase()} : vidéos, soins énergétiques et méditations guidées. Rejoins la communauté SOS Shine.`)
            }

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

  // Load linked blog article (if any) once we have the douleur
  useEffect(() => {
    if (!douleur?.slug) return
    async function loadLinkedArticle(douleurSlug: string) {
      try {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('blog_articles')
          .select('slug, title, excerpt, cover_image, read_time')
          .eq('douleur_slug', douleurSlug)
          .eq('is_published', true)
          .limit(1)
          .maybeSingle()
        if (data) {
          setLinkedArticle(data as { slug: string; title: string; excerpt: string | null; cover_image: string | null; read_time: number | null })
        }
      } catch {
        // Column may not exist yet - fail silently
      }
    }
    loadLinkedArticle(douleur.slug)
  }, [douleur?.slug])

  const steps = douleur ? buildSteps(douleur, dynamicSteps) : []
  const totalSteps = steps.length

  function handlePlayClick() {
    setShowModal(true)
  }

  // suppress unused var warning
  void router

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center bg-[var(--surface)]">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!douleur) {
    return (
      <main className="min-h-screen bg-[var(--surface)]">
        <header className="px-6 md:px-20 py-5 flex items-center justify-between border-b border-[var(--border)]">
          <Link href="/" className="flex items-center">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10" />
          </Link>
        </header>
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="rounded-2xl p-8 sm:p-10 text-center" style={{
            background: 'linear-gradient(160deg, var(--surface-card) 0%, rgba(201,169,97,0.04) 100%)',
            border: '1px solid rgba(201,169,97,0.15)',
          }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}>
              <span className="text-3xl">💛</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4 text-[var(--text-primary)]">
              Ce protocole arrive bientôt
            </h2>
            <p className="text-sm sm:text-[15px] leading-relaxed mb-6 text-[var(--text-secondary)]">
              Nous mettons tout notre cœur à préparer ce contenu pour qu&apos;il soit à la hauteur de ce que vous traversez.
              Julia, William et Thomas travaillent dessus pour vous offrir un protocole complet.
            </p>
            <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Inscrivez-vous pour être prévenu(e) dès sa sortie et accéder aux protocoles déjà disponibles.
              </p>
            </div>
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000', boxShadow: '0 4px 20px rgba(201,169,97,0.3)' }}>
              Créer mon compte gratuitement
            </Link>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <Link href="/encyclopedie" className="text-sm font-medium transition-colors hover:opacity-80 text-[var(--brand)]">
                ← Retour à l&apos;encyclopédie
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const currentStep = steps[activeStep - 1]

  function hasContent(step: StepConfig): boolean {
    return !!(step.video || step.audio || step.pdf || step.image || step.exercise_content)
  }

  return (
    <main className="min-h-screen bg-[var(--surface)]">
      {/* Header bar */}
      <header className="px-6 md:px-20 py-5 flex items-center justify-between border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: 'var(--dark)' }}>
            S
          </div>
          <span className="font-display text-lg font-medium text-[var(--brand)]">SOS Shine</span>
        </Link>
        <Link
          href={SIGNUP_URL}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{ background: 'var(--brand)', color: 'var(--dark)' }}
        >
          Rejoindre
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/encyclopedie" className="transition-colors text-[var(--text-muted)]"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Encyclopédie
          </Link>
 <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-[var(--text-primary)]">{douleur.title}</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            {douleur.title}
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-[var(--text-secondary)]">
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
                background: activeStep === step.num ? `${step.color}15` : 'var(--surface-card)',
                border: activeStep === step.num ? `1px solid ${step.color}40` : '1px solid var(--border)',
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
        {currentStep && (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: `${currentStep.color}06`, border: `1px solid ${currentStep.color}15` }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${currentStep.color}15` }}>
                {currentStep.icon}
              </div>
              <div>
                <span className="text-xs font-medium block" style={{ color: currentStep.color, opacity: 0.7 }}>
                  Étape {currentStep.num}/{totalSteps}
                </span>
                <h2 className="font-display text-xl font-semibold">
                  {currentStep.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{currentStep.subtitle}</p>
              </div>
            </div>

            {currentStep.description && (
              <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
                {currentStep.description}
              </p>
            )}

            {/* Locked content area */}
            {(() => {
              const hasAny = hasContent(currentStep)

              if (!hasAny) {
                return (
                  <div className="rounded-xl p-8 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', border: `1px dashed ${currentStep.color}30` }}>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${currentStep.color}15` }}>
                        <span className="text-2xl">{currentStep.icon}</span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Contenu bientôt disponible</p>
                    </div>
                  </div>
                )
              }

              return (
                <div className="space-y-4">
                  {/* Video: 30-second preview then lock */}
                  {currentStep.video && (() => {
                    function PreviewVideo30s({ src, poster }: { src: string; poster?: string }) {
                      const videoRef = React.useRef<HTMLVideoElement>(null)
                      const [locked, setLocked] = React.useState(false)
                      React.useEffect(() => {
                        const vid = videoRef.current
                        if (!vid) return
                        const onTime = () => { if (vid.currentTime >= 30) { vid.pause(); setLocked(true) } }
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
                              <h3 className="font-display text-lg font-semibold mb-2 text-[var(--brand)]">
                                L&apos;extrait est terminé
                              </h3>
                              <p className="text-sm mb-6 max-w-xs mx-auto text-[var(--text-secondary)]">
                                Vous venez de voir 30 secondes. Le protocole complet vous attend à l&apos;intérieur.
                              </p>
                              <Link href="/signup"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000', boxShadow: '0 4px 20px rgba(201,169,97,0.3)' }}>
                                Créer mon compte gratuitement
                              </Link>
                              <p className="text-xs mt-4 text-[var(--text-muted)]">
                                Sans engagement. Annulation en un clic.
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div className="rounded-xl overflow-hidden aspect-video bg-[var(--surface)]">
                          <video ref={videoRef} src={src} poster={poster} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} preload="metadata" className="w-full h-full" />
                        </div>
                      )
                    }
                    return <PreviewVideo30s src={currentStep.video!} poster={currentStep.image || undefined} />
                  })()}

                  {/* Image locked preview (only when no video, otherwise image is used as video thumbnail) */}
                  {!currentStep.video && currentStep.image && (
                    <div
                      className="rounded-xl overflow-hidden relative cursor-pointer group"
                      style={{ background: 'rgba(0,0,0,0.3)', minHeight: '200px' }}
                      onClick={handlePlayClick}
                    >
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                            style={{ background: `${currentStep.color}20`, border: `2px solid ${currentStep.color}40` }}>
                            <span className="text-2xl">🖼️</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <span className="text-sm font-medium" style={{ color: currentStep.color }}>Image réservée aux membres</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentStep.color}08, rgba(0,0,0,0.5), ${currentStep.color}05)` }} />
                    </div>
                  )}

                  {/* Audio: 30-second preview then lock */}
                  {currentStep.audio && (() => {
                    function PreviewAudio30s({ src, title }: { src: string; title: string }) {
                      const audioRef = React.useRef<HTMLAudioElement>(null)
                      const [audioLocked, setAudioLocked] = React.useState(false)
                      React.useEffect(() => {
                        const aud = audioRef.current
                        if (!aud) return
                        const onTime = () => { if (aud.currentTime >= 30) { aud.pause(); setAudioLocked(true) } }
                        aud.addEventListener('timeupdate', onTime)
                        return () => aud.removeEventListener('timeupdate', onTime)
                      }, [])
                      return (
                        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,169,97,0.15)' }}>
                          <p className="font-medium text-sm text-[var(--text-primary)]">Audio - {title}</p>
                          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.12)' }}>
                            <span className="text-lg flex-shrink-0 mt-0.5">🎧</span>
                            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                              Écoutez un extrait de 30 secondes. Créez votre compte pour accéder à l&apos;intégralité.
                            </p>
                          </div>
                          {audioLocked ? (
                            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.2)' }}>
                              <p className="text-sm text-[var(--brand)]">Vous aimez ? Accédez à la suite</p>
                              <Link href="/signup" className="px-4 py-2 rounded-full text-xs font-semibold"
                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                                Créer mon compte
                              </Link>
                            </div>
                          ) : (
                            <audio ref={audioRef} src={src} controls className="w-full" />
                          )}
                        </div>
                      )
                    }
                    return <PreviewAudio30s src={currentStep.audio!} title={currentStep.title} />
                  })()}

                  {/* PDF locked preview */}
                  {currentStep.pdf && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer group transition-all"
                      style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${currentStep.color}20` }}
                      onClick={handlePlayClick}
                    >
                      <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[var(--text-primary)]">PDF disponible</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={currentStep.color} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          <p className="text-xs" style={{ color: currentStep.color }}>Réservé aux membres</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exercise content locked preview */}
                  {currentStep.exercise_content && (
                    <div className="p-5 rounded-xl relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <h4 className="font-semibold text-sm mb-3" style={{ color: currentStep.color }}>Exercice</h4>
                      <p className="text-sm leading-relaxed line-clamp-3 text-[var(--text-secondary)]">
                        {currentStep.exercise_content}
                      </p>
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
            })()}

            {/* Step navigation */}
            <div className="flex justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${currentStep.color}15` }}>
              <button
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="flex items-center gap-2 text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Étape précédente
              </button>
              <button
                onClick={() => setActiveStep(Math.min(totalSteps, activeStep + 1))}
                disabled={activeStep === totalSteps}
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
        )}

        {/* Linked blog article */}
        {linkedArticle && (
          <Link href={`/blog/${linkedArticle.slug}`} className="block rounded-2xl overflow-hidden transition-all hover:scale-[1.005]" style={{ background: 'rgba(116,192,252,0.04)', border: '1px solid rgba(116,192,252,0.2)' }}>
            <div className="flex flex-col md:flex-row gap-0 md:gap-6">
              {linkedArticle.cover_image && (
                <div className="md:w-48 h-32 md:h-auto flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <img src={linkedArticle.cover_image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold" style={{ color: '#74C0FC' }}>
                  Article du blog à lire
                </p>
                <h3 className="font-display text-xl md:text-2xl font-semibold mb-2 text-[var(--text-primary)]">
                  {linkedArticle.title}
                </h3>
                {linkedArticle.excerpt && (
                  <p className="text-sm leading-relaxed mb-3 text-[var(--text-secondary)]">
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
        )}

        {/* CTA - Unlock */}
        <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.15)' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(201,169,97,0.12)' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            Débloquez le protocole complet
          </h3>
          <p className="text-sm mb-5 max-w-md mx-auto text-[var(--text-secondary)]">
            Accédez aux vidéos, aux PDF d&apos;exercices et aux audios guidés pour &quot;{douleur.title}&quot;.
          </p>
          <Link
            href={SIGNUP_URL}
            className="inline-block px-8 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--brand)', color: 'var(--dark)' }}
          >
            Rejoindre SOS Shine
          </Link>
          <p className="text-xs mt-3 text-[var(--text-muted)]">
            Accès illimité à toute l&apos;encyclopédie et la communauté
          </p>
        </div>
      </div>

      {/* Modal - Redirect to signup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-md w-full rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at center, var(--brand), transparent)' }} />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(201,169,97,0.12)', border: '1px solid rgba(201,169,97,0.2)' }}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>

              <h3 className="font-display text-2xl font-semibold mb-3 text-[var(--text-primary)]">
                Accès réservé
              </h3>

              <p className="text-sm mb-8 leading-relaxed text-[var(--text-secondary)]">
                Pour accéder aux protocoles de libération (vidéos, soins, méditations et PDF), vous devez faire partie du sanctuaire SOS Shine.
              </p>

              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="block w-full py-3.5 rounded-full font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                  style={{ background: 'var(--brand)', color: 'var(--dark)' }}
                >
                  Découvrir les avantages
                </Link>

                <button
                  onClick={() => setShowModal(false)}
                  className="block w-full py-3.5 rounded-full text-sm font-medium transition-colors w-full"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Continuer l&apos;exploration
                </button>
              </div>

              <p className="text-[11px] mt-6 text-[var(--text-muted)]">
                Déjà membre ? <Link href="/login" className="gold-underline text-[var(--brand)]">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

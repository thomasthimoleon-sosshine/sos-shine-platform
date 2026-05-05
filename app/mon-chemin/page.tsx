'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { calculateMatchScores } from '@/lib/quiz-v2/scoring'
import { useSubscription } from '@/hooks/useSubscription'

type Protocol = {
  id: string
  title: string
  slug: string
  description: string
  status: string
  duration_days: number
  dimension_weights: Record<string, number>
}

type StepState = 'idle' | 'started' | 'done'

const STEP_TEXTS: Record<1 | 2 | 3, { title: string; text: string }> = {
  1: {
    title: 'Comprendre',
    text: '', // filled from protocol.description at runtime
  },
  2: {
    title: 'Libérer & intégrer',
    text: "Cette étape t'aide à faire descendre la compréhension dans le corps.\nTu vas commencer à relâcher ce qui reste tendu, figé ou répété automatiquement.\nL'objectif n'est pas de forcer le changement, mais de créer assez de sécurité intérieure pour qu'il devienne possible.",
  },
  3: {
    title: 'Agir',
    text: "Cette étape t'aide à poser une nouvelle réponse dans ta vie réelle.\nTu vas transformer ce que tu as compris et intégré en actions simples, concrètes et répétables.\nC'est ici que le schéma commence à perdre sa place.",
  },
}

async function track(eventType: string, eventData: Record<string, unknown>) {
  try {
    await fetch('/api/quiz-v2/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: null, quizResponseId: null, eventType, eventData }),
    })
  } catch {}
}

function MonCheminContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isActive } = useSubscription()

  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [paywallVisible, setPaywallVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [stepState, setStepState] = useState<StepState>('idle')
  const [allDone, setAllDone] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || null
      setUserId(uid)

      // Resolve protocol slug: URL param → sessionStorage → Supabase (user_id) → Supabase (email)
      let slug: string | null = searchParams.get('protocol')
      if (!slug) {
        try { slug = sessionStorage.getItem('sos_protocol_slug') } catch {}
      }

      let found: Protocol | null = null

      if (slug) {
        const { data } = await (supabase as any).from('protocols').select('*').eq('slug', slug).single()
        found = data || null
      }

      // Supabase fallback by user_id: top_protocol_slug first, then compute from scores
      if (!found && uid) {
        const { data: responses } = await (supabase as any)
          .from('quiz_v2_responses')
          .select('top_protocol_slug, scores')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = responses?.[0]
        if (latest?.top_protocol_slug) {
          const { data } = await (supabase as any).from('protocols').select('*').eq('slug', latest.top_protocol_slug).single()
          found = data || null
        } else if (latest?.scores) {
          const { data: allProtocols } = await (supabase as any).from('protocols').select('*')
          if (allProtocols) {
            const matched = (allProtocols as Protocol[])
              .map(p => ({ ...p, matchScore: calculateMatchScores(latest.scores, p.dimension_weights) }))
              .sort((a: any, b: any) => b.matchScore - a.matchScore)
            found = matched[0] || null
          }
        }
      }

      // Legacy fallback by email (responses avant le lien user_id)
      if (!found && user?.email) {
        const { data: responses } = await (supabase as any)
          .from('quiz_v2_responses')
          .select('top_protocol_slug, scores')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = responses?.[0]
        if (latest?.top_protocol_slug) {
          const { data } = await (supabase as any).from('protocols').select('*').eq('slug', latest.top_protocol_slug).single()
          found = data || null
        } else if (latest?.scores) {
          const { data: allProtocols } = await (supabase as any).from('protocols').select('*')
          if (allProtocols) {
            const matched = (allProtocols as Protocol[])
              .map(p => ({ ...p, matchScore: calculateMatchScores(latest.scores, p.dimension_weights) }))
              .sort((a: any, b: any) => b.matchScore - a.matchScore)
            found = matched[0] || null
          }
        }
      }

      setProtocol(found)

      // Load progress: Supabase (cross-device) → localStorage fallback
      if (found && uid) {
        let loadedFromSupabase = false
        try {
          const { data: progress } = await (supabase as any)
            .from('user_protocol_progress')
            .select('step, all_done')
            .eq('user_id', uid)
            .eq('protocol_slug', found.slug)
            .single()
          if (progress) {
            if (progress.step === 2 || progress.step === 3) setCurrentStep(progress.step)
            if (progress.all_done) setAllDone(true)
            loadedFromSupabase = true
          }
        } catch {}

        if (!loadedFromSupabase) {
          try {
            const raw = localStorage.getItem(`sos_progress_${uid}_${found.slug}`)
            const parsed = raw ? JSON.parse(raw) : null
            if (parsed?.step === 2 || parsed?.step === 3) setCurrentStep(parsed.step)
            if (parsed?.allDone) setAllDone(true)
          } catch {}
        }
      }

      setLoading(false)

      if (found) {
        track('protocol_started', { protocolSlug: found.slug, protocolTitle: found.title })
      }
    }
    init()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (!loading && !protocol) {
      router.replace('/signature-emotionnelle')
    }
  }, [loading, protocol, router])

  function saveProgress(step: 1 | 2 | 3, done = false) {
    if (!protocol || !userId) return
    try {
      localStorage.setItem(
        `sos_progress_${userId}_${protocol.slug}`,
        JSON.stringify({ step, allDone: done })
      )
    } catch {}
    const supabase = createClient()
    ;(supabase as any).from('user_protocol_progress').upsert(
      { user_id: userId, protocol_slug: protocol.slug, step, all_done: done, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,protocol_slug' }
    ).then(() => {}).catch(() => {})
  }

  function handleComplete() {
    track('protocol_step_completed', { protocolSlug: protocol?.slug, step: currentStep })
    if (currentStep === 1 && !isActive) {
      setPaywallVisible(true)
      return
    }
    if (currentStep < 3) {
      const next = (currentStep + 1) as 1 | 2 | 3
      setCurrentStep(next)
      setStepState('idle')
      saveProgress(next)
    } else {
      setAllDone(true)
      saveProgress(3, true)
    }
  }

  // Step texts with protocol.description injected into step 1
  const steps = {
    1: { ...STEP_TEXTS[1], text: protocol?.description || '' },
    2: STEP_TEXTS[2],
    3: STEP_TEXTS[3],
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement de ton chemin...</p>
      </main>
    )
  }

  if (!loading && !protocol) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirection...</p>
      </main>
    )
  }

  if (allDone) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--surface)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg text-center space-y-6"
        >
          <span className="text-5xl block">✨</span>
          <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--brand)' }}>
            Tu as terminé le protocole.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Les 3 étapes sont complètes. Le schéma a commencé à bouger.
          </p>
          <a
            href="/dashboard"
            className="block px-8 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
          >
            Continuer sur SOS Shine
          </a>
        </motion.div>
      </main>
    )
  }

  const showPaywall = paywallVisible || (currentStep > 1 && !isActive)

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Ton chemin commence ici
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {protocol!.title}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {protocol!.duration_days} jours de protocole
          </p>
        </motion.div>

        {/* Step navigator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          {([1, 2, 3] as const).map(n => {
            const isStepActive = n === currentStep
            const isDone = n < currentStep
            const isLocked = n > currentStep
            return (
              <div key={n} className="flex-1 rounded-xl px-3 py-3 text-center transition-all"
                style={{
                  background: isStepActive ? 'rgba(201,169,97,0.12)' : isDone ? 'rgba(85,239,196,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isStepActive ? '1px solid rgba(201,169,97,0.3)' : isDone ? '1px solid rgba(85,239,196,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                <p className="text-xs font-bold" style={{ color: isStepActive ? 'var(--brand)' : isDone ? '#55EFC4' : 'var(--text-muted)' }}>
                  {isDone ? '✓' : n}
                </p>
                <p className="text-xs mt-1 leading-tight" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                  {steps[n].title}
                </p>
              </div>
            )
          })}
        </motion.div>

        {/* Paywall or active step */}
        {showPaywall ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-7 space-y-6"
            style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.08), rgba(201,169,97,0.02))', border: '1px solid rgba(201,169,97,0.2)' }}
          >
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tu viens de comprendre. Maintenant, il faut transformer.
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {"Ce que tu viens de voir, ce n'est pas le problème.\nC'est la prise de conscience.\n\nLe vrai travail commence maintenant :\naller dans ton corps, libérer ce qui s'est construit,\net apprendre à agir autrement dans ta vie réelle.\n\nC'est exactement ce que font les étapes 2 et 3."}
            </p>
            <ul className="space-y-2">
              {[
                'Libérer ce schéma à la racine',
                'Reconnecter ton corps et ton histoire',
                'Changer concrètement tes réactions au quotidien',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--brand)' }} className="mt-0.5 flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <a
                href={`/rejoindre?source=mon-chemin&protocol=${protocol!.slug}`}
                className="block w-full py-4 rounded-full text-sm font-semibold text-center transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
              >
                Continuer mon protocole
              </a>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                7 jours offerts · accès immédiat · annulable à tout moment
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl p-6 space-y-5"
              style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.08), rgba(201,169,97,0.02))', border: '1px solid rgba(201,169,97,0.2)' }}
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--brand)', opacity: 0.7 }}>
                  Étape {currentStep}
                </p>
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {steps[currentStep].title}
                </h2>
              </div>

              {stepState === 'idle' ? (
                <button
                  onClick={() => setStepState('started')}
                  className="w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
                >
                  Commencer l&apos;étape {currentStep}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    {steps[currentStep].text}
                  </p>
                  <button
                    onClick={handleComplete}
                    className="w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110 cursor-pointer"
                    style={{ background: 'rgba(85,239,196,0.12)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)' }}
                  >
                    {currentStep === 1 ? "J'ai compris ce qui se joue" : "J'ai terminé — je continue →"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Locked steps */}
        {!showPaywall && (
          <div className="space-y-3">
            {([2, 3] as const).filter(n => n > currentStep).map(n => (
              <motion.div
                key={n}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  {n}
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {steps[n].title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                    Débloquée une fois que tu termines l&apos;étape {n - 1}
                  </p>
                </div>
                <span className="ml-auto text-sm">🔒</span>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

export default function MonCheminPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement de ton chemin...</p>
      </main>
    }>
      <MonCheminContent />
    </Suspense>
  )
}

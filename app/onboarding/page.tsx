'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ── Goal options with mapping to encyclopedia slugs ──
const GOAL_OPTIONS = [
  {
    key: 'confiance',
    label: 'Gagner en confiance en soi',
    description: 'Oser prendre la parole, affirmer mes choix, croire en moi',
    icon: '💎',
    slugs: ['confiance-en-soi'],
    goalTitle: 'Devenir plus confiant(e)',
    goalDescription: 'Travailler sur ma confiance en moi au quotidien, oser m\'affirmer et croire en ma valeur.',
  },
  {
    key: 'relation-toxique',
    label: 'Sortir d\'une relation toxique',
    description: 'Reconnaître les schémas, poser mes limites, me libérer',
    icon: '🔓',
    slugs: ['abus', 'dependance-affective'],
    goalTitle: 'Me libérer d\'une relation toxique',
    goalDescription: 'Identifier les mécanismes toxiques, poser mes limites et retrouver ma liberté émotionnelle.',
  },
  {
    key: 'separation',
    label: 'Accepter une séparation',
    description: 'Traverser la rupture, faire mon deuil amoureux, me reconstruire',
    icon: '🌅',
    slugs: ['rupture', 'separation'],
    goalTitle: 'Traverser ma séparation',
    goalDescription: 'Accepter la fin de cette relation et avancer vers une nouvelle version de moi-même.',
  },
  {
    key: 'amour-propre',
    label: 'Travailler mon amour propre',
    description: 'M\'aimer vraiment, respecter mes besoins, me mettre en priorité',
    icon: '✨',
    slugs: ['amour-propre'],
    goalTitle: 'Cultiver mon amour propre',
    goalDescription: 'Apprendre à m\'aimer et à me respecter profondément, sans conditions.',
  },
  {
    key: 'leadership',
    label: 'Gagner en leadership',
    description: 'Inspirer, diriger avec bienveillance, prendre ma place',
    icon: '👑',
    slugs: ['confiance-en-soi'],
    goalTitle: 'Développer mon leadership',
    goalDescription: 'Prendre ma place, inspirer les autres et diriger avec authenticité et bienveillance.',
  },
  {
    key: 'deuil',
    label: 'Traverser un deuil',
    description: 'Accompagnement pour la perte d\'un être cher',
    icon: '🕊️',
    slugs: ['deuil'],
    goalTitle: 'Traverser mon deuil',
    goalDescription: 'M\'autoriser à vivre mon deuil et trouver un chemin vers l\'apaisement.',
  },
  {
    key: 'burn-out',
    label: 'Sortir du burn-out',
    description: 'Récupérer mon énergie, retrouver l\'équilibre, me préserver',
    icon: '🔥',
    slugs: ['burn-out'],
    goalTitle: 'Me reconstruire après un burn-out',
    goalDescription: 'Récupérer mon énergie vitale et retrouver un équilibre de vie sain.',
  },
  {
    key: 'dependance',
    label: 'Me libérer de la dépendance affective',
    description: 'Exister par moi-même, ne plus avoir besoin de l\'autre pour me sentir entier(e)',
    icon: '🦋',
    slugs: ['dependance-affective'],
    goalTitle: 'Vaincre ma dépendance affective',
    goalDescription: 'Apprendre à exister pleinement par moi-même et à construire des relations saines.',
  },
] as const

type GoalOption = typeof GOAL_OPTIONS[number]

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = welcome, 1 = questions, 2 = summary
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [nextDestination, setNextDestination] = useState('/dashboard')

  useEffect(() => {
    async function check() {
      // Read ?next from URL to know where to redirect after onboarding
      let nextDest = '/dashboard'
      try {
        const params = new URLSearchParams(window.location.search)
        const n = params.get('next')
        if (n) nextDest = decodeURIComponent(n)
      } catch {}
      setNextDestination(nextDest)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setPrenom(user.user_metadata?.prenom || user.user_metadata?.full_name?.split(' ')[0] || 'Sunshine')

      // Check if already completed onboarding
      const { data: existing } = await supabase
        .from('onboarding_responses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        router.push(nextDest)
        return
      }
      setCheckingAuth(false)
    }
    check()
  }, [router])

  function toggleGoal(key: string) {
    setSelectedGoals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  async function handleSubmit() {
    if (selectedGoals.length === 0) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save onboarding responses
      await supabase.from('onboarding_responses').upsert({
        user_id: user.id,
        goals: selectedGoals,
      }, { onConflict: 'user_id' })

      // Create personalized goals based on selections
      const selectedOptions = GOAL_OPTIONS.filter((o) => selectedGoals.includes(o.key))
      const goalsToInsert = selectedOptions.map((option) => ({
        user_id: user.id,
        title: option.goalTitle,
        description: option.goalDescription,
        goal_key: option.key,
        recommended_slug: option.slugs[0] || null,
        status: 'active' as const,
        source: 'onboarding' as const,
      }))

      if (goalsToInsert.length > 0) {
        await supabase.from('user_goals').insert(goalsToInsert)
      }

      setStep(2)
    } catch {
      setLoading(false)
    }
  }

  function getSelectedOptions(): GoalOption[] {
    return GOAL_OPTIONS.filter((o) => selectedGoals.includes(o.key))
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative bg-[var(--surface)]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,var(--brand-alpha-weak),transparent)]" />

      <div className="max-w-2xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-[var(--brand-alpha-medium)] border border-[var(--border-medium)]">
                <span className="text-3xl">✨</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-3 text-[var(--text-primary)]">
                Bienvenue {prenom}
              </h1>
              <p className="text-[15px] mb-2 text-[var(--text-secondary)]">
                Avant de commencer votre parcours, aidez-nous à mieux vous accompagner.
              </p>
              <p className="text-[13px] mb-8 text-[var(--text-muted)]">
                Quelques questions pour personnaliser votre expérience SOS Shine.
              </p>

              <button
                onClick={() => setStep(1)}
                className="px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-90 cursor-pointer bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
              >
                Commencer
              </button>
            </motion.div>
          )}

          {/* ── Step 1: Goal Selection ── */}
          {step === 1 && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-[var(--text-muted)]">Étape 1 sur 1</span>
                  <span className="text-[12px] text-[var(--brand)]">{selectedGoals.length} sélectionné{selectedGoals.length > 1 ? 's' : ''}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-[var(--border)]">
                  <motion.div
                    className="h-full rounded-full bg-[var(--brand)]"
                    animate={{ width: selectedGoals.length > 0 ? '100%' : '10%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2 text-center text-[var(--text-primary)]">
                Qu&apos;est-ce qui vous amène ici ?
              </h2>
              <p className="text-[14px] text-center mb-8 text-[var(--text-secondary)]">
                Sélectionnez un ou plusieurs objectifs. Nous vous guiderons vers les challenges les plus adaptés.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((option, i) => {
                  const isSelected = selectedGoals.includes(option.key)
                  return (
                    <motion.button
                      key={option.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease }}
                      onClick={() => toggleGoal(option.key)}
                      className={`text-left p-4 rounded-xl transition-all duration-200 cursor-pointer group border ${
                        isSelected
                          ? 'bg-[var(--brand-alpha-weak)] border-[var(--brand-alpha-strong)]'
                          : 'bg-[var(--surface-card)] border-[var(--border)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5 shrink-0">{option.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`font-semibold text-[14px] ${
                              isSelected ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'
                            }`}>
                              {option.label}
                            </h3>
                            <div
                              className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-[var(--brand)]'
                                  : 'border-[1.5px] border-[var(--border)] bg-transparent'
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--text-inverse)" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <p className="text-[12px] mt-1 leading-relaxed text-[var(--text-muted)]">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-8 gap-4">
                <button
                  onClick={() => router.push(nextDestination)}
                  className="text-[13px] cursor-pointer text-[var(--text-muted)]"
                >
                  Passer cette étape
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedGoals.length === 0 || loading}
                  className="px-6 py-3 rounded-full text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
                >
                  {loading ? 'Enregistrement...' : 'Valider mes objectifs'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Summary & Redirect ── */}
          {step === 2 && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-[rgba(107,207,160,0.1)] border border-[rgba(107,207,160,0.15)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3 text-[var(--text-primary)]">
                Votre parcours est prêt !
              </h2>
              <p className="text-[14px] mb-8 text-[var(--text-secondary)]">
                Voici les challenges que nous vous recommandons en fonction de vos objectifs :
              </p>

              <div className="space-y-3 mb-8">
                {getSelectedOptions().map((option) => (
                  <div key={option.key} className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[14px] text-[var(--brand)]">
                          {option.goalTitle}
                        </h3>
                        <p className="text-[12px] mt-0.5 text-[var(--text-muted)]">
                          {option.goalDescription}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {option.slugs.map((slug) => (
                            <span key={slug} className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--brand-alpha-medium)] text-[var(--brand)]">
                              {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => router.push(nextDestination)}
                  className="px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-90 cursor-pointer bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
                >
                  Accéder à mon espace
                </button>
                <button
                  onClick={() => router.push('/dashboard/encyclopedie')}
                  className="text-[13px] cursor-pointer text-[var(--brand)]"
                >
                  Explorer l&apos;encyclopédie
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

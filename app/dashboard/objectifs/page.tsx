'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Challenge, ChallengeParticipation, ChallengePhase, ChallengePhaseProgress, UserGoal } from '@/types/database'
import { XP_REWARDS } from '@/lib/xp'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface Goal {
  id: string
  title: string
  description: string
  target_date: string
  status: 'active' | 'completed'
  created_at: string
}

const STORAGE_KEY = 'sos-shine-goals'

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function loadGoals(): Goal[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

export default function ObjectifsPage() {
  const { t } = useTranslation()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [challenges, setChallenges] = useState<(Challenge & { phases?: ChallengePhase[] })[]>([])
  const [participations, setParticipations] = useState<Record<string, ChallengeParticipation>>({})
  const [phaseProgress, setPhaseProgress] = useState<Record<string, ChallengePhaseProgress[]>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [onboardingGoals, setOnboardingGoals] = useState<UserGoal[]>([])
  const [hasOnboarding, setHasOnboarding] = useState(false)
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null)

  useEffect(() => {
    setGoals(loadGoals())

    async function loadChallenges() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: ch } = await supabase
        .from('challenges')
        .select('*')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })

      if (ch) {
        // Load phases for each challenge
        const challengesWithPhases = []
        for (const c of ch as Challenge[]) {
          const { data: phases } = await supabase
            .from('challenge_phases')
            .select('*')
            .eq('challenge_id', c.id)
            .order('phase_number', { ascending: true })
          challengesWithPhases.push({ ...c, phases: (phases as ChallengePhase[]) || [] })
        }
        setChallenges(challengesWithPhases)
      }

      const { data: parts } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)

      if (parts) {
        const map: Record<string, ChallengeParticipation> = {}
        const progressMap: Record<string, ChallengePhaseProgress[]> = {}
        for (const p of parts as ChallengeParticipation[]) {
          map[p.challenge_id] = p
          // Load phase progress for this participation
          const { data: pp } = await supabase
            .from('challenge_phase_progress')
            .select('*')
            .eq('participation_id', p.id)
          if (pp) progressMap[p.challenge_id] = pp as ChallengePhaseProgress[]
        }
        setParticipations(map)
        setPhaseProgress(progressMap)
      }

      // Load onboarding goals
      try {
        const { data: userGoals } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (userGoals && userGoals.length > 0) {
          setOnboardingGoals(userGoals as UserGoal[])
          setHasOnboarding(true)
        }
      } catch {
        // Table may not exist yet
      }
    }
    loadChallenges()
  }, [])

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  function handleCreate() {
    if (!title.trim()) return
    const newGoal: Goal = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      target_date: targetDate,
      status: 'active',
      created_at: new Date().toISOString(),
    }
    const updated = [newGoal, ...goals]
    setGoals(updated)
    saveGoals(updated)
    setTitle('')
    setDescription('')
    setTargetDate('')
    setShowModal(false)
  }

  function toggleStatus(id: string) {
    const updated = goals.map((g) =>
      g.id === id ? { ...g, status: (g.status === 'active' ? 'completed' : 'active') as Goal['status'] } : g
    )
    setGoals(updated)
    saveGoals(updated)
  }

  function deleteGoal(id: string) {
    const updated = goals.filter((g) => g.id !== id)
    setGoals(updated)
    saveGoals(updated)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('goals.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            {t('goals.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#09090b' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: t('goals.total'), value: goals.length, accent: 'var(--gold)' },
          { label: t('goals.active'), value: activeGoals.length, accent: '#55EFC4' },
          { label: t('goals.completed'), value: completedGoals.length, accent: '#74C0FC' },
        ].map((stat) => (
          <div key={stat.label} className="glass p-4 text-center">
            <p className="font-display text-2xl font-semibold" style={{ color: stat.accent }}>{stat.value}</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Onboarding Goals Section ── */}
      {hasOnboarding && onboardingGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Mon parcours personnalisé
              </h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Basé sur vos réponses au questionnaire d&apos;accueil
              </p>
            </div>
            <Link
              href="/onboarding"
              className="text-[12px] px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--gold)', background: 'rgba(212,175,55,0.08)' }}
            >
              Modifier
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onboardingGoals.map((og, i) => (
              <motion.div
                key={og.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.4, ease }}
                className="rounded-xl p-5 group"
                style={{
                  background: og.status === 'completed' ? 'rgba(85,239,196,0.04)' : 'rgba(212,175,55,0.04)',
                  border: og.status === 'completed' ? '1px solid rgba(85,239,196,0.15)' : '1px solid rgba(212,175,55,0.12)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ background: og.status === 'completed' ? '#55EFC4' : 'var(--gold)' }} />
                      <span className="text-[11px] font-medium uppercase tracking-wide"
                        style={{ color: og.status === 'completed' ? '#55EFC4' : 'var(--gold)' }}>
                        {og.status === 'completed' ? 'Complété' : 'En cours'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                        Onboarding
                      </span>
                    </div>
                    <h3 className="font-semibold text-[15px] mb-1" style={{
                      color: 'var(--text-primary)',
                      textDecoration: og.status === 'completed' ? 'line-through' : 'none',
                      opacity: og.status === 'completed' ? 0.7 : 1,
                    }}>
                      {og.title}
                    </h3>
                    {og.description && (
                      <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {og.description}
                      </p>
                    )}
                    {og.recommended_slug && (
                      <Link
                        href={`/dashboard/encyclopedie/${og.recommended_slug}`}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--gold)' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        Voir le challenge recommandé
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={async () => {
                        if (!userId) return
                        const newStatus = og.status === 'active' ? 'completed' : 'active'
                        const supabase = createClient()
                        await supabase.from('user_goals').update({ status: newStatus }).eq('id', og.id)
                        setOnboardingGoals(prev => prev.map(g => g.id === og.id ? { ...g, status: newStatus } : g))
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4' }}
                      title={og.status === 'active' ? 'Marquer comme complété' : 'Réactiver'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Prompt to take onboarding if not done ── */}
      {!hasOnboarding && goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
          className="rounded-xl p-6 text-center"
          style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
        >
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)' }}>
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Personnalisez votre parcours
          </h3>
          <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            Répondez à quelques questions pour que nous puissions vous guider vers les challenges les plus adaptés à vos besoins.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#09090b' }}
          >
            Commencer le questionnaire
          </Link>
        </motion.div>
      )}

      {goals.length === 0 && hasOnboarding ? null : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass p-12 text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(212, 175, 55, 0.08)' }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{t('goals.empty')}</p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('goals.empty_desc')}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {goals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease }}
                className="glass glass-hover p-5 group relative"
                style={{
                  borderColor: goal.status === 'completed' ? 'rgba(85, 239, 196, 0.15)' : 'rgba(212, 175, 55, 0.08)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ background: goal.status === 'completed' ? '#55EFC4' : 'var(--gold)' }}
                      />
                      <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: goal.status === 'completed' ? '#55EFC4' : 'var(--gold)' }}>
                        {goal.status === 'completed' ? t('goals.completed') : t('goals.active')}
                      </span>
                    </div>
                    <h3
                      className="font-semibold text-[15px] mb-1"
                      style={{
                        color: 'var(--text-primary)',
                        textDecoration: goal.status === 'completed' ? 'line-through' : 'none',
                        opacity: goal.status === 'completed' ? 0.7 : 1,
                      }}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {goal.target_date && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {formatDate(goal.target_date)}
                        </span>
                      )}
                      <span>{formatDate(goal.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleStatus(goal.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      style={{ background: 'rgba(85, 239, 196, 0.1)', color: '#55EFC4' }}
                      title={goal.status === 'active' ? t('goals.mark_complete') : t('goals.reactivate')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                      title={t('goals.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease }}
              className="glass w-full max-w-md p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('goals.add')}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('goals.goal_title')}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Méditer 10 minutes par jour"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--dark-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('goals.description')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre objectif..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none resize-none transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--dark-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('goals.target_date')}</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--dark-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="w-full py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#09090b' }}
              >
                {t('goals.create')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Community Challenges Section ── */}
      {challenges.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Défis Communautaires
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Participez aux défis de la communauté et gagnez des récompenses.
          </p>

          <div className="space-y-3">
            {challenges.map(ch => {
              const part = participations[ch.id]
              const isEnrolled = !!part
              const isCompleted = part?.status === 'completed'
              const daysLeft = ch.end_date ? Math.max(0, Math.ceil((new Date(ch.end_date).getTime() - Date.now()) / 86400000)) : null
              const phases = ch.phases || []
              const hasPhases = phases.length > 0
              const myProgress = phaseProgress[ch.id] || []
              const completedPhases = myProgress.filter(pp => pp.status === 'completed').length
              const isExpanded = expandedChallenge === ch.id

              return (
                <div key={ch.id} className="rounded-xl p-5" style={{
                  background: isCompleted ? 'rgba(85,239,196,0.04)' : 'var(--dark-card)',
                  border: isCompleted ? '1px solid rgba(85,239,196,0.15)' : '1px solid var(--dark-border)',
                }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ch.title}</h3>
                        {isCompleted && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {hasPhases && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                            {phases.length} phase{phases.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {ch.description && (
                        <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{ch.description}</p>
                      )}

                      {/* Phase progress bar */}
                      {hasPhases && isEnrolled && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${phases.length > 0 ? (completedPhases / phases.length) * 100 : 0}%`,
                                  background: 'linear-gradient(90deg, var(--gold), #55EFC4)',
                                }} />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                              {completedPhases}/{phases.length}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--gold)' }}>+{ch.reward_value} XP</span>
                        {ch.reward_detail && <span>{ch.reward_detail}</span>}
                        {daysLeft !== null && daysLeft > 0 && <span>{daysLeft} jours restants</span>}
                        {ch.status === 'completed' && <span style={{ color: '#D4AF37' }}>Défi terminé</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!isEnrolled && ch.status === 'active' ? (
                        <button
                          onClick={async () => {
                            if (!userId) return
                            const supabase = createClient()
                            const { data } = await supabase.from('challenge_participations').insert({
                              challenge_id: ch.id,
                              user_id: userId,
                              status: 'enrolled',
                              progress: 0,
                              completed_at: null,
                            }).select().single()
                            if (data) {
                              setParticipations(prev => ({ ...prev, [ch.id]: data as ChallengeParticipation }))
                              // Create phase progress entries
                              if (hasPhases) {
                                const progressEntries = phases.map(p => ({
                                  participation_id: (data as ChallengeParticipation).id,
                                  phase_id: p.id,
                                  status: 'pending' as const,
                                }))
                                const { data: pp } = await supabase.from('challenge_phase_progress').insert(progressEntries).select()
                                if (pp) setPhaseProgress(prev => ({ ...prev, [ch.id]: pp as ChallengePhaseProgress[] }))
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                          Participer
                        </button>
                      ) : isEnrolled && !isCompleted && ch.status === 'active' && !hasPhases ? (
                        <button
                          onClick={async () => {
                            if (!userId) return
                            const supabase = createClient()
                            await supabase.from('challenge_participations').update({
                              status: 'completed',
                              completed_at: new Date().toISOString(),
                            }).eq('id', part.id)
                            setParticipations(prev => ({
                              ...prev,
                              [ch.id]: { ...prev[ch.id], status: 'completed', completed_at: new Date().toISOString() } as ChallengeParticipation,
                            }))
                            try {
                              await supabase.rpc('add_xp', {
                                p_user_id: userId,
                                p_amount: 150,
                                p_reason: 'community_challenge_completed',
                              })
                            } catch { /* non-critical */ }
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.2)' }}>
                          Marquer terminé
                        </button>
                      ) : isCompleted ? (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: '#55EFC4' }}>
                          Complété
                        </span>
                      ) : null}

                      {hasPhases && isEnrolled && (
                        <button onClick={() => setExpandedChallenge(isExpanded ? null : ch.id)}
                          className="text-[11px] font-medium cursor-pointer"
                          style={{ color: 'var(--gold)' }}>
                          {isExpanded ? 'Masquer les phases' : 'Voir les phases'}
                        </button>
                      )}
                      {hasPhases && !isEnrolled && (
                        <button onClick={() => setExpandedChallenge(isExpanded ? null : ch.id)}
                          className="text-[11px] font-medium cursor-pointer"
                          style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? 'Masquer' : `${phases.length} phases`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded phases */}
                  {isExpanded && hasPhases && (
                    <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid var(--dark-border)' }}>
                      {phases.map((phase, i) => {
                        const pp = myProgress.find(p => p.phase_id === phase.id)
                        const phaseStatus = pp?.status || 'pending'
                        const isPhaseCompleted = phaseStatus === 'completed'
                        const isPrevCompleted = i === 0 || myProgress.find(p => p.phase_id === phases[i - 1].id)?.status === 'completed'

                        return (
                          <div key={phase.id} className="flex items-start gap-3 rounded-lg p-3"
                            style={{
                              background: isPhaseCompleted ? 'rgba(85,239,196,0.04)' : 'rgba(255,255,255,0.02)',
                              border: isPhaseCompleted ? '1px solid rgba(85,239,196,0.1)' : '1px solid rgba(255,255,255,0.05)',
                              opacity: !isEnrolled ? 0.7 : 1,
                            }}>
                            <div className="flex-shrink-0 mt-0.5">
                              {isPhaseCompleted ? (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ background: 'rgba(85,239,196,0.15)' }}>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                  style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                                  {i + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{
                                color: isPhaseCompleted ? '#55EFC4' : 'var(--text-primary)',
                                textDecoration: isPhaseCompleted ? 'line-through' : 'none',
                              }}>
                                {phase.title}
                              </p>
                              {phase.description && (
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{phase.description}</p>
                              )}
                              {phase.duration_days && (
                                <span className="text-[10px] mt-1 inline-block" style={{ color: 'var(--text-muted)' }}>
                                  Durée : {phase.duration_days} jour{phase.duration_days > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {isEnrolled && !isPhaseCompleted && isPrevCompleted && ch.status === 'active' && (
                              <button
                                onClick={async () => {
                                  if (!userId || !pp) return
                                  const supabase = createClient()
                                  await supabase.from('challenge_phase_progress').update({
                                    status: 'completed',
                                    completed_at: new Date().toISOString(),
                                  }).eq('id', pp.id)

                                  const updatedProgress = myProgress.map(p =>
                                    p.id === pp.id ? { ...p, status: 'completed' as const, completed_at: new Date().toISOString() } : p
                                  )
                                  setPhaseProgress(prev => ({ ...prev, [ch.id]: updatedProgress as ChallengePhaseProgress[] }))

                                  // Check if all phases are now completed
                                  const allDone = updatedProgress.every(p => p.status === 'completed')
                                  if (allDone) {
                                    await supabase.from('challenge_participations').update({
                                      status: 'completed',
                                      completed_at: new Date().toISOString(),
                                    }).eq('id', part.id)
                                    setParticipations(prev => ({
                                      ...prev,
                                      [ch.id]: { ...prev[ch.id], status: 'completed', completed_at: new Date().toISOString() } as ChallengeParticipation,
                                    }))
                                    try {
                                      await supabase.rpc('add_xp', {
                                        p_user_id: userId,
                                        p_amount: 150,
                                        p_reason: 'community_challenge_completed',
                                      })
                                    } catch { /* non-critical */ }
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer flex-shrink-0"
                                style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.2)' }}>
                                Valider
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

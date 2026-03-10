'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Challenge, ChallengeParticipation } from '@/types/database'
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
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [participations, setParticipations] = useState<Record<string, ChallengeParticipation>>({})
  const [userId, setUserId] = useState<string | null>(null)

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

      if (ch) setChallenges(ch as Challenge[])

      const { data: parts } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)

      if (parts) {
        const map: Record<string, ChallengeParticipation> = {}
        for (const p of parts as ChallengeParticipation[]) {
          map[p.challenge_id] = p
        }
        setParticipations(map)
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

      {goals.length === 0 ? (
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
                      </div>
                      {ch.description && (
                        <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{ch.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--gold)' }}>+{ch.reward_value} XP</span>
                        {ch.reward_detail && <span>{ch.reward_detail}</span>}
                        {daysLeft !== null && daysLeft > 0 && <span>{daysLeft} jours restants</span>}
                        {ch.status === 'completed' && <span style={{ color: '#D4AF37' }}>Défi terminé</span>}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
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
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                          Participer
                        </button>
                      ) : isEnrolled && !isCompleted && ch.status === 'active' ? (
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
                                p_amount: XP_REWARDS.community_challenge_completed,
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
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

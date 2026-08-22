'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getAllCategories, getUserBadges, getUserActionCounters, unlockAllBadgesForUser, CATEGORY_ICONS, type CategoryConfig, type BadgeConfig } from '@/lib/badgeService'
import { getLevelForXP, getNextLevel, getLevelProgress, formatXP, LEVEL_THRESHOLDS } from '@/lib/xp'

const ease = [0.25, 0.46, 0.45, 0.94] as const

type QuestInfo = {
  action: string
  xpLine: string
  route: string
  unit: string
  color: string
}

const QUEST_INFO: Record<string, QuestInfo> = {
  shines_given: {
    action: 'Soutenez les messages des membres',
    xpLine: '+15 · +10 · +5 points (max 3/jour)',
    route: '/dashboard/communaute',
    unit: 'Shines donnés',
    color: '#C9A961',
  },
  shares_external: {
    action: 'Partagez une publication en dehors de SOS Shine',
    xpLine: '+5 points par partage',
    route: '/dashboard/communaute',
    unit: 'Partages',
    color: '#E3D5BE',
  },
  shines_received: {
    action: 'Publie du contenu qui inspire les autres membres',
    xpLine: '+3 points par soutien reçu · illimité',
    route: '/dashboard/mur',
    unit: 'Shines reçus',
    color: '#FFD700',
  },
  comments_left: {
    action: 'Commente les publications du Mur communautaire',
    xpLine: '+50 points (max 5/jour)',
    route: '/dashboard/mur',
    unit: 'Commentaires',
    color: '#6BCFA0',
  },
  publications_created: {
    action: 'Publie sur le Mur de la communauté',
    xpLine: '+150 points (max 2/jour)',
    route: '/dashboard/mur',
    unit: 'Publications',
    color: '#6B9FD4',
  },
  encyclopedia_completed: {
    action: 'Complète les quiz de l\'encyclopédie (score ≥ 80 %)',
    xpLine: '+1 000 à 1 600 points par module',
    route: '/dashboard/encyclopedie',
    unit: 'Modules complétés',
    color: '#D4A054',
  },
  media_consumed: {
    action: 'Regarde ou écoute du contenu (Shine TV, Audible, Shorts…)',
    xpLine: '+25 points (max 4/jour)',
    route: '/dashboard/shine-tv',
    unit: 'Médias consommés',
    color: '#C9A961',
  },
  login_streak: {
    action: 'Connecte-toi chaque jour sans interruption',
    xpLine: 'Streak de jours consécutifs',
    route: '/dashboard',
    unit: 'Jours consécutifs',
    color: '#FF7675',
  },
}

type Counters = {
  shines_given: number
  shines_received: number
  comments_left: number
  publications_created: number
  shares_external: number
  encyclopedia_completed: number
  media_consumed: number
  login_streak: number
}

export default function BadgesQuestPage() {
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set())
  const [counters, setCounters] = useState<Counters | null>(null)
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showGallery, setShowGallery] = useState(false)

  const categories = getAllCategories()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (profile?.role === 'founder') await unlockAllBadgesForUser(user.id)

      const [badges, cts, xpRow] = await Promise.all([
        getUserBadges(user.id),
        getUserActionCounters(user.id),
        supabase.from('user_xp' as never).select('total_xp').eq('user_id', user.id).maybeSingle(),
      ])

      setUnlockedBadgeIds(new Set(badges.map(b => b.badge_id)))
      setCounters(cts as Counters | null)
      const xp = (xpRow?.data as { total_xp?: number } | null)?.total_xp ?? 0
      setTotalXp(xp)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLevel = getLevelForXP(totalXp)
  const nextLevel = getNextLevel(currentLevel.level)
  const progress = getLevelProgress(totalXp)
  const xpToNext = nextLevel ? nextLevel.minXP - totalXp : 0

  const totalBadges = Object.values(categories).reduce((s, c) => s + (c as CategoryConfig).badges.length, 0)
  const unlockedCount = unlockedBadgeIds.size

  // « shares_external » n'était pas listé tant que rien ne l'incrémentait.
  // Le partage est désormais compté (voir countShare dans le mur), donc la
  // quête « L'Ambassadeur » et ses 7 badges redeviennent atteignables.
  const quests = Object.entries(categories)
    .filter(([key]) => QUEST_INFO[key])
    .map(([key, cat]) => {
      const category = cat as CategoryConfig
      const info = QUEST_INFO[key]
      const current = (counters as Record<string, number> | null)?.[key] ?? 0
      const nextBadge = category.badges.find(b => !unlockedBadgeIds.has(b.id)) ?? null
      const prevBadge = nextBadge
        ? category.badges[category.badges.indexOf(nextBadge) - 1] ?? null
        : category.badges[category.badges.length - 1] ?? null
      const from = prevBadge?.threshold ?? 0
      const to = nextBadge?.threshold ?? from
      const pct = to > from ? Math.min(100, Math.round(((current - from) / (to - from)) * 100)) : 100
      const completed = !nextBadge
      return { key, category, info, current, nextBadge, pct, completed }
    })

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <div>
        <Link href="/dashboard" className="text-sm font-medium flex items-center gap-1 text-[var(--brand)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Ma progression
        </Link>
      </div>

      {/* ── XP Level Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(201,169,97,0.12)', border: '2px solid rgba(201,169,97,0.3)' }}>
            {currentLevel.icon}
          </div>
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)] mb-0.5">Niveau {currentLevel.level}</p>
            <h2 className="font-display text-2xl font-light text-[var(--text-primary)]">{currentLevel.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{formatXP(totalXp)}</p>
            <p className="text-[11px] text-[var(--text-muted)]">points</p>
          </div>
        </div>

        {nextLevel ? (
          <>
            <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
              <span>{currentLevel.name}</span>
              <span>{nextLevel.icon} {nextLevel.name} — {formatXP(xpToNext)} points restants</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-light))' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: ease as unknown as [number, number, number, number] }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-center" style={{ color: 'var(--brand)' }}>Niveau maximum atteint 💠</p>
        )}

        {/* Levels overview */}
        <div className="flex gap-1 mt-4">
          {LEVEL_THRESHOLDS.map(lvl => (
            <div key={lvl.level} title={`${lvl.name} — ${formatXP(lvl.minXP)} XP`}
              className="flex-1 h-1 rounded-full transition-all"
              style={{ background: totalXp >= lvl.minXP ? 'var(--brand)' : 'var(--border)' }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1">
          <span>Étincelle ✨</span><span>Diamant 💠</span>
        </div>
      </motion.div>

      {/* ── Quêtes ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Vos prochaines étapes</h2>
          <span className="text-sm text-[var(--text-muted)]">{unlockedCount} / {totalBadges} badges obtenus</span>
        </div>

        <div className="space-y-3">
          {quests.map(({ key, category, info, current, nextBadge, pct, completed }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${completed ? 'rgba(85,239,196,0.2)' : 'var(--border)'}`, background: 'var(--surface-card)' }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${info.color}18`, border: `1px solid ${info.color}30` }}>
                    {completed ? '✅' : (CATEGORY_ICONS[category.icon] || '🏅')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-[var(--text-primary)]">{category.name}</h3>
                      {completed
                        ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(85,239,196,0.12)', color: '#55EFC4' }}>Complété</span>
                        : nextBadge && <span className="text-[10px] flex-shrink-0" style={{ color: info.color }}>{nextBadge.emoji} {nextBadge.title}</span>
                      }
                    </div>
                    <p className="text-[12px] text-[var(--text-muted)] mb-3">{info.action}</p>

                    {/* Progress */}
                    {!completed && nextBadge && (
                      <>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span style={{ color: info.color }}>{current} {info.unit}</span>
                          <span className="text-[var(--text-muted)]">Objectif : {nextBadge.threshold}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border)' }}>
                          <motion.div className="h-full rounded-full"
                            style={{ background: info.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.04 + 0.2 }}
                          />
                        </div>
                      </>
                    )}

                    {/* XP info + CTA */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.15)' }}>
                        ⚡ {info.xpLine}
                      </span>
                      {!completed && (
                        <Link href={info.route}
                          className="text-[12px] font-medium px-3 py-1.5 rounded-xl transition-all hover:brightness-110 flex-shrink-0"
                          style={{ background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}30` }}>
                          Y aller →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge progression mini-strip */}
              <div className="px-5 pb-4">
                <div className="flex gap-1.5 flex-wrap">
                  {category.badges.map(b => {
                    const unlocked = unlockedBadgeIds.has(b.id)
                    return (
                      <div key={b.id} title={`${b.emoji ?? ''} ${b.title} — ${b.threshold} ${info.unit}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
                        style={{
                          background: unlocked ? `${info.color}20` : 'var(--border)',
                          border: unlocked ? `1.5px solid ${info.color}` : '1.5px solid transparent',
                          opacity: unlocked ? 1 : 0.35,
                          filter: unlocked ? 'none' : 'grayscale(1)',
                        }}>
                        {b.emoji ?? '🏅'}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Galerie complète ── */}
      <div>
        <button
          onClick={() => setShowGallery(v => !v)}
          className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          <span className="font-semibold text-[var(--text-primary)]">Galerie complète</span>
          <span className="text-[var(--text-muted)] text-sm">{showGallery ? '▲ Réduire' : '▼ Voir tous les badges'}</span>
        </button>

        {showGallery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 mt-3"
          >
            {Object.entries(categories).map(([catKey, cat]) => {
              const category = cat as CategoryConfig
              const catUnlocked = category.badges.filter(b => unlockedBadgeIds.has(b.id)).length
              const route = QUEST_INFO[catKey]?.route || '/dashboard'
              return (
                <div key={catKey} className="rounded-2xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span>{CATEGORY_ICONS[category.icon] || '🏆'}</span>
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">{category.name}</h3>
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)' }}>
                      {catUnlocked}/{category.badges.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {category.badges.map((badge: BadgeConfig) => {
                      const isUnlocked = unlockedBadgeIds.has(badge.id)
                      return (
                        <Link key={badge.id} href={route}
                          className="rounded-xl p-3 text-center transition-all hover:scale-[1.03] block"
                          style={{
                            background: isUnlocked ? 'rgba(201,169,97,0.08)' : 'rgba(255,255,255,0.02)',
                            border: isUnlocked ? '1px solid rgba(201,169,97,0.2)' : '1px solid var(--border)',
                            opacity: isUnlocked ? 1 : 0.45,
                          }}>
                          <div className="text-xl mb-1" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                            {badge.emoji ?? CATEGORY_ICONS[category.icon] ?? '🏅'}
                          </div>
                          <p className="text-[10px] font-medium leading-tight" style={{ color: isUnlocked ? 'var(--brand)' : 'var(--text-muted)' }}>
                            {badge.title}
                          </p>
                          <p className="text-[9px] mt-0.5 text-[var(--text-muted)]">{badge.threshold} {QUEST_INFO[catKey]?.unit || ''}</p>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

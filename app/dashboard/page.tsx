'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getNextRotatingQuote, type Quote } from '@/lib/quotes'
import { greetingsData, GREETINGS_PER_SLOT, type TimeSlot } from '@/data/greetingsData'
import { getDailyForecast, resolveZodiacSign, ZODIAC_INFO } from '@/data/energyWeather'
import { getLevelForXP, getNextLevel, getLevelProgress, formatXP } from '@/lib/xp'
import type { UserXP } from '@/types/database'
import { getAllCategories, getUserBadges, CATEGORY_ICONS, type CategoryConfig } from '@/lib/badgeService'

const ease = [0.25, 0.46, 0.45, 0.94] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: ease as unknown as [number, number, number, number] },
  }),
}

/* ─────────────────────────────────────────────
   Section: Niveau & XP (migrated from Profile)
   ───────────────────────────────────────────── */
function LevelXPSection({ xpData }: { xpData: UserXP | null }) {
  if (!xpData) return null

  const level = getLevelForXP(xpData.total_xp)
  const next = getNextLevel(level.level)
  const progress = getLevelProgress(xpData.total_xp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
      className="glass relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06), var(--dark-card))',
        borderColor: 'rgba(212,175,55,0.15)',
      }}
    >
      <div className="p-5 sm:p-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            MA LÉGENDE
          </h2>
          <span className="text-xl">{level.icon}</span>
        </div>

        {/* Rank name + XP total */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-display text-2xl font-semibold" style={{ color: 'var(--gold)' }}>
              {level.name}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Rang</p>
          </div>
        </div>

        {/* Progress bar */}
        {next ? (
          <div className="mt-3">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                XP: {formatXP(xpData.total_xp)} / {formatXP(next.minXP)} XP
              </p>
              <p className="text-[11px]" style={{ color: 'var(--gold)', opacity: 0.8 }}>
                Encore {formatXP(next.minXP - xpData.total_xp)} XP
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-xl p-3 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Rang maximum atteint !</p>
          </div>
        )}

      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Section: Météo Énergétique
   ───────────────────────────────────────────── */
function EnergyWeatherWidget({ profile }: { profile: Profile | null }) {
  const sign = profile ? resolveZodiacSign(profile.prenom, (profile as Profile & { zodiac_sign?: string | null }).zodiac_sign) : null
  if (!sign) return null

  const forecast = getDailyForecast(sign)
  const info = ZODIAC_INFO[sign]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
      className="glass relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${forecast.color}08, var(--dark-card))`,
        borderColor: `${forecast.color}20`,
      }}
    >
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${forecast.color}30, transparent 70%)` }}
      />
      <div className="p-5 sm:p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{info.symbol}</span>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Météo Énergétique du jour
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${forecast.color}15` }}>
              {forecast.element}
            </div>
            <div>
              <p className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{info.label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: forecast.color }} />
                <span className="text-[13px] font-medium" style={{ color: forecast.color }}>Énergie {forecast.energy}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ambiance</span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{forecast.mood}</span>
            </div>
            <p className="text-[14px] leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
              &ldquo;{forecast.advice}&rdquo;
            </p>
            <div className="flex items-center gap-4 pt-1">
              <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Heure favorable : <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{forecast.luckyHour}</span>
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{info.dates}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Section: Mes contributions
   ───────────────────────────────────────────── */
function ContributionsSection({ xpData }: { xpData: UserXP | null }) {
  const [showLog, setShowLog] = useState(false)
  const [activityLog, setActivityLog] = useState<Array<{ id: string; action: string; detail: string; date: string }>>([])
  const [logLoading, setLogLoading] = useState(false)

  async function loadActivityLog() {
    if (activityLog.length > 0) { setShowLog(!showLog); return }
    setLogLoading(true)
    setShowLog(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLogLoading(false); return }

    // Fetch recent activity from multiple sources
    const [likesRes, commentsRes, postsRes] = await Promise.all([
      supabase.from('post_likes').select('id, post_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('post_comments').select('id, post_id, content, created_at').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('posts').select('id, title, category, created_at').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])

    const log: Array<{ id: string; action: string; detail: string; date: string }> = []

    // Likes = Shines donnés
    for (const like of (likesRes.data || [])) {
      log.push({
        id: `like-${like.id}`,
        action: 'Shine donné',
        detail: 'Vous avez donné un Shine',
        date: like.created_at,
      })
    }

    // Comments
    for (const comment of (commentsRes.data || [])) {
      log.push({
        id: `comment-${comment.id}`,
        action: 'Commentaire',
        detail: `Vous avez commenté : "${(comment.content || '').slice(0, 60)}${(comment.content || '').length > 60 ? '...' : ''}"`,
        date: comment.created_at,
      })
    }

    // Publications
    for (const post of (postsRes.data || [])) {
      log.push({
        id: `post-${post.id}`,
        action: 'Publication',
        detail: `Vous avez publié : "${post.title}"`,
        date: post.created_at,
      })
    }

    // Sort by date descending
    log.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setActivityLog(log.slice(0, 20))
    setLogLoading(false)
  }

  const counters = [
    { label: 'Shines\nTransmis', value: xpData?.shines_given || 0, icon: '💛' },
    { label: 'Shines\nReçus', value: xpData?.shines_received || 0, icon: '⭐' },
    { label: 'Commentaires\nLaissés', value: 0, icon: '💬', key: 'comments' },
    { label: 'Partages', value: 0, icon: '🔗', key: 'shares' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
          PUBLIÉ
        </h2>
        <button
          onClick={loadActivityLog}
          className="text-[12px] font-medium flex items-center gap-1 cursor-pointer transition-colors hover:opacity-80"
          style={{ color: 'var(--gold)' }}
        >
          Afficher les détails
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      {/* Counters bandeau */}
      <div className="glass p-4">
        <div className="grid grid-cols-4 gap-3">
          {counters.map((c, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--gold)' }}>
                {c.value}
              </p>
              <p className="text-[10px] sm:text-[11px] mt-1 whitespace-pre-line leading-tight" style={{ color: 'var(--text-muted)' }}>
                {c.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity log (expandable) */}
      {showLog && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="glass mt-3 p-4 max-h-80 overflow-y-auto"
        >
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Journal d&apos;activité
          </h3>
          {logLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activityLog.length === 0 ? (
            <p className="text-[13px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Aucune activité récente
            </p>
          ) : (
            <div className="space-y-2">
              {activityLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--gold)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{entry.detail}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                    {entry.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Section: Badges (carrousel)
   ───────────────────────────────────────────── */
function BadgesSection({ userId }: { userId: string | null }) {
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const categories = getAllCategories()

  useEffect(() => {
    async function load() {
      if (!userId) { setLoading(false); return }
      const badges = await getUserBadges(userId)
      setUnlockedBadgeIds(new Set(badges.map(b => b.badge_id)))
      setLoading(false)
    }
    load()
  }, [userId])

  // Build flat list of ALL badges (unlocked + locked/grayed)
  const allBadges = Object.entries(categories).flatMap(([, cat]) => {
    const category = cat as CategoryConfig
    return category.badges.map(badge => ({
      ...badge,
      categoryName: category.name,
      categoryIcon: category.icon,
      isUnlocked: unlockedBadgeIds.has(badge.id),
    }))
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-3.52 1.14 6.023 6.023 0 01-3.52-1.14" />
          </svg>
          BADGES
        </h2>
        <Link
          href="/dashboard/badges"
          className="text-[12px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: 'var(--gold)' }}
        >
          Voir tout
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className="shrink-0 w-28 rounded-xl p-3 text-center"
              style={{
                background: badge.isUnlocked ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                border: badge.isUnlocked ? '1px solid rgba(212,175,55,0.15)' : '1px solid var(--dark-border)',
                opacity: badge.isUnlocked ? 1 : 0.4,
                filter: badge.isUnlocked ? 'none' : 'grayscale(1)',
              }}
            >
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
                style={{
                  background: badge.isUnlocked
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))'
                    : 'rgba(255,255,255,0.03)',
                  border: badge.isUnlocked ? '2px solid var(--gold)' : '2px solid var(--dark-border)',
                }}>
                {badge.isUnlocked ? (
                  <span className="text-lg">{CATEGORY_ICONS[badge.categoryIcon] || '🏆'}</span>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    style={{ color: 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )}
              </div>
              <h3 className="font-semibold text-[10px] leading-tight"
                style={{ color: badge.isUnlocked ? 'var(--gold)' : 'var(--text-muted)' }}>
                {badge.title}
              </h3>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {badge.categoryName}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Section: Actu - Shine (5 pillars)
   ───────────────────────────────────────────── */
function ActuShineSection() {
  const [latestContent, setLatestContent] = useState<{
    encyclopedia: { id: string; title: string; image_url: string | null } | null
    shineTV: { id: string; title: string; thumbnail_url: string | null } | null
    audible: { id: string; title: string; cover_url: string | null } | null
    shorts: { id: string; title: string; thumbnail_url: string | null } | null
    library: { id: string; title: string; cover_url: string | null } | null
  }>({
    encyclopedia: null, shineTV: null, audible: null, shorts: null, library: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [encyclopediaRes, tvRes, audibleRes, shortsRes, libraryRes] = await Promise.all([
        supabase.from('douleurs').select('id, title, image_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_tv_videos').select('id, title, thumbnail_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_audible_tracks').select('id, title, cover_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_shorts').select('id, title, thumbnail_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_library_books').select('id, title, cover_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
      ])

      setLatestContent({
        encyclopedia: encyclopediaRes.data?.[0] || null,
        shineTV: tvRes.data?.[0] || null,
        audible: audibleRes.data?.[0] || null,
        shorts: shortsRes.data?.[0] || null,
        library: libraryRes.data?.[0] || null,
      })
      setLoading(false)
    }
    load()
  }, [])

  const pillars = [
    {
      key: 'encyclopedia',
      title: 'Encyclopédie',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      href: '/dashboard/encyclopedie',
      data: latestContent.encyclopedia,
      image: latestContent.encyclopedia?.image_url,
    },
    {
      key: 'shineTV',
      title: 'Shine TV',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      href: '/dashboard/shine-tv',
      data: latestContent.shineTV,
      image: latestContent.shineTV?.thumbnail_url,
    },
    {
      key: 'audible',
      title: 'Audible',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
      href: '/dashboard/shine-audible',
      data: latestContent.audible,
      image: latestContent.audible?.cover_url,
    },
    {
      key: 'shorts',
      title: 'Short',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ),
      href: '/dashboard/shine-shorts',
      data: latestContent.shorts,
      image: latestContent.shorts?.thumbnail_url,
    },
    {
      key: 'library',
      title: 'Librairie',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      href: '/dashboard/shine-librairie',
      data: latestContent.library,
      image: latestContent.library?.cover_url,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--gold)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        ACTU - SHINE
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.key}
              href={pillar.href}
              className="glass glass-hover group block overflow-hidden rounded-xl transition-all duration-300"
              style={{ borderColor: 'rgba(212,175,55,0.08)' }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-black/20">
                {pillar.image ? (
                  <img
                    src={pillar.image}
                    alt={pillar.data?.title || pillar.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.05)' }}>
                    <span style={{ color: 'var(--gold)', opacity: 0.3 }}>{pillar.icon}</span>
                  </div>
                )}
              </div>
              {/* Title */}
              <div className="p-2 text-center">
                <div className="flex justify-center mb-1" style={{ color: 'var(--gold)', opacity: 0.7 }}>
                  {pillar.icon}
                </div>
                <h3 className="text-[10px] sm:text-[11px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {pillar.title}
                </h3>
                {pillar.data && (
                  <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {pillar.data.title}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main Dashboard Page: Ma Légende
   ───────────────────────────────────────────── */
function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours()
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export default function DashboardHome() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [greeting, setGreeting] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})
  const [xpData, setXpData] = useState<UserXP | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    setQuote(getNextRotatingQuote())

    const supabase = createClient()
    const currentSlot = getTimeSlot()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)

        const progress = (data as Profile).greetings_progress || { night: 0, morning: 0, afternoon: 0, evening: 0 }
        const currentIndex = progress[currentSlot] ?? 0
        const message = greetingsData[currentSlot][currentIndex % GREETINGS_PER_SLOT]
        setGreeting(message)

        const nextIndex = (currentIndex + 1) % GREETINGS_PER_SLOT
        const updatedProgress = { ...progress, [currentSlot]: nextIndex }
        supabase.from('profiles').update({ greetings_progress: updatedProgress }).eq('id', user.id).then()
      } else {
        setProfile({
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '', role: 'member', avatar_url: null, plan: null, created_at: user.created_at,
          pseudo: null, bio: null, video_url: null, is_bot: false,
        })
        setGreeting(greetingsData[currentSlot][0])
      }

      // Load XP
      const { data: xp } = await supabase.from('user_xp').select('*').eq('user_id', user.id).maybeSingle()
      if (xp) setXpData(xp as UserXP)
    }

    async function loadSettings() {
      try {
        const { data } = await supabase.from('site_settings').select('key, value')
        if (data) {
          const map: Record<string, string> = {}
          data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
          setSiteSettings(map)
        }
      } catch {}
    }

    loadProfile()
    loadSettings()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── Hero greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
      >
        <p className="text-[13px] font-medium tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          {greeting}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {siteSettings.dash_welcome || t('dashboard.welcome')} <span style={{ color: 'var(--gold)' }}>{profile?.prenom || 'Membre'}</span>
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {siteSettings.dash_subtitle || t('dashboard.explore')}
        </p>
      </motion.div>

      {/* ── Météo Énergétique ── */}
      <EnergyWeatherWidget profile={profile} />

      {/* ── Citation du jour — DEMARCATION LINE ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
        className="glass glass-hover relative overflow-hidden p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), var(--dark-card))',
          borderColor: 'rgba(212, 175, 55, 0.1)',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent 70%)' }}
        />
        <p className="font-display text-xl sm:text-2xl italic leading-relaxed relative" style={{ color: 'var(--text-primary)' }}>
          &ldquo;{siteSettings.dash_custom_quote || (quote ? quote.text.fr : t('quote.text'))}&rdquo;
        </p>
        <p className="mt-4 text-[13px] font-medium relative" style={{ color: 'var(--gold)' }}>
          — {siteSettings.dash_custom_quote_author || (quote ? quote.author.fr : t('quote.author'))}
        </p>
      </motion.div>

      {/* ── Jauge Niveau & XP (below citation) ── */}
      <LevelXPSection xpData={xpData} />

      {/* ── Étape 2: Mes contributions ── */}
      <ContributionsSection xpData={xpData} />

      {/* ── Étape 3: Badges ── */}
      <BadgesSection userId={currentUserId} />

      {/* ── Étape 4: Actu - Shine ── */}
      <ActuShineSection />

      {/* ── Help footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass p-5 text-center"
      >
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {siteSettings.dash_help_text || t('dashboard.help')}{' '}
          <a href={`mailto:${siteSettings.dash_help_email || 'julialaureau@sosshine.com'}`} className="gold-underline font-medium" style={{ color: 'var(--gold)' }}>
            {siteSettings.dash_help_email || 'julialaureau@sosshine.com'}
          </a>
        </p>
      </motion.div>
    </div>
  )
}

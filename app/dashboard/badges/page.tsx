'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getAllCategories, getUserBadges, unlockAllBadgesForUser, CATEGORY_ICONS, type CategoryConfig } from '@/lib/badgeService'

const ease = [0.25, 0.46, 0.45, 0.94] as const

// Mapping des catégories de badges vers les pages de contenu correspondantes
const CATEGORY_ROUTES: Record<string, string> = {
  shines_given: '/dashboard/communaute',
  shines_received: '/dashboard/communaute',
  comments_left: '/dashboard/communaute',
  publications_created: '/dashboard/mur',
  shares_external: '/dashboard/communaute',
  encyclopedia_completed: '/dashboard/encyclopedie',
  media_consumed: '/dashboard/shine-tv',
  login_streak: '/dashboard',
}

export default function BadgesGalleryPage() {
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const categories = getAllCategories()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Check if user is a founder — if so, unlock all badges automatically
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role === 'founder') {
        await unlockAllBadgesForUser(user.id)
      }

      const badges = await getUserBadges(user.id)
      setUnlockedBadgeIds(new Set(badges.map(b => b.badge_id)))
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

  const totalBadges = Object.values(categories).reduce((sum, cat) => sum + (cat as CategoryConfig).badges.length, 0)
  const unlockedCount = unlockedBadgeIds.size

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            className="text-sm font-medium flex items-center gap-1 text-[var(--brand)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Ma Légende
          </Link>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
          Galerie de Badges
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {unlockedCount} / {totalBadges} badges débloqués
        </p>
        {/* Global progress bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden bg-[var(--border)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-light))' }}
            initial={{ width: 0 }}
            animate={{ width: `${totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: ease as unknown as [number, number, number, number] }}
          />
        </div>
      </div>

      {/* Categories */}
      {Object.entries(categories).map(([catKey, cat]) => {
        const category = cat as CategoryConfig
        const catUnlocked = category.badges.filter(b => unlockedBadgeIds.has(b.id)).length

        return (
          <motion.div
            key={catKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
            className="glass p-6"
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{CATEGORY_ICONS[category.icon] || '🏆'}</span>
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  {category.name}
                </h2>
                <p className="text-[12px] text-[var(--text-muted)]">
                  {category.description}
                </p>
              </div>
              <span className="ml-auto text-[12px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)' }}>
                {catUnlocked}/{category.badges.length}
              </span>
            </div>

            {/* Badges grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {category.badges.map((badge) => {
                const isUnlocked = unlockedBadgeIds.has(badge.id)
                const route = CATEGORY_ROUTES[catKey] || '/dashboard'
                return (
                  <Link
                    key={badge.id}
                    href={route}
                    className="relative rounded-xl p-4 text-center transition-all duration-300 block hover:scale-[1.03]"
                    style={{
                      background: isUnlocked ? 'rgba(201,169,97,0.08)' : 'rgba(255,255,255,0.02)',
                      border: isUnlocked ? '1px solid rgba(201,169,97,0.2)' : '1px solid var(--border)',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    {/* Badge icon */}
                    <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: isUnlocked
                          ? 'linear-gradient(135deg, rgba(201,169,97,0.2), rgba(201,169,97,0.05))'
                          : 'rgba(255,255,255,0.03)',
                        border: isUnlocked ? '2px solid var(--brand)' : '2px solid var(--border)',
                      }}>
                      <span className="text-lg" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)', opacity: isUnlocked ? 1 : 0.6 }}>
                        {badge.emoji || CATEGORY_ICONS[category.icon] || '🏆'}
                      </span>
                    </div>

                    {/* Badge info */}
                    <h3 className="font-semibold text-[12px] leading-tight mb-1"
                      style={{ color: isUnlocked ? 'var(--brand)' : 'var(--text-muted)' }}>
                      {badge.title}
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {category.name}
                    </p>
                    <p className="text-[10px] mt-1 font-mono" style={{ color: isUnlocked ? 'var(--brand)' : 'var(--text-muted)' }}>
                      {badge.threshold} {catKey === 'login_streak' ? 'jours' : 'actions'}
                    </p>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getLevelForXP, getNextLevel, getLevelProgress, formatXP, LEVEL_THRESHOLDS } from '@/lib/xp'
import type { UserXP } from '@/types/database'

type Size = 'sm' | 'md' | 'lg'

interface XPBadgeProps {
  userId?: string
  size?: Size
  showDetails?: boolean
}

export default function XPBadge({ userId, size = 'md', showDetails = false }: XPBadgeProps) {
  const [xpData, setXpData] = useState<UserXP | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      let uid = userId
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser()
        uid = user?.id
      }
      if (!uid) { setLoading(false); return }

      const { data } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle()

      if (data) setXpData(data as UserXP)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading || !xpData) return null

  const level = getLevelForXP(xpData.total_xp)
  const next = getNextLevel(level.level)
  const progress = getLevelProgress(xpData.total_xp)

  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  if (!showDetails) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${sizeClasses[size]}`}
        style={{ background: 'rgba(201,169,97,0.1)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.15)' }}
      >
        <span>{level.icon}</span>
        <span>Niv. {level.level}</span>
      </span>
    )
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Niveau &amp; XP</h3>
        <span className="text-xl">{level.icon}</span>
      </div>

      {/* Level name + XP */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-display text-lg font-semibold" style={{ color: 'var(--gold)' }}>
            {level.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Niveau {level.level}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatXP(xpData.total_xp)}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>XP total</p>
        </div>
      </div>

      {/* Progress bar */}
      {next && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Progression vers {next.name}</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--gold)' }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
            {xpData.total_xp} / {next.minXP} XP
          </p>
        </div>
      )}

      {/* Shines stats */}
      <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
        <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(201,169,97,0.04)' }}>
          <p className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>{xpData.shines_given}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Shines donnés</p>
        </div>
        <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(201,169,97,0.04)' }}>
          <p className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>{xpData.shines_received}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Shines reçus</p>
        </div>
      </div>

      {/* Level list */}
      {size === 'lg' && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
          <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Tous les niveaux</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LEVEL_THRESHOLDS.map((t) => (
              <div key={t.level}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px]"
                style={{
                  background: t.level <= level.level ? 'rgba(201,169,97,0.06)' : 'transparent',
                  color: t.level <= level.level ? 'var(--gold)' : 'var(--text-muted)',
                  opacity: t.level <= level.level ? 1 : 0.5,
                }}>
                <span>{t.icon}</span>
                <span>{t.name}</span>
                <span className="ml-auto">{t.minXP} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

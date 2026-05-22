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
        style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.15)' }}
      >
        <span>{level.icon}</span>
        <span>{level.name}</span>
      </span>
    )
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base text-[var(--text-primary)]">Niveau &amp; XP</h3>
        <span className="text-xl">{level.icon}</span>
      </div>

      {/* Level name + XP */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-display text-lg font-semibold text-[var(--brand)]">
            {level.name}
          </p>
          <p className="text-xs text-[var(--text-muted)]">Niveau {level.level} / 10</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-[var(--text-primary)]">{formatXP(xpData.total_xp)}</p>
          <p className="text-[11px] text-[var(--text-muted)]">XP total</p>
        </div>
      </div>

      {/* Progress bar */}
      {next ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[var(--text-muted)]">
              Progression vers {next.icon} {next.name}
            </span>
            <span className="text-[11px] font-medium text-[var(--brand)]">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-[var(--border)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-[var(--text-muted)]">
              {formatXP(xpData.total_xp)} XP
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {formatXP(next.minXP)} XP
            </p>
          </div>
          <p className="text-[10px] mt-0.5 text-center" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Encore {formatXP(next.minXP - xpData.total_xp)} XP pour atteindre {next.name}
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-xl p-3 text-center" style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.15)' }}>
          <p className="text-sm font-semibold text-[var(--brand)]">Rang maximum atteint !</p>
          <p className="text-[11px] mt-0.5 text-[var(--text-muted)]">1 000 000 XP - Diamant</p>
        </div>
      )}

      {/* Shines stats */}
      <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(201,169,97,0.04)' }}>
          <p className="text-lg font-semibold text-[var(--brand)]">{xpData.shines_given}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Shines donnés</p>
        </div>
        <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(201,169,97,0.04)' }}>
          <p className="text-lg font-semibold text-[var(--brand)]">{xpData.shines_received}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Shines reçus</p>
        </div>
      </div>

      {/* Level list */}
      {size === 'lg' && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[11px] font-medium mb-2 text-[var(--text-muted)]">Tous les niveaux</p>
          <div className="space-y-1.5">
            {LEVEL_THRESHOLDS.map((t) => {
              const isReached = xpData.total_xp >= t.minXP
              const isCurrent = t.level === level.level
              return (
                <div key={t.level}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]"
                  style={{
                    background: isCurrent ? 'rgba(201,169,97,0.1)' : isReached ? 'rgba(201,169,97,0.04)' : 'transparent',
                    color: isReached ? 'var(--brand)' : 'var(--text-muted)',
                    opacity: isReached ? 1 : 0.4,
                    border: isCurrent ? '1px solid rgba(201,169,97,0.2)' : '1px solid transparent',
                  }}>
                  <span className="text-sm">{t.icon}</span>
                  <span className="font-medium">{t.name}</span>
                  <span className="ml-auto font-mono">{formatXP(t.minXP)} XP</span>
                  {isCurrent && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                      style={{ background: 'var(--brand)', color: '#09090b' }}>
                      ACTUEL
                    </span>
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

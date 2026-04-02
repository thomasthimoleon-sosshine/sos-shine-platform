'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type CommunityStats = {
  totalShinesGiven: number
  totalShinesReceived: number
  totalComments: number
  totalParcoursCompleted: number
}

export default function CommunityStatsBar() {
  const [stats, setStats] = useState<CommunityStats | null>(null)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      const [xpRes, commentsRes, parcoursRes] = await Promise.all([
        // Total shines given/received across all users
        supabase.from('user_xp').select('shines_given, shines_received'),
        // Total comments count
        supabase.from('post_comments').select('*', { count: 'exact', head: true }),
        // Total completed parcours (encyclopedia)
        supabase.from('user_progress').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null),
      ])

      let totalGiven = 0
      let totalReceived = 0
      if (xpRes.data) {
        for (const row of xpRes.data) {
          totalGiven += row.shines_given || 0
          totalReceived += row.shines_received || 0
        }
      }

      setStats({
        totalShinesGiven: totalGiven,
        totalShinesReceived: totalReceived,
        totalComments: commentsRes.count || 0,
        totalParcoursCompleted: parcoursRes.count || 0,
      })
    }
    loadStats()
  }, [])

  if (!stats) return null

  const items = [
    { label: 'Shines données', value: stats.totalShinesGiven, icon: '💛' },
    { label: 'Shines reçus', value: stats.totalShinesReceived, icon: '⭐' },
    { label: 'Commentaires', value: stats.totalComments, icon: '💬' },
    { label: 'Parcours complétés', value: stats.totalParcoursCompleted, icon: '🏆' },
  ]

  const total = stats.totalShinesGiven + stats.totalShinesReceived + stats.totalComments + stats.totalParcoursCompleted

  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
      {/* Progress bar */}
      <div className="h-1.5 w-full flex">
        {items.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 25
          const colors = ['#D4AF37', '#FFD700', '#74C0FC', '#55EFC4']
          return (
            <div
              key={i}
              className="h-full transition-all duration-700"
              style={{ width: `${pct}%`, background: colors[i] }}
            />
          )
        })}
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: 'rgba(212,175,55,0.06)' }}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center py-4 px-2" style={{ background: 'var(--dark)' }}>
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xl sm:text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {item.value.toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] uppercase tracking-wider mt-0.5 text-center" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

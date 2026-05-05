'use client'

import { motion } from 'framer-motion'

export function QuizProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {current} / {total}
        </span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--brand)' }}>
          {pct}%
        </span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--brand), var(--gold-deep, #B8960F))' }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'

export function QuizProgress({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'var(--gold)' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

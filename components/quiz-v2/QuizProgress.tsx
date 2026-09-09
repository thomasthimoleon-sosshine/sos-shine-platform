'use client'

import { motion } from 'framer-motion'

export function QuizProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  // Jalon de momentum (effet Zeigarnik) — pas de compteur brut pour éviter
  // l'incohérence avec « 12 questions » annoncé, et pour un côté plus premium.
  const momentum = pct >= 80 ? 'Presque là' : pct >= 45 ? 'À mi-chemin' : 'Ta Signature se dessine'
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] tracking-wide uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          {momentum}
        </span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--brand)' }}>
          {pct}%
        </span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: '5px', background: 'rgba(245,239,227,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--brand), var(--gold-deep, #E8C77D))', boxShadow: '0 0 12px rgba(201,169,97,0.45)' }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

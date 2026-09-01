'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import ShineIcon, { type ShineIconName } from '@/components/icons/ShineIcon'
import { getLevelForXP, getNextLevel, getLevelProgress, formatXP, LEVEL_THRESHOLDS } from '@/lib/xp'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LA CARTE DE PROGRESSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Le tableau de bord n'annonçait que le nom du niveau : « Étincelle », et un
 *  lien. La personne devait ouvrir une autre page pour savoir où elle en était.
 *  La carte complète — niveau, points, distance au palier suivant — vit
 *  désormais ici, et les deux pages lisent le même code : elles ne peuvent plus
 *  diverger.
 */

const ease = [0.25, 0.46, 0.45, 0.94] as const

const PREMIER = LEVEL_THRESHOLDS[0]
const DERNIER = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]

export default function CarteProgression({
  totalXp,
  /** Rangée discrète sous la carte : série en cours, lien vers les badges… */
  pied,
  /** L'accueil anime déjà ses sections ; on n'anime pas deux fois. */
  anime = true,
}: {
  totalXp: number
  pied?: ReactNode
  anime?: boolean
}) {
  const niveau = getLevelForXP(totalXp)
  const suivant = getNextLevel(niveau.level)
  const avancee = getLevelProgress(totalXp)
  const restants = suivant ? suivant.minXP - totalXp : 0

  const animation = anime
    ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
    : {}

  return (
    <motion.div
      {...animation}
      className="rounded-2xl p-6"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(201,169,97,0.12)', border: '2px solid rgba(201,169,97,0.3)', color: 'var(--brand)' }}>
          <ShineIcon name={niveau.emblem as ShineIconName} className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)] mb-0.5">Niveau {niveau.level}</p>
          <h2 className="font-display text-2xl font-light text-[var(--text-primary)]">{niveau.name}</h2>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{formatXP(totalXp)}</p>
          <p className="text-[11px] text-[var(--text-muted)]">points</p>
        </div>
      </div>

      {suivant ? (
        <>
          <div className="flex justify-between items-center gap-3 text-[11px] text-[var(--text-muted)] mb-1.5">
            <span>{niveau.name}</span>
            <span className="inline-flex items-center gap-1 text-right">
              <ShineIcon name={suivant.emblem as ShineIconName} className="w-3 h-3 flex-shrink-0" />
              {suivant.name}, {formatXP(restants)} points restants
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${avancee}%` }}
              transition={{ duration: 0.9, ease: ease as unknown as [number, number, number, number] }}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-center inline-flex items-center justify-center gap-1.5 w-full" style={{ color: 'var(--brand)' }}>
          <ShineIcon name={DERNIER.emblem as ShineIconName} className="w-4 h-4" />
          Niveau maximum atteint
        </p>
      )}

      {/* Les dix paliers, du premier au dernier */}
      <div className="flex gap-1 mt-4">
        {LEVEL_THRESHOLDS.map(palier => (
          <div key={palier.level} title={`${palier.name}, ${formatXP(palier.minXP)} points`}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: totalXp >= palier.minXP ? 'var(--brand)' : 'var(--border)' }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1">
        <span className="inline-flex items-center gap-1">
          <ShineIcon name={PREMIER.emblem as ShineIconName} className="w-2.5 h-2.5" /> {PREMIER.name}
        </span>
        <span className="inline-flex items-center gap-1">
          {DERNIER.name} <ShineIcon name={DERNIER.emblem as ShineIconName} className="w-2.5 h-2.5" />
        </span>
      </div>

      {pied && (
        <div className="mt-5 pt-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ borderTop: '1px solid var(--border)' }}>
          {pied}
        </div>
      )}
    </motion.div>
  )
}

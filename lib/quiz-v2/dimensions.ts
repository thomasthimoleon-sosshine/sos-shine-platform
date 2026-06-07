/**
 * SOS Shine — Quiz V2 Dimensions
 * 10 emotional dimensions scored 0-100
 */

export const DIMENSIONS = {
  1:  { name: 'Analyse mentale',      short: 'Analyse',        icon: '🧠' },
  2:  { name: 'Fuite en action',      short: 'Fuite',          icon: '🏃' },
  3:  { name: 'Care-taking',          short: 'Care-taking',    icon: '🤲' },
  4:  { name: 'Autonomie forcée',     short: 'Autonomie',      icon: '🏰' },
  5:  { name: 'Contrôle',             short: 'Contrôle',       icon: '📋' },
  6:  { name: 'Adaptation/Masking',   short: 'Adaptation',     icon: '🦎' },
  7:  { name: 'Hypervigilance',       short: 'Hypervigilance', icon: '👁️' },
  8:  { name: 'Idéalisation',         short: 'Idéalisation',   icon: '🌟' },
  9:  { name: 'Évitement du conflit', short: 'Évitement',      icon: '🕊️' },
  10: { name: 'Intensité/Drame',      short: 'Intensité',      icon: '🔥' },
} as const

export type DimensionId = keyof typeof DIMENSIONS
export type DimensionScores = Record<string, number>

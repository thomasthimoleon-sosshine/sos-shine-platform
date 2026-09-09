/**
 * SOS Shine - Quiz V2 Dimensions
 * 10 emotional dimensions scored 0-100
 */

export const DIMENSIONS = {
  1:  { name: 'Analyse mentale',      short: 'Analyse' },
  2:  { name: 'Fuite en action',      short: 'Fuite' },
  3:  { name: 'Care-taking',          short: 'Care-taking' },
  4:  { name: 'Autonomie forcée',     short: 'Autonomie' },
  5:  { name: 'Contrôle',             short: 'Contrôle' },
  6:  { name: 'Adaptation/Masking',   short: 'Adaptation' },
  7:  { name: 'Hypervigilance',       short: 'Hypervigilance' },
  8:  { name: 'Idéalisation',         short: 'Idéalisation' },
  9:  { name: 'Évitement du conflit', short: 'Évitement' },
  10: { name: 'Intensité/Drame',      short: 'Intensité' },
} as const

export type DimensionId = keyof typeof DIMENSIONS
export type DimensionScores = Record<string, number>

/**
 * SOS Shine — XP & Levels Engine V2
 * Exponential level thresholds — max Diamant = 1,000,000 XP
 * Cooperation model: the GIVER gets XP, not the receiver.
 */

// ── Level thresholds (exponential) ──
export const LEVEL_THRESHOLDS = [
  { level: 1,  name: 'Étincelle',     minXP: 0,        icon: '✨' },
  { level: 2,  name: 'Lueur',         minXP: 2500,     icon: '🌟' },
  { level: 3,  name: 'Flamme',        minXP: 10000,    icon: '🔥' },
  { level: 4,  name: 'Rayon',         minXP: 35000,    icon: '☀️' },
  { level: 5,  name: 'Éclat',         minXP: 80000,    icon: '💎' },
  { level: 6,  name: 'Lumière',       minXP: 160000,   icon: '🌈' },
  { level: 7,  name: 'Aura',          minXP: 300000,   icon: '👑' },
  { level: 8,  name: 'Prisme',        minXP: 550000,   icon: '🔮' },
  { level: 9,  name: 'Constellation', minXP: 750000,   icon: '🌌' },
  { level: 10, name: 'Diamant',       minXP: 1000000,  icon: '💠' },
] as const

export type LevelInfo = typeof LEVEL_THRESHOLDS[number]

// ── XP Rewards per action (cooperation model: giver gets XP) ──
// Daily caps are enforced by XpEngine.ts / server-side RPC
export const XP_REWARDS = {
  publish_video: 300,
  publish_audio: 300,
  publish_text: 150,
  comment: 50,
  shine_given_1: 15,
  shine_given_2: 10,
  shine_given_3: 5,
  consume_media: 25,
  consume_article: 20,
} as const

export type XPAction = keyof typeof XP_REWARDS

/**
 * Get the level info for a given XP amount
 */
export function getLevelForXP(xp: number): LevelInfo {
  let result: LevelInfo = LEVEL_THRESHOLDS[0]
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.minXP) {
      result = threshold
    } else {
      break
    }
  }
  return result
}

/**
 * Get the next level threshold (or null if max level)
 */
export function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVEL_THRESHOLDS.findIndex(t => t.level === currentLevel)
  if (idx < 0 || idx >= LEVEL_THRESHOLDS.length - 1) return null
  return LEVEL_THRESHOLDS[idx + 1]
}

/**
 * Calculate progress percentage towards next level (0-100)
 */
export function getLevelProgress(xp: number): number {
  const current = getLevelForXP(xp)
  const next = getNextLevel(current.level)
  if (!next) return 100 // Max level
  const xpInLevel = xp - current.minXP
  const xpNeeded = next.minXP - current.minXP
  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
}

/**
 * Format XP display with K/M suffixes
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return String(xp)
}

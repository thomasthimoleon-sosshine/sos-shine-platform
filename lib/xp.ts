/**
 * SOS Shine — XP & Levels Engine
 * Defines XP rewards per action, level thresholds, and helper functions.
 */

// ── XP Rewards per action ──
export const XP_REWARDS = {
  shine_given: 5,        // Donner un Shine à un post
  shine_received: 3,     // Recevoir un Shine
  post_published: 15,    // Publier sur le mur ou Mon Éclat
  comment_posted: 10,    // Poster un commentaire
  step_completed: 25,    // Compléter une étape d'un challenge encyclopédique
  challenge_completed: 100, // Compléter les 3 étapes d'un challenge
  community_challenge_completed: 150, // Compléter un défi communautaire
  event_registered: 10,  // S'inscrire à un événement
  rayon_accepted: 10,    // Connexion Rayon acceptée
  daily_login: 5,        // Connexion quotidienne (1x/jour)
} as const

export type XPAction = keyof typeof XP_REWARDS

// ── Level thresholds ──
// Each level requires progressively more XP
export const LEVEL_THRESHOLDS = [
  { level: 1,  name: 'Étincelle',    minXP: 0,     icon: '✨' },
  { level: 2,  name: 'Lueur',        minXP: 50,    icon: '🌟' },
  { level: 3,  name: 'Flamme',       minXP: 150,   icon: '🔥' },
  { level: 4,  name: 'Rayon',        minXP: 350,   icon: '☀️' },
  { level: 5,  name: 'Éclat',        minXP: 600,   icon: '💎' },
  { level: 6,  name: 'Lumière',      minXP: 1000,  icon: '🌈' },
  { level: 7,  name: 'Aura',         minXP: 1500,  icon: '👑' },
  { level: 8,  name: 'Prisme',       minXP: 2200,  icon: '🔮' },
  { level: 9,  name: 'Constellation', minXP: 3000, icon: '🌌' },
  { level: 10, name: 'Diamant',      minXP: 4000,  icon: '💠' },
] as const

export type LevelInfo = typeof LEVEL_THRESHOLDS[number]

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
 * Format XP display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return String(xp)
}

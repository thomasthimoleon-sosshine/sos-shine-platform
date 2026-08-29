/**
 * SOS Shine - Badge Service
 * Event-driven badge unlocking based on action counters and badgesConfig.json
 */

import { createClient } from '@/lib/supabase/client'
import badgesConfig from '@/data/badgesConfig.json'
import type { ShineIconName } from '@/components/icons/ShineIcon'

export type BadgeCategory = keyof typeof badgesConfig.categories
export type BadgeConfig = { id: string; threshold: number; title: string; emoji?: string }
export type CategoryConfig = {
  name: string
  description: string
  icon: string
  badges: BadgeConfig[]
}

/**
 * Get all badge categories and their configs
 */
export function getAllCategories(): Record<string, CategoryConfig> {
  return badgesConfig.categories as Record<string, CategoryConfig>
}

/**
 * Get all badges as a flat array with category info
 */
export function getAllBadgesFlat() {
  const result: Array<BadgeConfig & { category: string; categoryName: string; categoryDescription: string; categoryIcon: string }> = []
  const categories = badgesConfig.categories as Record<string, CategoryConfig>
  for (const [catKey, cat] of Object.entries(categories)) {
    for (const badge of cat.badges) {
      result.push({
        ...badge,
        category: catKey,
        categoryName: cat.name,
        categoryDescription: cat.description,
        categoryIcon: cat.icon,
      })
    }
  }
  return result
}

/**
 * Check and unlock badges for a given action type after counter increment.
 * Returns newly unlocked badge IDs.
 */
export async function checkAndUnlockBadges(
  userId: string,
  actionType: BadgeCategory,
  currentCount: number
): Promise<string[]> {
  const supabase = createClient()
  const categories = badgesConfig.categories as Record<string, CategoryConfig>
  const category = categories[actionType]
  if (!category) return []

  // Find badges that should be unlocked at or below this count
  const eligibleBadges = category.badges.filter(b => currentCount >= b.threshold)
  if (eligibleBadges.length === 0) return []

  // Get already unlocked badges
  const { data: existing } = await supabase
    .from('user_badges' as never)
    .select('badge_id')
    .eq('user_id', userId)
    .in('badge_id', eligibleBadges.map(b => b.id)) as { data: Array<{ badge_id: string }> | null }

  const existingIds = new Set((existing || []).map(e => e.badge_id))
  const newBadges = eligibleBadges.filter(b => !existingIds.has(b.id))

  if (newBadges.length === 0) return []

  // Insert new badges
  const inserts = newBadges.map(b => ({
    user_id: userId,
    badge_id: b.id,
    category: actionType,
  }))

  await supabase.from('user_badges' as never).insert(inserts as never)

  return newBadges.map(b => b.id)
}

/**
 * Get user's unlocked badge IDs
 */
export async function getUserBadges(userId: string): Promise<Array<{ badge_id: string; category: string; unlocked_at: string }>> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_badges' as never)
    .select('badge_id, category, unlocked_at')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false }) as { data: Array<{ badge_id: string; category: string; unlocked_at: string }> | null }

  return data || []
}

/**
 * Get user action counters
 */
export async function getUserActionCounters(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_action_counters' as never)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return data as {
    shines_given: number
    shines_received: number
    comments_left: number
    publications_created: number
    shares_external: number
    encyclopedia_completed: number
    media_consumed: number
    login_streak: number
  } | null
}

/**
 * Increment an action counter and check for new badges.
 * Call this every time a user performs a tracked action.
 */
export async function incrementAndCheckBadges(
  userId: string,
  actionType: BadgeCategory,
  amount: number = 1
): Promise<{ newCount: number; newBadges: string[] }> {
  const supabase = createClient()

  const { data: newCount } = await supabase.rpc('increment_action_counter' as never, {
    p_user_id: userId,
    p_action_type: actionType,
    p_amount: amount,
  } as never)

  const count = (newCount as unknown as number) || 0
  const newBadges = await checkAndUnlockBadges(userId, actionType, count)

  return { newCount: count, newBadges }
}

/**
 * Unlock ALL badges for a given user (used for founders).
 * Inserts all badges that the user hasn't already unlocked.
 * Also sets action counters to max thresholds so the profile stays consistent.
 */
export async function unlockAllBadgesForUser(userId: string): Promise<string[]> {
  const supabase = createClient()
  const categories = badgesConfig.categories as Record<string, CategoryConfig>

  // Collect every badge
  const allBadges: Array<{ badge_id: string; category: string }> = []
  for (const [catKey, cat] of Object.entries(categories)) {
    for (const badge of cat.badges) {
      allBadges.push({ badge_id: badge.id, category: catKey })
    }
  }

  // Get already unlocked badges
  const { data: existing } = await supabase
    .from('user_badges' as never)
    .select('badge_id')
    .eq('user_id', userId) as { data: Array<{ badge_id: string }> | null }

  const existingIds = new Set((existing || []).map(e => e.badge_id))
  const newBadges = allBadges.filter(b => !existingIds.has(b.badge_id))

  if (newBadges.length === 0) return []

  // Insert all missing badges
  const inserts = newBadges.map(b => ({
    user_id: userId,
    badge_id: b.badge_id,
    category: b.category,
  }))

  await supabase.from('user_badges' as never).insert(inserts as never)

  // Also set action counters to max thresholds for consistency
  const maxCounters: Record<string, number> = {}
  for (const [catKey, cat] of Object.entries(categories)) {
    const maxThreshold = Math.max(...cat.badges.map(b => b.threshold))
    maxCounters[catKey] = maxThreshold
  }

  await supabase
    .from('user_action_counters' as never)
    .upsert({
      user_id: userId,
      shines_given: maxCounters.shines_given,
      shines_received: maxCounters.shines_received,
      comments_left: maxCounters.comments_left,
      publications_created: maxCounters.publications_created,
      shares_external: maxCounters.shares_external,
      encyclopedia_completed: maxCounters.encyclopedia_completed,
      media_consumed: maxCounters.media_consumed,
      login_streak: maxCounters.login_streak,
    } as never, { onConflict: 'user_id' } as never)

  return newBadges.map(b => b.badge_id)
}

/**
 * Category icon mapping for UI rendering
 */
export const CATEGORY_ICONS: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  pen: '✍️',
  sparkles: '✨',
  share: '🔗',
  compass: '🧭',
  headphones: '🎧',
  flame: '🔥',
}

/**
 * Source unique des icônes maison par catégorie de badge (icônes ShineIcon).
 * Utilisée à la fois par le profil ET la page Badges → mêmes emblèmes partout,
 * jamais d'emoji standard qui « change » d'un écran à l'autre.
 */
export const CATEGORY_SHINE_ICON: Record<string, ShineIconName> = {
  heart: 'relationships',
  star: 'gratitude',
  pen: 'texte',
  sparkles: 'eclat',
  share: 'diffuser',
  compass: 'question',
  headphones: 'audio',
  flame: 'resilience',
}

/**
 * SOS Shine — XP Engine V2
 * Dynamic, exponential gamification with anti-farming mechanics.
 *
 * Core principles:
 * 1. Cooperation-first: the GIVER gets XP (not the receiver)
 * 2. Daily caps + diminishing returns to prevent farming
 * 3. Exponential level thresholds (max Diamant = 1,000,000 XP)
 * 4. Encyclopedia Boss Quests with dynamic XP and retake delta logic
 */

import { createClient } from '@/lib/supabase/client'

// ── Action types for daily tracking ──
export type DailyActionType =
  | 'publish_video'
  | 'publish_audio'
  | 'publish_text'
  | 'comment'
  | 'shine_given'
  | 'consume_media'
  | 'consume_article'

// ── Action config: XP rewards and daily caps ──
export const ACTION_CONFIG: Record<DailyActionType, { baseXp: number; dailyCap: number; label: string }> = {
  publish_video:   { baseXp: 300, dailyCap: 1, label: 'Publier Vidéo/Audio' },
  publish_audio:   { baseXp: 300, dailyCap: 1, label: 'Publier Audio' },
  publish_text:    { baseXp: 150, dailyCap: 2, label: 'Publier Texte' },
  comment:         { baseXp: 50,  dailyCap: 5, label: 'Commenter' },
  shine_given:     { baseXp: 15,  dailyCap: 3, label: 'Donner un Shine' },
  consume_media:   { baseXp: 25,  dailyCap: 4, label: 'Consommer Média' },
  consume_article: { baseXp: 20,  dailyCap: 2, label: 'Consommer Article' },
}

// ── Shine diminishing returns ──
const SHINE_XP_SCHEDULE = [15, 10, 5] as const

/**
 * Calculate XP for a Shine action based on how many have been given today.
 */
export function getShineXp(todayCount: number): number {
  if (todayCount >= SHINE_XP_SCHEDULE.length) return 0
  return SHINE_XP_SCHEDULE[todayCount]
}

/**
 * Calculate potential XP for an encyclopedia module (Boss Quest).
 * Formula: 1000 + (number_of_steps * 200)
 */
export function getEncyclopediaPotentialXp(totalSteps: number): number {
  return 1000 + (totalSteps * 200)
}

/**
 * Calculate earned XP based on quiz score percentage.
 */
export function getEncyclopediaEarnedXp(totalSteps: number, scorePercentage: number): number {
  const potential = getEncyclopediaPotentialXp(totalSteps)
  return Math.round((potential * scorePercentage) / 100)
}

/**
 * Calculate remaining XP that can be unlocked by improving the quiz score.
 */
export function getEncyclopediaRemainingXp(totalSteps: number, scorePercentage: number): number {
  const potential = getEncyclopediaPotentialXp(totalSteps)
  const earned = getEncyclopediaEarnedXp(totalSteps, scorePercentage)
  return potential - earned
}

// ── Main XP Engine ──

/**
 * Award XP for an action, respecting daily caps and diminishing returns.
 * This is the GIVER who gets rewarded (cooperation model).
 *
 * @returns { awarded: boolean, xp: number, dailyCount: number, message: string }
 */
export async function awardActionXp(
  userId: string,
  actionType: DailyActionType
): Promise<{ awarded: boolean; xp: number; dailyCount: number; message: string }> {
  const supabase = createClient()

  // Call the server-side function that handles caps atomically
  const { data, error } = await supabase.rpc('check_and_increment_daily_action', {
    p_user_id: userId,
    p_action_type: actionType,
  })

  if (error) {
    console.error('XpEngine: check_and_increment_daily_action error', error)
    return { awarded: false, xp: 0, dailyCount: 0, message: 'Erreur lors de la vérification.' }
  }

  const result = data as { allowed: boolean; count: number; xp_to_award: number }

  if (!result.allowed) {
    const config = ACTION_CONFIG[actionType]
    return {
      awarded: false,
      xp: 0,
      dailyCount: result.count,
      message: `Limite atteinte : ${config.dailyCap}/${config.dailyCap} ${config.label} aujourd'hui.`,
    }
  }

  // Award the XP
  if (result.xp_to_award > 0) {
    await supabase.rpc('add_xp', {
      p_user_id: userId,
      p_amount: result.xp_to_award,
      p_reason: actionType,
    })
  }

  return {
    awarded: true,
    xp: result.xp_to_award,
    dailyCount: result.count,
    message: `+${result.xp_to_award} XP`,
  }
}

/**
 * Award encyclopedia Boss Quest XP with delta/retake logic.
 * If user retakes quiz and improves, only the delta is awarded.
 *
 * @returns Result from the server-side function
 */
export async function awardEncyclopediaXp(
  userId: string,
  moduleId: string,
  scorePercentage: number,
  totalSteps: number
): Promise<{
  potentialXp: number
  xpEarned: number
  xpDeltaAwarded: number
  previousScore: number
  newScore: number
  xpRemaining: number
}> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('award_encyclopedia_xp', {
    p_user_id: userId,
    p_module_id: moduleId,
    p_score_percentage: scorePercentage,
    p_total_steps: totalSteps,
  })

  if (error) {
    console.error('XpEngine: award_encyclopedia_xp error', error)
    return {
      potentialXp: getEncyclopediaPotentialXp(totalSteps),
      xpEarned: 0,
      xpDeltaAwarded: 0,
      previousScore: 0,
      newScore: scorePercentage,
      xpRemaining: getEncyclopediaPotentialXp(totalSteps),
    }
  }

  const result = data as {
    potential_xp: number
    xp_earned: number
    xp_delta_awarded: number
    previous_score: number
    new_score: number
    xp_remaining: number
  }

  return {
    potentialXp: result.potential_xp,
    xpEarned: result.xp_earned,
    xpDeltaAwarded: result.xp_delta_awarded,
    previousScore: result.previous_score,
    newScore: result.new_score,
    xpRemaining: result.xp_remaining,
  }
}

/**
 * Get the current daily action counts for a user (for UI display).
 */
export async function getDailyActionCounts(userId: string): Promise<Record<string, number>> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_user_actions')
    .select('action_type, count')
    .eq('user_id', userId)
    .eq('action_date', today)

  const counts: Record<string, number> = {}
  if (data) {
    for (const row of data) {
      counts[row.action_type] = row.count
    }
  }
  return counts
}

/**
 * Get encyclopedia progress for a specific module.
 */
export async function getEncyclopediaProgress(userId: string, moduleId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('encyclopedia_progress')
    .select('best_score_percentage, xp_awarded')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle()

  return data as { best_score_percentage: number; xp_awarded: number } | null
}

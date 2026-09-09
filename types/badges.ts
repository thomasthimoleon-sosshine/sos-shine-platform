// ── User Badges ──
export type UserBadge = {
  id: string
  user_id: string
  badge_id: string
  category: string
  unlocked_at: string
}

// ── User Action Counters ──
export type UserActionCounters = {
  id: string
  user_id: string
  shines_given: number
  shines_received: number
  comments_left: number
  publications_created: number
  shares_external: number
  encyclopedia_completed: number
  media_consumed: number
  login_streak: number
  last_login_date: string | null
  updated_at: string
}

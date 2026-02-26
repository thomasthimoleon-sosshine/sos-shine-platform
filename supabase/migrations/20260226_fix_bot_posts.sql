-- ══════════════════════════════════════════════════════════════
-- Migration: Fix bot posts — change post_type from 'general' to 'community'
-- This fixes bot posts not showing community category badges on the wall
-- ══════════════════════════════════════════════════════════════

-- Update all bot-created posts from 'general' to 'community'
-- Bot posts are identified by their author being a bot profile (is_bot = true)
UPDATE public.posts
SET
  post_type = 'community',
  category = CASE
    WHEN category IS NULL OR category = '' THEN 'partage'
    ELSE category
  END,
  media_type = COALESCE(media_type, 'text')
WHERE author_id IN (
  SELECT id FROM public.profiles WHERE is_bot = true
)
AND post_type = 'general';

-- ══════════════════════════════════════════════════════════════
-- Migration: Add publish_banned_until to profiles for moderation
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publish_banned_until TIMESTAMPTZ DEFAULT NULL;

-- Allow admins to delete any comment (moderation)
CREATE POLICY "Admins can delete any comment" ON public.post_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content', 'admin_support')
    )
  );

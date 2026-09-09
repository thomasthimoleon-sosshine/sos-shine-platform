-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Badges System: user_badges + user_action_counters
-- COPIER ET EXECUTER DANS SUPABASE SQL EDITOR
-- ══════════════════════════════════════════════════════════════

-- ── 1. user_badges — Badges débloqués par l'utilisateur ──
CREATE TABLE IF NOT EXISTS public.user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,
  category    TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);

-- ── 2. user_action_counters — Compteurs globaux par catégorie ──
CREATE TABLE IF NOT EXISTS public.user_action_counters (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  shines_given            INTEGER NOT NULL DEFAULT 0,
  shines_received         INTEGER NOT NULL DEFAULT 0,
  comments_left           INTEGER NOT NULL DEFAULT 0,
  publications_created    INTEGER NOT NULL DEFAULT 0,
  shares_external         INTEGER NOT NULL DEFAULT 0,
  encyclopedia_completed  INTEGER NOT NULL DEFAULT 0,
  media_consumed          INTEGER NOT NULL DEFAULT 0,
  login_streak            INTEGER NOT NULL DEFAULT 0,
  last_login_date         DATE,
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_action_counters_user ON public.user_action_counters(user_id);

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_action_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view badges" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can view own counters" ON public.user_action_counters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own counters" ON public.user_action_counters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own counters" ON public.user_action_counters
  FOR UPDATE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- FUNCTION: increment_action_counter
-- Incrémente un compteur et retourne la nouvelle valeur
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_action_counter(
  p_user_id UUID,
  p_action_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  INSERT INTO public.user_action_counters (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  EXECUTE format(
    'UPDATE public.user_action_counters SET %I = %I + $1, updated_at = now() WHERE user_id = $2 RETURNING %I',
    p_action_type, p_action_type, p_action_type
  ) INTO v_new_count USING p_amount, p_user_id;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

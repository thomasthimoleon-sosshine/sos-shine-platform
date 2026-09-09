-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Gamification V2: Exponential XP, Anti-Farming, Boss Quests
-- COPIER ET EXECUTER DANS SUPABASE SQL EDITOR
-- ══════════════════════════════════════════════════════════════

-- ── 1. daily_user_actions — Tracking quotidien anti-farming ──
CREATE TABLE IF NOT EXISTS public.daily_user_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_type TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, action_date, action_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_actions_user_date ON public.daily_user_actions(user_id, action_date);
CREATE INDEX IF NOT EXISTS idx_daily_actions_type ON public.daily_user_actions(action_type);

-- ── 2. encyclopedia_progress — Boss Quests score tracking ──
CREATE TABLE IF NOT EXISTS public.encyclopedia_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id             UUID NOT NULL REFERENCES public.douleurs(id) ON DELETE CASCADE,
  best_score_percentage INTEGER NOT NULL DEFAULT 0,
  xp_awarded            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_encyclopedia_progress_user ON public.encyclopedia_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_encyclopedia_progress_module ON public.encyclopedia_progress(module_id);

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.daily_user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encyclopedia_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily actions" ON public.daily_user_actions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily actions" ON public.daily_user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily actions" ON public.daily_user_actions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all daily actions" ON public.daily_user_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Users can view own encyclopedia progress" ON public.encyclopedia_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own encyclopedia progress" ON public.encyclopedia_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own encyclopedia progress" ON public.encyclopedia_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all encyclopedia progress" ON public.encyclopedia_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- ══════════════════════════════════════════════════════════════
-- FUNCTION: Updated add_xp — Nouveaux paliers exponentiels
-- Étincelle(0), Lueur(2500), Flamme(10000), Rayon(35000),
-- Éclat(80000), Lumière(160000), Aura(300000), Prisme(550000),
-- Constellation(750000), Diamant(1000000)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.add_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT DEFAULT 'other')
RETURNS JSONB AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
BEGIN
  SELECT level INTO v_old_level FROM public.user_xp WHERE user_id = p_user_id;

  INSERT INTO public.user_xp (user_id, total_xp, level, shines_given, shines_received)
  VALUES (
    p_user_id, p_amount, 1,
    CASE WHEN p_reason = 'shine_given' THEN 1 ELSE 0 END,
    CASE WHEN p_reason = 'shine_received' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_xp.total_xp + p_amount,
    shines_given = user_xp.shines_given + CASE WHEN p_reason = 'shine_given' THEN 1 ELSE 0 END,
    shines_received = user_xp.shines_received + CASE WHEN p_reason = 'shine_received' THEN 1 ELSE 0 END,
    updated_at = now()
  RETURNING total_xp INTO v_new_xp;

  v_new_level := CASE
    WHEN v_new_xp >= 1000000 THEN 10
    WHEN v_new_xp >= 750000  THEN 9
    WHEN v_new_xp >= 550000  THEN 8
    WHEN v_new_xp >= 300000  THEN 7
    WHEN v_new_xp >= 160000  THEN 6
    WHEN v_new_xp >= 80000   THEN 5
    WHEN v_new_xp >= 35000   THEN 4
    WHEN v_new_xp >= 10000   THEN 3
    WHEN v_new_xp >= 2500    THEN 2
    ELSE 1
  END;

  IF v_new_level IS DISTINCT FROM v_old_level THEN
    UPDATE public.user_xp SET level = v_new_level WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'total_xp', v_new_xp,
    'level', v_new_level,
    'level_up', v_old_level IS NOT NULL AND v_new_level > v_old_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════
-- FUNCTION: Anti-farming — vérification et incrémentation quotidienne
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_and_increment_daily_action(
  p_user_id UUID,
  p_action_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_current_count INTEGER;
  v_cap INTEGER;
  v_xp INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT count INTO v_current_count
  FROM public.daily_user_actions
  WHERE user_id = p_user_id AND action_date = v_today AND action_type = p_action_type;

  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;

  CASE p_action_type
    WHEN 'publish_video' THEN v_cap := 1; v_xp := 300;
    WHEN 'publish_audio' THEN v_cap := 1; v_xp := 300;
    WHEN 'publish_text' THEN v_cap := 2; v_xp := 150;
    WHEN 'comment' THEN v_cap := 5; v_xp := 50;
    WHEN 'shine_given' THEN
      v_cap := 3;
      v_xp := CASE
        WHEN v_current_count = 0 THEN 15
        WHEN v_current_count = 1 THEN 10
        WHEN v_current_count = 2 THEN 5
        ELSE 0
      END;
    WHEN 'consume_media' THEN v_cap := 4; v_xp := 25;
    WHEN 'consume_article' THEN v_cap := 2; v_xp := 20;
    ELSE v_cap := 0; v_xp := 0;
  END CASE;

  IF v_current_count >= v_cap THEN
    RETURN jsonb_build_object('allowed', false, 'count', v_current_count, 'xp_to_award', 0);
  END IF;

  INSERT INTO public.daily_user_actions (user_id, action_date, action_type, count)
  VALUES (p_user_id, v_today, p_action_type, 1)
  ON CONFLICT (user_id, action_date, action_type) DO UPDATE SET
    count = daily_user_actions.count + 1,
    updated_at = now();

  RETURN jsonb_build_object('allowed', true, 'count', v_current_count + 1, 'xp_to_award', v_xp);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════
-- FUNCTION: Boss Quest — XP encyclopédie avec logique de rattrapage
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.award_encyclopedia_xp(
  p_user_id UUID,
  p_module_id UUID,
  p_score_percentage INTEGER,
  p_total_steps INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_potential_xp INTEGER;
  v_new_xp INTEGER;
  v_old_xp INTEGER;
  v_delta INTEGER;
  v_old_score INTEGER;
BEGIN
  v_potential_xp := 1000 + (p_total_steps * 200);
  v_new_xp := (v_potential_xp * p_score_percentage) / 100;

  SELECT best_score_percentage, xp_awarded INTO v_old_score, v_old_xp
  FROM public.encyclopedia_progress
  WHERE user_id = p_user_id AND module_id = p_module_id;

  IF v_old_score IS NULL THEN
    v_delta := v_new_xp;
    INSERT INTO public.encyclopedia_progress (user_id, module_id, best_score_percentage, xp_awarded)
    VALUES (p_user_id, p_module_id, p_score_percentage, v_new_xp);
  ELSIF p_score_percentage > v_old_score THEN
    v_delta := v_new_xp - v_old_xp;
    UPDATE public.encyclopedia_progress
    SET best_score_percentage = p_score_percentage,
        xp_awarded = v_new_xp,
        updated_at = now()
    WHERE user_id = p_user_id AND module_id = p_module_id;
  ELSE
    v_delta := 0;
  END IF;

  IF v_delta > 0 THEN
    PERFORM public.add_xp(p_user_id, v_delta, 'encyclopedia_quiz');
  END IF;

  RETURN jsonb_build_object(
    'potential_xp', v_potential_xp,
    'xp_earned', v_new_xp,
    'xp_delta_awarded', v_delta,
    'previous_score', COALESCE(v_old_score, 0),
    'new_score', p_score_percentage,
    'xp_remaining', v_potential_xp - v_new_xp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

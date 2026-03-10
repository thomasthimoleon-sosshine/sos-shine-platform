-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Gamification System Migration
-- Tables: user_progress, user_xp, challenges, challenge_participations, pinned_posts
-- ══════════════════════════════════════════════════════════════

-- ── 1. USER_PROGRESS — Tracking progression encyclopédique ──
CREATE TABLE IF NOT EXISTS public.user_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  douleur_id      UUID NOT NULL REFERENCES public.douleurs(id) ON DELETE CASCADE,
  step1_completed BOOLEAN DEFAULT false,
  step2_completed BOOLEAN DEFAULT false,
  step3_completed BOOLEAN DEFAULT false,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, douleur_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_douleur ON public.user_progress(douleur_id);

-- ── 2. USER_XP — Points d'expérience et niveaux ──
CREATE TABLE IF NOT EXISTS public.user_xp (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp        INTEGER DEFAULT 0,
  level           INTEGER DEFAULT 1,
  shines_given    INTEGER DEFAULT 0,
  shines_received INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_xp_user ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_level ON public.user_xp(level DESC);

-- ── 3. CHALLENGES — Défis communautaires ──
CREATE TABLE IF NOT EXISTS public.challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  reward_type     TEXT DEFAULT 'xp' CHECK (reward_type IN ('xp', 'video', 'call', 'badge')),
  reward_value    INTEGER DEFAULT 100,
  reward_detail   TEXT,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  max_participants INTEGER,
  created_by      UUID REFERENCES public.profiles(id),
  winner_id       UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);

-- ── 4. CHALLENGE_PARTICIPATIONS — Inscriptions et complétion ──
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'abandoned')),
  progress        INTEGER DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_parts_challenge ON public.challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_parts_user ON public.challenge_participations(user_id);

-- ── 5. PINNED_POSTS — Posts épinglés (annonces de vainqueurs) ──
CREATE TABLE IF NOT EXISTS public.pinned_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  challenge_id    UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  pinned_by       UUID REFERENCES public.profiles(id),
  pin_type        TEXT DEFAULT 'winner' CHECK (pin_type IN ('winner', 'announcement', 'highlight')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pinned_posts_active ON public.pinned_posts(expires_at);

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_posts ENABLE ROW LEVEL SECURITY;

-- user_progress: users can read/write their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all progress
CREATE POLICY "Admins can view all progress" ON public.user_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- user_xp: everyone can see XP (public leaderboard), users update their own
CREATE POLICY "Everyone can view XP" ON public.user_xp
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own XP" ON public.user_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own XP" ON public.user_xp
  FOR UPDATE USING (auth.uid() = user_id);

-- challenges: everyone can see active challenges, admins can CRUD
CREATE POLICY "Everyone can view active challenges" ON public.challenges
  FOR SELECT USING (status IN ('active', 'completed') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins can insert challenges" ON public.challenges
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins can update challenges" ON public.challenges
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins can delete challenges" ON public.challenges
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- challenge_participations: users can manage their own, admins can see all
CREATE POLICY "Users can view own participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Users can insert own participation" ON public.challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON public.challenge_participations
  FOR UPDATE USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- pinned_posts: everyone can see pinned posts, admins can manage
CREATE POLICY "Everyone can view pinned posts" ON public.pinned_posts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pinned posts" ON public.pinned_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- ══════════════════════════════════════════════════════════════
-- FUNCTION: Add XP to a user (called from client via RPC)
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
    p_user_id,
    p_amount,
    1,
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
    WHEN v_new_xp >= 4000 THEN 10
    WHEN v_new_xp >= 3000 THEN 9
    WHEN v_new_xp >= 2200 THEN 8
    WHEN v_new_xp >= 1500 THEN 7
    WHEN v_new_xp >= 1000 THEN 6
    WHEN v_new_xp >= 600 THEN 5
    WHEN v_new_xp >= 350 THEN 4
    WHEN v_new_xp >= 150 THEN 3
    WHEN v_new_xp >= 50 THEN 2
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
-- FUNCTION: Auto-initialize user_xp on profile creation
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.init_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level, shines_given, shines_received)
  VALUES (NEW.id, 0, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_user_xp ON public.profiles;
CREATE TRIGGER trg_init_user_xp
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.init_user_xp();

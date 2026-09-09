-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Challenge Phases — Phases dynamiques pour les défis       ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── 1. TABLE challenge_phases ──
CREATE TABLE IF NOT EXISTS public.challenge_phases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  phase_number    INTEGER NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  duration_days   INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, phase_number)
);

CREATE INDEX IF NOT EXISTS idx_challenge_phases_challenge ON public.challenge_phases(challenge_id);

-- ── 2. TABLE challenge_phase_progress — Progression par phase ──
CREATE TABLE IF NOT EXISTS public.challenge_phase_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID NOT NULL REFERENCES public.challenge_participations(id) ON DELETE CASCADE,
  phase_id        UUID NOT NULL REFERENCES public.challenge_phases(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(participation_id, phase_id)
);

CREATE INDEX IF NOT EXISTS idx_phase_progress_participation ON public.challenge_phase_progress(participation_id);

-- ── 3. RLS ──
ALTER TABLE public.challenge_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_phase_progress ENABLE ROW LEVEL SECURITY;

-- challenge_phases: everyone can see phases of visible challenges
CREATE POLICY "Everyone can view challenge phases" ON public.challenge_phases
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert challenge phases" ON public.challenge_phases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins can update challenge phases" ON public.challenge_phases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Admins can delete challenge phases" ON public.challenge_phases
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

-- challenge_phase_progress: users can manage their own
CREATE POLICY "Users can view own phase progress" ON public.challenge_phase_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.challenge_participations WHERE id = participation_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "Users can insert own phase progress" ON public.challenge_phase_progress
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.challenge_participations WHERE id = participation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own phase progress" ON public.challenge_phase_progress
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.challenge_participations WHERE id = participation_id AND user_id = auth.uid())
  );

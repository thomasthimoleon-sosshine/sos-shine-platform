-- ═══════════════════════════════════════════════════════════════
-- QUIZ V2 — Migrations SQL
-- 4 nouvelles tables + colonne quiz_version sur signature_leads
-- ═══════════════════════════════════════════════════════════════

-- 1. Add quiz_version to existing signature_leads
ALTER TABLE public.signature_leads
  ADD COLUMN IF NOT EXISTS quiz_version TEXT DEFAULT 'v1';

-- 2. Main quiz responses table
CREATE TABLE IF NOT EXISTS public.quiz_v2_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  email_captured_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  current_question INT DEFAULT 1,
  responses JSONB NOT NULL DEFAULT '{}',
  scores JSONB,
  dominant_dimension TEXT,
  secondary_dimension TEXT,
  q15_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_v2_email ON public.quiz_v2_responses(email);
CREATE INDEX IF NOT EXISTS idx_quiz_v2_session ON public.quiz_v2_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_v2_completed ON public.quiz_v2_responses(completed_at);

-- RLS
ALTER TABLE public.quiz_v2_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_v2_responses_insert_anon" ON public.quiz_v2_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "quiz_v2_responses_update_own" ON public.quiz_v2_responses
  FOR UPDATE USING (session_id = session_id);

CREATE POLICY "quiz_v2_responses_select_own" ON public.quiz_v2_responses
  FOR SELECT USING (
    session_id = session_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support'))
  );

CREATE POLICY "quiz_v2_responses_admin" ON public.quiz_v2_responses
  FOR ALL USING (public.is_admin());

-- 3. Protocols table
CREATE TABLE IF NOT EXISTS public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('available', 'coming_soon')),
  release_date DATE,
  dimension_weights JSONB NOT NULL,
  duration_days INT DEFAULT 21,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "protocols_select_all" ON public.protocols
  FOR SELECT USING (true);

CREATE POLICY "protocols_admin" ON public.protocols
  FOR ALL USING (public.is_admin());

-- 4. Protocol notifications
CREATE TABLE IF NOT EXISTS public.protocol_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  quiz_response_id UUID REFERENCES public.quiz_v2_responses(id),
  protocol_id UUID REFERENCES public.protocols(id),
  match_score INT,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, protocol_id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_email ON public.protocol_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_notified ON public.protocol_notifications(notified_at);

ALTER TABLE public.protocol_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.protocol_notifications
  FOR SELECT USING (
    LOWER(user_email) = LOWER(auth.jwt() ->> 'email')
    OR public.is_admin()
  );

CREATE POLICY "notifications_insert_anon" ON public.protocol_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_admin" ON public.protocol_notifications
  FOR ALL USING (public.is_admin());

-- 5. Quiz events tracking
CREATE TABLE IF NOT EXISTS public.quiz_v2_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  quiz_response_id UUID REFERENCES public.quiz_v2_responses(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session ON public.quiz_v2_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.quiz_v2_events(event_type);

ALTER TABLE public.quiz_v2_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_insert_anon" ON public.quiz_v2_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "events_select_admin" ON public.quiz_v2_events
  FOR SELECT USING (public.is_admin());

-- 6. Newsletter weekly subscribers (for post-sequence transition)
CREATE TABLE IF NOT EXISTS public.newsletter_weekly_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  source TEXT DEFAULT 'quiz_v2_sequence',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_weekly_subscribers(email);

ALTER TABLE public.newsletter_weekly_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_insert_anon" ON public.newsletter_weekly_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter_admin" ON public.newsletter_weekly_subscribers
  FOR ALL USING (public.is_admin());

-- 7. Seed the 7 available protocols
INSERT INTO public.protocols (title, slug, status, dimension_weights, duration_days) VALUES
  ('Amour propre', 'amour-propre', 'available',
   '{"4": 40, "6": 30, "9": 30}'::jsonb, 21),
  ('Dépendance affective', 'dependance-affective', 'available',
   '{"3": 30, "6": 25, "9": 20, "10": 25}'::jsonb, 21),
  ('Burnout', 'burnout', 'available',
   '{"2": 30, "3": 25, "4": 25, "5": 20}'::jsonb, 21),
  ('Deuil', 'deuil', 'available',
   '{"1": 25, "7": 25, "8": 25, "10": 25}'::jsonb, 21),
  ('Rupture & séparation', 'rupture-separation', 'available',
   '{"6": 25, "8": 25, "9": 25, "10": 25}'::jsonb, 21),
  ('Confiance en soi', 'confiance-en-soi', 'available',
   '{"1": 25, "4": 25, "6": 25, "8": 25}'::jsonb, 21),
  ('Abus & violences', 'abus-violences', 'available',
   '{"4": 35, "7": 35, "9": 30}'::jsonb, 21)
ON CONFLICT (slug) DO UPDATE SET
  dimension_weights = EXCLUDED.dimension_weights,
  status = EXCLUDED.status;

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';

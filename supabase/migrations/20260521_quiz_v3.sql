-- Quiz V3 — Réponses et résultats
CREATE TABLE IF NOT EXISTS public.quiz_v3_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  birthdate TEXT,
  answers JSONB NOT NULL DEFAULT '{}',
  profile JSONB,
  result_text TEXT,
  top_protocol_title TEXT,
  top_protocol_slug TEXT,
  completed_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_v3_email ON public.quiz_v3_responses(email);
CREATE INDEX IF NOT EXISTS idx_quiz_v3_session ON public.quiz_v3_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_v3_completed ON public.quiz_v3_responses(completed_at);

ALTER TABLE public.quiz_v3_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_v3_insert_anon" ON public.quiz_v3_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "quiz_v3_update_session" ON public.quiz_v3_responses
  FOR UPDATE USING (true);

CREATE POLICY "quiz_v3_select_admin" ON public.quiz_v3_responses
  FOR SELECT USING (public.is_admin());

NOTIFY pgrst, 'reload schema';

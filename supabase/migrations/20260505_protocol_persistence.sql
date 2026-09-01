-- Persist top protocol slug on each quiz response
ALTER TABLE public.quiz_v2_responses
  ADD COLUMN IF NOT EXISTS top_protocol_slug TEXT;

-- Cross-device protocol progress (step + completion state per user+protocol)
CREATE TABLE IF NOT EXISTS public.user_protocol_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_slug TEXT NOT NULL,
  step INT NOT NULL DEFAULT 1,
  all_done BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, protocol_slug)
);

ALTER TABLE public.user_protocol_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON public.user_protocol_progress
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

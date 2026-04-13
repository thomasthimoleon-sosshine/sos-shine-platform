-- NPS & Feedback table
CREATE TABLE IF NOT EXISTS nps_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score        INT NOT NULL CHECK (score >= 0 AND score <= 10),
  comment      TEXT,
  context      TEXT DEFAULT 'dashboard',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nps_responses_user ON nps_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_created ON nps_responses(created_at);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nps_responses_insert_own" ON nps_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nps_responses_select_own" ON nps_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nps_responses_admin_select" ON nps_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'admin_content', 'admin_support')
    )
  );

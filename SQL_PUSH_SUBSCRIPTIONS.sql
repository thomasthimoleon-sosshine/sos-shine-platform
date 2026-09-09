-- ══════════════════════════════════════════════
-- Push Subscriptions (Web Push / VAPID)
-- ══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON push_subscriptions(is_active);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Utilisateurs peuvent gérer leurs propres abonnements
CREATE POLICY "push_subscriptions_own" ON push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins peuvent lire tous les abonnements (pour envoyer des notifs)
CREATE POLICY "push_subscriptions_admin_read" ON push_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

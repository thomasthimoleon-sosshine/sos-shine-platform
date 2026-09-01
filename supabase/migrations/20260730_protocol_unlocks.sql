-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Déblocage d'un protocole seul (accès unique 33€)
-- Un utilisateur inscrit (non abonné) peut acheter UN protocole.
-- Cette table mémorise quel protocole chaque utilisateur a débloqué.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS protocol_unlocks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_slug     text NOT NULL,
  stripe_session_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, protocol_slug)
);

CREATE INDEX IF NOT EXISTS idx_protocol_unlocks_user ON protocol_unlocks(user_id);

ALTER TABLE protocol_unlocks ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur peut lire ses propres déblocages (pour le gating côté client).
DROP POLICY IF EXISTS "protocol_unlocks_select_own" ON protocol_unlocks;
CREATE POLICY "protocol_unlocks_select_own" ON protocol_unlocks
  FOR SELECT USING (auth.uid() = user_id);

-- Les écritures se font uniquement côté serveur (service role via webhook Stripe),
-- qui contourne la RLS : aucune policy INSERT publique n'est nécessaire.

NOTIFY pgrst, 'reload schema';

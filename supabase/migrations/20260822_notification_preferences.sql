-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Préférences de notifications par membre
--
-- Jusqu'ici, un membre pouvait uniquement tout accepter ou tout refuser,
-- au niveau du navigateur. Il n'y avait aucun réglage dans la plateforme :
-- quelqu'un qui voulait être prévenu des nouveaux protocoles mais pas des
-- messages devait couper les notifications entièrement.
--
-- Une ligne par membre, créée à la première ouverture de la page.
-- Tout est activé par défaut : on n'ouvre pas un compte en étant sourd.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Interrupteur général : à false, plus rien n'est envoyé, quels que soient
  -- les réglages fins ci-dessous (qui restent mémorisés).
  all_enabled      boolean NOT NULL DEFAULT true,

  -- Encyclopédie
  new_protocols    boolean NOT NULL DEFAULT true,  -- nouveaux protocoles
  new_media        boolean NOT NULL DEFAULT true,  -- vidéos, formats courts, audios, lectures

  -- Communauté
  shines_received  boolean NOT NULL DEFAULT true,  -- « j'aime » reçus
  messages         boolean NOT NULL DEFAULT true,  -- messages privés
  friend_requests  boolean NOT NULL DEFAULT true,  -- demandes de proches
  comments         boolean NOT NULL DEFAULT true,  -- réponses à mes publications

  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Chacun ne voit et ne règle que ses propres préférences.
DROP POLICY IF EXISTS "notification_preferences_select_own" ON notification_preferences;
CREATE POLICY "notification_preferences_select_own" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_insert_own" ON notification_preferences;
CREATE POLICY "notification_preferences_insert_own" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_update_own" ON notification_preferences;
CREATE POLICY "notification_preferences_update_own" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

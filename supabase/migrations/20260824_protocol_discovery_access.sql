-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Accès découverte offert avec l'achat d'un protocole (33€)
-- Acheter un protocole seul ouvre toute la plateforme pendant 30 jours.
-- Passé ce délai, l'utilisateur ne conserve que le protocole acheté.
-- ═══════════════════════════════════════════════════════════════

-- Fin de la fenêtre de découverte. NULL = aucun accès offert
-- (déblocages antérieurs à cette offre : ils gardent leur protocole, sans plus).
ALTER TABLE protocol_unlocks
  ADD COLUMN IF NOT EXISTS discovery_until timestamptz;

-- Le gating interroge « cet utilisateur a-t-il une fenêtre encore ouverte ? »
CREATE INDEX IF NOT EXISTS idx_protocol_unlocks_discovery
  ON protocol_unlocks(user_id, discovery_until);

COMMENT ON COLUMN protocol_unlocks.discovery_until IS
  'Fin de l''accès découverte offert à l''achat (30 jours). NULL = pas d''accès offert. Après cette date, seul le protocole acheté reste accessible.';

NOTIFY pgrst, 'reload schema';

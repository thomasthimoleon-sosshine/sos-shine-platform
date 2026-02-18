-- ══════════════════════════════════════════════════════════
-- Ajout de call_type / event_type pour les appels audio
-- Compatible avec des tables existantes ou nouvelles
-- ══════════════════════════════════════════════════════════

-- ── signaling_rooms : distinguer appel audio vs vidéo ──
ALTER TABLE signaling_rooms
  ADD COLUMN IF NOT EXISTS call_type TEXT NOT NULL DEFAULT 'video';

-- Ajout de la contrainte CHECK (si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'signaling_rooms_call_type_check'
  ) THEN
    ALTER TABLE signaling_rooms
      ADD CONSTRAINT signaling_rooms_call_type_check
      CHECK (call_type IN ('audio', 'video'));
  END IF;
END $$;

-- ── group_events : distinguer conférence audio vs vidéo ──
ALTER TABLE group_events
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'video';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'group_events_event_type_check'
  ) THEN
    ALTER TABLE group_events
      ADD CONSTRAINT group_events_event_type_check
      CHECK (event_type IN ('audio', 'video'));
  END IF;
END $$;

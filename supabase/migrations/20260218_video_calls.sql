-- ══════════════════════════════════════════════════════════
-- V2 : WebRTC natif — Signaling via Supabase Realtime
-- Remplace l'ancien système Jitsi (active_calls + jitsi_room_id)
-- ══════════════════════════════════════════════════════════

-- ── Nettoyage ──
DROP TABLE IF EXISTS active_calls CASCADE;

-- ══════════════════════════════════════════════════════════
-- Table : signaling_rooms
-- Représente une salle de visio (1-to-1 ou groupe).
-- Le signaling SDP/ICE transite par Supabase Realtime Broadcast
-- sur le canal "room:<room_id>".
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS signaling_rooms (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code       TEXT NOT NULL UNIQUE
                    DEFAULT ('room-' || substr(gen_random_uuid()::text, 1, 12)),
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_type       TEXT NOT NULL DEFAULT 'one_to_one'
                    CHECK (room_type IN ('one_to_one', 'group')),
  call_type       TEXT NOT NULL DEFAULT 'video'
                    CHECK (call_type IN ('audio', 'video')),
  -- Pour les appels 1-to-1 : destinataire de l'appel
  target_user_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'waiting'
                    CHECK (status IN ('waiting', 'active', 'ended', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sr_created_by ON signaling_rooms(created_by);
CREATE INDEX idx_sr_target     ON signaling_rooms(target_user_id)
  WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_sr_status     ON signaling_rooms(status)
  WHERE status IN ('waiting', 'active');

-- RLS
ALTER TABLE signaling_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms they participate in"
ON signaling_rooms FOR SELECT TO authenticated
USING (
  auth.uid() = created_by
  OR auth.uid() = target_user_id
  OR room_type = 'group'
);

CREATE POLICY "Users can create rooms"
ON signaling_rooms FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update rooms"
ON signaling_rooms FOR UPDATE TO authenticated
USING (auth.uid() = created_by OR auth.uid() = target_user_id)
WITH CHECK (auth.uid() = created_by OR auth.uid() = target_user_id);

CREATE POLICY "Creator can delete rooms"
ON signaling_rooms FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- ══════════════════════════════════════════════════════════
-- Table : group_events (visio de groupe / webinaires)
-- Mise à jour : remplace jitsi_room_id par room_id FK
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS group_events (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL CHECK (char_length(title) <= 200),
  description      TEXT DEFAULT NULL,
  event_type       TEXT NOT NULL DEFAULT 'video'
                     CHECK (event_type IN ('audio', 'video')),
  start_time       TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled', 'live', 'ended', 'canceled')),
  room_id          UUID REFERENCES signaling_rooms(id) ON DELETE SET NULL,
  max_participants INTEGER DEFAULT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_group_events_host   ON group_events(host_id);
CREATE INDEX idx_group_events_status ON group_events(status, start_time);

-- RLS
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view group events"
ON group_events FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Hosts can create group events"
ON group_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their events"
ON group_events FOR UPDATE TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their events"
ON group_events FOR DELETE TO authenticated
USING (auth.uid() = host_id);

-- ══════════════════════════════════════════════════════════
-- Realtime : activer sur signaling_rooms pour les notifications
-- d'appels entrants (INSERT/UPDATE détectés côté client)
-- ══════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE signaling_rooms;

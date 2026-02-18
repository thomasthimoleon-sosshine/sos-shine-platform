-- ══════════════════════════════════════════════════════
-- Visioconférence : active_calls + group_events
-- ══════════════════════════════════════════════════════

-- ── Table : active_calls (appels 1-to-1) ──
CREATE TABLE IF NOT EXISTS active_calls (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'ringing'
                   CHECK (status IN ('ringing', 'accepted', 'rejected', 'ended')),
  jitsi_room_id  TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_calls_caller   ON active_calls(caller_id, created_at DESC);
CREATE INDEX idx_calls_receiver ON active_calls(receiver_id, created_at DESC);
CREATE INDEX idx_calls_status   ON active_calls(status) WHERE status IN ('ringing', 'accepted');

-- RLS
ALTER TABLE active_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own calls"
ON active_calls FOR SELECT TO authenticated
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can initiate calls"
ON active_calls FOR INSERT TO authenticated
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Participants can update call status"
ON active_calls FOR UPDATE TO authenticated
USING (auth.uid() = caller_id OR auth.uid() = receiver_id)
WITH CHECK (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Caller can delete call"
ON active_calls FOR DELETE TO authenticated
USING (auth.uid() = caller_id);

-- ── Table : group_events (visio de groupe / webinaires) ──
CREATE TABLE IF NOT EXISTS group_events (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL CHECK (char_length(title) <= 200),
  description    TEXT DEFAULT NULL,
  start_time     TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled', 'live', 'ended', 'canceled')),
  jitsi_room_id  TEXT NOT NULL,
  max_participants INTEGER DEFAULT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
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

-- ══════════════════════════════════════════════════════
-- Activer Supabase Realtime sur active_calls
-- ══════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE active_calls;

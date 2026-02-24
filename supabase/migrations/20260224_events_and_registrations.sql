-- ─── Events table ───
CREATE TABLE IF NOT EXISTS events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  event_type        TEXT NOT NULL DEFAULT 'soin_collectif'
                    CHECK (event_type IN ('soin_collectif', 'atelier', 'live', 'rencontre', 'shine_walk')),
  location_name     TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  event_date        TIMESTAMPTZ NOT NULL,
  live_url          TEXT,
  replay_url        TEXT,
  price             NUMERIC NOT NULL DEFAULT 0,
  max_participants  INTEGER,
  created_by        UUID REFERENCES profiles(id),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- If the table already exists but is missing the event_type column, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'events'
      AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events
      ADD COLUMN event_type TEXT NOT NULL DEFAULT 'soin_collectif'
      CHECK (event_type IN ('soin_collectif', 'atelier', 'live', 'rencontre', 'shine_walk'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- ─── Event Registrations table ───
CREATE TABLE IF NOT EXISTS event_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id),
  status      TEXT NOT NULL DEFAULT 'registered'
              CHECK (status IN ('registered', 'canceled')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);

-- ─── RLS ───
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Events: lecture publique pour les membres authentifiés
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'events_select' AND tablename = 'events') THEN
    CREATE POLICY "events_select"
      ON events FOR SELECT USING (true);
  END IF;
END $$;

-- Events: création par les admins
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'events_insert' AND tablename = 'events') THEN
    CREATE POLICY "events_insert"
      ON events FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('founder', 'admin_content')
        )
      );
  END IF;
END $$;

-- Events: modification par les admins
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'events_update' AND tablename = 'events') THEN
    CREATE POLICY "events_update"
      ON events FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('founder', 'admin_content')
        )
      );
  END IF;
END $$;

-- Events: suppression par les admins
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'events_delete' AND tablename = 'events') THEN
    CREATE POLICY "events_delete"
      ON events FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('founder', 'admin_content')
        )
      );
  END IF;
END $$;

-- Event Registrations: les utilisateurs peuvent voir leurs inscriptions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'event_registrations_select' AND tablename = 'event_registrations') THEN
    CREATE POLICY "event_registrations_select"
      ON event_registrations FOR SELECT USING (true);
  END IF;
END $$;

-- Event Registrations: les utilisateurs authentifiés peuvent s'inscrire
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'event_registrations_insert' AND tablename = 'event_registrations') THEN
    CREATE POLICY "event_registrations_insert"
      ON event_registrations FOR INSERT WITH CHECK (
        auth.uid() = user_id
      );
  END IF;
END $$;

-- Event Registrations: les utilisateurs peuvent annuler leur inscription
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'event_registrations_update' AND tablename = 'event_registrations') THEN
    CREATE POLICY "event_registrations_update"
      ON event_registrations FOR UPDATE USING (
        auth.uid() = user_id
      );
  END IF;
END $$;

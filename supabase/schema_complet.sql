-- ══════════════════════════════════════════════════════════════
-- SOS SHINE — Schema complet de la base de donnees
-- A executer dans Supabase SQL Editor pour creer TOUTES les tables
-- ══════════════════════════════════════════════════════════════
-- IMPORTANT : Ce fichier suppose que Supabase Auth est deja configure
-- et que la table auth.users existe.
-- ══════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom      TEXT NOT NULL DEFAULT '',
  pseudo      TEXT DEFAULT NULL,
  email       TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('member', 'founder', 'admin_content', 'admin_support')),
  avatar_url  TEXT DEFAULT NULL,
  bio         TEXT DEFAULT NULL,
  video_url   TEXT DEFAULT NULL,
  plan        TEXT DEFAULT NULL CHECK (plan IN ('essential', 'premium')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-creer un profil quand un user s'inscrit
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, prenom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════
-- 2. SUBSCRIPTIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT DEFAULT NULL,
  stripe_subscription_id  TEXT DEFAULT NULL,
  plan                    TEXT NOT NULL CHECK (plan IN ('essential', 'premium')),
  status                  TEXT NOT NULL DEFAULT 'trialing'
                            CHECK (status IN ('trialing', 'active', 'inactive', 'canceled', 'past_due')),
  current_period_end      TIMESTAMPTZ DEFAULT NULL,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 3. DOULEURS (contenu principal)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS douleurs (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title                TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT DEFAULT NULL,
  video_url            TEXT DEFAULT NULL,
  audio_energy_url     TEXT DEFAULT NULL,
  audio_meditation_url TEXT DEFAULT NULL,
  pdf_url              TEXT DEFAULT NULL,
  exercise_content     TEXT DEFAULT NULL,
  image_url            TEXT DEFAULT NULL,
  is_active            BOOLEAN DEFAULT true,
  is_published         BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_douleurs_slug ON douleurs(slug);

ALTER TABLE douleurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "douleurs_select" ON douleurs FOR SELECT USING (true);
CREATE POLICY "douleurs_insert" ON douleurs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);
CREATE POLICY "douleurs_update" ON douleurs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);
CREATE POLICY "douleurs_delete" ON douleurs FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);


-- ═══════════════════════════════════════
-- 4. MESSAGES (chat par douleur + general)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  douleur_id   UUID REFERENCES douleurs(id) ON DELETE CASCADE,
  content      TEXT NOT NULL CHECK (char_length(content) <= 2000),
  audio_url    TEXT DEFAULT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
  is_general   BOOLEAN DEFAULT false,
  is_deleted   BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_douleur ON messages(douleur_id, created_at DESC);
CREATE INDEX idx_messages_general ON messages(is_general, created_at DESC) WHERE is_general = true;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update" ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "messages_delete" ON messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 5. POSTS (mur communautaire)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  image_url    TEXT DEFAULT NULL,
  post_type    TEXT NOT NULL DEFAULT 'general'
                 CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general')),
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );
CREATE POLICY "posts_update" ON posts FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );
CREATE POLICY "posts_delete" ON posts FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );


-- ═══════════════════════════════════════
-- 6. EVENTS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS events (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT DEFAULT NULL,
  event_type        TEXT NOT NULL
                      CHECK (event_type IN ('soin_collectif', 'atelier', 'live', 'rencontre', 'shine_walk')),
  location_name     TEXT DEFAULT NULL,
  latitude          DOUBLE PRECISION DEFAULT NULL,
  longitude         DOUBLE PRECISION DEFAULT NULL,
  event_date        TIMESTAMPTZ NOT NULL,
  live_url          TEXT DEFAULT NULL,
  replay_url        TEXT DEFAULT NULL,
  price             NUMERIC(10,2) DEFAULT 0,
  max_participants  INTEGER DEFAULT NULL,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );
CREATE POLICY "events_update" ON events FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );
CREATE POLICY "events_delete" ON events FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );


-- ═══════════════════════════════════════
-- 7. EVENT REGISTRATIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS event_registrations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'registered'
               CHECK (status IN ('registered', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_registrations_select" ON event_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_registrations_insert" ON event_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_registrations_update" ON event_registrations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 8. CONTENT VIEWS (analytics)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_views (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  douleur_id       UUID REFERENCES douleurs(id) ON DELETE CASCADE,
  event_id         UUID REFERENCES events(id) ON DELETE CASCADE,
  content_type     TEXT NOT NULL
                     CHECK (content_type IN ('video', 'audio_energy', 'audio_meditation', 'pdf', 'exercise', 'page_view')),
  duration_seconds INTEGER DEFAULT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_views_user ON content_views(user_id);
CREATE INDEX idx_content_views_douleur ON content_views(douleur_id);

ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_views_select" ON content_views FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "content_views_insert" ON content_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 9. NOTIFICATIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  link              TEXT DEFAULT NULL,
  notification_type TEXT NOT NULL
                      CHECK (notification_type IN ('new_douleur', 'new_event', 'new_post', 'new_soin')),
  is_read           BOOLEAN DEFAULT false,
  email_sent        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 10. PRIVATE MESSAGES
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS private_messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT CHECK (char_length(content) <= 2000),
  audio_url    TEXT DEFAULT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pm_sender   ON private_messages(sender_id, created_at DESC);
CREATE INDEX idx_pm_receiver ON private_messages(receiver_id, created_at DESC);
CREATE INDEX idx_pm_pair     ON private_messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pm_select" ON private_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "pm_insert" ON private_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "pm_update" ON private_messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);
CREATE POLICY "pm_delete" ON private_messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);


-- ═══════════════════════════════════════
-- 11. SIGNALING ROOMS (WebRTC natif)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS signaling_rooms (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code       TEXT NOT NULL UNIQUE
                    DEFAULT ('room-' || substr(gen_random_uuid()::text, 1, 12)),
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_type       TEXT NOT NULL DEFAULT 'one_to_one'
                    CHECK (room_type IN ('one_to_one', 'group')),
  call_type       TEXT NOT NULL DEFAULT 'video'
                    CHECK (call_type IN ('audio', 'video')),
  target_user_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'waiting'
                    CHECK (status IN ('waiting', 'active', 'ended', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sr_created_by ON signaling_rooms(created_by);
CREATE INDEX idx_sr_target     ON signaling_rooms(target_user_id) WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_sr_status     ON signaling_rooms(status) WHERE status IN ('waiting', 'active');

ALTER TABLE signaling_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sr_select" ON signaling_rooms FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = target_user_id OR room_type = 'group');
CREATE POLICY "sr_insert" ON signaling_rooms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "sr_update" ON signaling_rooms FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = target_user_id);
CREATE POLICY "sr_delete" ON signaling_rooms FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Activer Realtime pour les notifications d'appels
ALTER PUBLICATION supabase_realtime ADD TABLE signaling_rooms;


-- ═══════════════════════════════════════
-- 12. GROUP EVENTS (visio de groupe)
-- ═══════════════════════════════════════

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

ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ge_select" ON group_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "ge_insert" ON group_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);
CREATE POLICY "ge_update" ON group_events FOR UPDATE TO authenticated
  USING (auth.uid() = host_id);
CREATE POLICY "ge_delete" ON group_events FOR DELETE TO authenticated
  USING (auth.uid() = host_id);


-- ═══════════════════════════════════════
-- 13. SITE SETTINGS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_settings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL DEFAULT '',
  updated_by  UUID REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_upsert" ON site_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);
CREATE POLICY "site_settings_update" ON site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);


-- ═══════════════════════════════════════
-- 14. LANDING SECTIONS (CMS)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS landing_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key   TEXT UNIQUE NOT NULL,
  label         TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  content       JSONB NOT NULL DEFAULT '{}',
  styles        JSONB NOT NULL DEFAULT '{}',
  updated_by    UUID REFERENCES profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_sections_position ON landing_sections(position);

ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ls_select" ON landing_sections FOR SELECT USING (true);
CREATE POLICY "ls_insert" ON landing_sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);
CREATE POLICY "ls_update" ON landing_sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);
CREATE POLICY "ls_delete" ON landing_sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
);


-- ═══════════════════════════════════════
-- 15. STORAGE BUCKET
-- ═══════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "storage_select" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'uploads');
CREATE POLICY "storage_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads');


-- ══════════════════════════════════════════════════════════
-- FIN DU SCHEMA
-- Executez ensuite seed.sql pour le contenu initial
-- ══════════════════════════════════════════════════════════

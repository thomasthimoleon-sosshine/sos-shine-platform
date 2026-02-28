-- ══════════════════════════════════════════════════════════════
-- SOS Shine Platform — Complete Supabase Setup
-- Run this once to create all tables, functions, and RLS policies
-- Last updated: 2026-02-26
-- ══════════════════════════════════════════════════════════════

-- ── 1. PROFILES ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom                TEXT NOT NULL,
  pseudo                TEXT UNIQUE,
  email                 TEXT UNIQUE NOT NULL,
  role                  TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'founder', 'admin_content', 'admin_support')),
  avatar_url            TEXT,
  bio                   TEXT,
  video_url             TEXT,
  plan                  TEXT CHECK (plan IN ('essential', 'premium')),
  is_bot                BOOLEAN NOT NULL DEFAULT false,
  publish_banned_until  TIMESTAMPTZ DEFAULT NULL,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ── 2. DOULEURS (Core Content) ──
CREATE TABLE IF NOT EXISTS public.douleurs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT,
  video_url             TEXT,
  step1_audio_url       TEXT,
  step1_pdf_url         TEXT,
  audio_energy_url      TEXT,
  step2_video_url       TEXT,
  step2_pdf_url         TEXT,
  audio_meditation_url  TEXT,
  step3_video_url       TEXT,
  pdf_url               TEXT,
  exercise_content      TEXT,
  image_url             TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  is_published          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ── 3. SUBSCRIPTIONS ──
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  plan                      TEXT NOT NULL CHECK (plan IN ('essential', 'premium')),
  status                    TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('trialing', 'active', 'inactive', 'canceled', 'past_due')),
  current_period_end        TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- ── 4. MESSAGES (Chat) ──
CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  douleur_id    UUID REFERENCES public.douleurs(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  audio_url     TEXT,
  message_type  TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
  is_general    BOOLEAN NOT NULL DEFAULT false,
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  is_anonymous  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 5. POSTS (Community Wall) ──
CREATE TABLE IF NOT EXISTS public.posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  image_url     TEXT,
  video_url     TEXT,
  audio_url     TEXT,
  post_type     TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general', 'community')),
  category      TEXT DEFAULT 'partage' CHECK (category IN ('temoignage', 'partage', 'question', 'remerciements', 'gratitude', 'citation')),
  media_type    TEXT DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'audio')),
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 5b. POST LIKES ──
CREATE TABLE IF NOT EXISTS public.post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

-- ── 5c. POST COMMENTS ──
CREATE TABLE IF NOT EXISTS public.post_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- ── 6. EVENTS ──
CREATE TABLE IF NOT EXISTS public.events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  event_type        TEXT NOT NULL DEFAULT 'live' CHECK (event_type IN ('soin_collectif', 'atelier', 'live', 'rencontre', 'shine_walk')),
  location_name     TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  event_date        TIMESTAMPTZ NOT NULL,
  live_url          TEXT,
  replay_url        TEXT,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_participants  INTEGER,
  created_by        UUID REFERENCES public.profiles(id),
  hosts             TEXT[] DEFAULT '{}',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 7. LANDING SECTIONS (CMS) ──
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key   TEXT UNIQUE NOT NULL,
  label         TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  content       JSONB NOT NULL DEFAULT '{}',
  styles        JSONB NOT NULL DEFAULT '{}',
  updated_by    UUID REFERENCES public.profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 8. SITE SETTINGS ──
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL DEFAULT '',
  updated_by  UUID REFERENCES public.profiles(id),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 9. NOTIFICATIONS ──
CREATE TABLE IF NOT EXISTS public.notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  link              TEXT,
  notification_type TEXT NOT NULL DEFAULT 'new_post' CHECK (notification_type IN ('new_douleur', 'new_event', 'new_post', 'new_soin')),
  is_read           BOOLEAN NOT NULL DEFAULT false,
  email_sent        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 10. PRIVATE MESSAGES ──
CREATE TABLE IF NOT EXISTS public.private_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT,
  audio_url     TEXT,
  message_type  TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio')),
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 11. EVENT REGISTRATIONS ──
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'canceled')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 12. CONTENT VIEWS ──
CREATE TABLE IF NOT EXISTS public.content_views (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  douleur_id        UUID REFERENCES public.douleurs(id) ON DELETE CASCADE,
  event_id          UUID REFERENCES public.events(id) ON DELETE CASCADE,
  content_type      TEXT NOT NULL CHECK (content_type IN ('video', 'audio_energy', 'audio_meditation', 'pdf', 'exercise', 'page_view')),
  duration_seconds  INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 13. SIGNALING ROOMS (WebRTC) ──
CREATE TABLE IF NOT EXISTS public.signaling_rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code       TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  created_by      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_type       TEXT NOT NULL DEFAULT 'one_to_one' CHECK (room_type IN ('one_to_one', 'group')),
  call_type       TEXT NOT NULL DEFAULT 'video' CHECK (call_type IN ('audio', 'video')),
  target_user_id  UUID REFERENCES public.profiles(id),
  status          TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 14. GROUP EVENTS (visio) ──
CREATE TABLE IF NOT EXISTS public.group_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  event_type        TEXT NOT NULL DEFAULT 'video' CHECK (event_type IN ('audio', 'video')),
  start_time        TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'canceled')),
  room_id           UUID REFERENCES public.signaling_rooms(id),
  max_participants  INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- ADMIN HELPER FUNCTION
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('founder', 'admin_content', 'admin_support')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ══════════════════════════════════════════════════════════════

-- ── Profiles ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Founders can update any profile" ON public.profiles;
CREATE POLICY "Founders can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin());

-- ── Douleurs ──
ALTER TABLE public.douleurs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published douleurs are viewable by everyone" ON public.douleurs;
CREATE POLICY "Published douleurs are viewable by everyone" ON public.douleurs FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins can do everything on douleurs" ON public.douleurs;
CREATE POLICY "Admins can do everything on douleurs" ON public.douleurs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all douleurs" ON public.douleurs;
CREATE POLICY "Admins can view all douleurs" ON public.douleurs FOR SELECT USING (public.is_admin());

-- ── Subscriptions ──
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ── Messages ──
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Messages are viewable by members" ON public.messages;
CREATE POLICY "Messages are viewable by members" ON public.messages FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Posts (Community Wall) ──
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published posts are viewable by members" ON public.posts;
CREATE POLICY "Published posts are viewable by members" ON public.posts
  FOR SELECT USING (is_published = true AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Members can create community posts" ON public.posts;
CREATE POLICY "Members can create community posts" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND post_type = 'community'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND publish_banned_until IS NOT NULL
      AND publish_banned_until > now()
    )
  );
DROP POLICY IF EXISTS "Admins can create any post" ON public.posts;
CREATE POLICY "Admins can create any post" ON public.posts
  FOR INSERT WITH CHECK (public.is_admin() AND auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
CREATE POLICY "Admins can update any post" ON public.posts
  FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin());

-- ── Post Likes ──
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
CREATE POLICY "Users can like" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
CREATE POLICY "Users can unlike" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- ── Post Comments ──
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can comment" ON public.post_comments;
CREATE POLICY "Users can comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.post_comments;
CREATE POLICY "Admins can delete any comment" ON public.post_comments FOR DELETE USING (public.is_admin());

-- ── Landing Sections ──
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Landing sections are viewable by everyone" ON public.landing_sections;
CREATE POLICY "Landing sections are viewable by everyone" ON public.landing_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage landing sections" ON public.landing_sections;
CREATE POLICY "Admins can manage landing sections" ON public.landing_sections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Site Settings ──
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Notifications ──
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── Private Messages ──
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON public.private_messages;
CREATE POLICY "Users can view own messages" ON public.private_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can send messages" ON public.private_messages;
CREATE POLICY "Users can send messages" ON public.private_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can update own received messages" ON public.private_messages;
CREATE POLICY "Users can update own received messages" ON public.private_messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ── Event Registrations ──
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can view registration counts" ON public.event_registrations;
CREATE POLICY "Anyone can view registration counts" ON public.event_registrations FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can register" ON public.event_registrations;
CREATE POLICY "Users can register" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own registration" ON public.event_registrations;
CREATE POLICY "Users can update own registration" ON public.event_registrations FOR UPDATE USING (auth.uid() = user_id);

-- ── Events ──
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Events are viewable by members" ON public.events;
CREATE POLICY "Events are viewable by members" ON public.events FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Content Views ──
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own views" ON public.content_views;
CREATE POLICY "Users can insert own views" ON public.content_views FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own analytics" ON public.content_views;
CREATE POLICY "Users can view own analytics" ON public.content_views FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.content_views;
CREATE POLICY "Admins can view all analytics" ON public.content_views FOR SELECT USING (public.is_admin());

-- ── Signaling Rooms ──
ALTER TABLE public.signaling_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own rooms" ON public.signaling_rooms;
CREATE POLICY "Users can view own rooms" ON public.signaling_rooms FOR SELECT USING (auth.uid() = created_by OR auth.uid() = target_user_id);
DROP POLICY IF EXISTS "Users can create rooms" ON public.signaling_rooms;
CREATE POLICY "Users can create rooms" ON public.signaling_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Participants can update rooms" ON public.signaling_rooms;
CREATE POLICY "Participants can update rooms" ON public.signaling_rooms FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = target_user_id);

-- ── Group Events ──
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group events are viewable by members" ON public.group_events;
CREATE POLICY "Group events are viewable by members" ON public.group_events FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can manage group events" ON public.group_events;
CREATE POLICY "Admins can manage group events" ON public.group_events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKET
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

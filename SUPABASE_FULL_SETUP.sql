-- ── 1. PROFILES ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom      TEXT NOT NULL,
  pseudo      TEXT UNIQUE,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'founder', 'admin_content', 'admin_support')),
  avatar_url  TEXT,
  bio         TEXT,
  video_url   TEXT,
  plan        TEXT CHECK (plan IN ('essential', 'premium')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 2. DOULEURS (Core Content) ──
CREATE TABLE IF NOT EXISTS public.douleurs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT,
  video_url             TEXT,
  audio_energy_url      TEXT,
  audio_meditation_url  TEXT,
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
  post_type     TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('announcement', 'douleur_published', 'event_published', 'general')),
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

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

-- ── 8. RLS POLICIES (Public Access) ──

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Douleurs
ALTER TABLE public.douleurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published douleurs are viewable by everyone" ON public.douleurs FOR SELECT USING (is_published = true);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages are viewable by members" ON public.messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Landing Sections
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landing sections are viewable by everyone" ON public.landing_sections FOR SELECT USING (true);

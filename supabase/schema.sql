-- ════════════════════════════════════════════════════════════
-- SOS Meet — schéma complet (rencontre « en conscience »)
-- Reflète l'état réel de la base. Appliqué via migrations Supabase.
--
-- Modèle : profil relié au compte SOS Shine (auth.users).
-- Sécurité : RLS activée partout, AUCUNE policy anon/authenticated →
-- tout accès passe par les routes serveur (clé service role), qui
-- authentifient l'utilisateur et appliquent les autorisations.
-- Données sensibles (RGPD art. 9 : convictions, vie intime) : consentement
-- explicite dédié (sensitive_consent) + hébergement UE.
-- ════════════════════════════════════════════════════════════

-- ── Liste d'attente ─────────────────────────────────────────
create table if not exists public.sosmeet_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  first_name  text not null,
  city        text,
  stage       text,
  consent     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_sosmeet_waitlist_created on public.sosmeet_waitlist (created_at desc);

-- ── Profils de compatibilité (questionnaire profond + identité) ──
create table if not exists public.sosmeet_profiles (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique references public.sosmeet_waitlist (email) on delete cascade,
  user_id           uuid references auth.users(id) on delete cascade,
  answers           jsonb not null default '{}'::jsonb,   -- { questionId: value }
  scores            jsonb not null default '{}'::jsonb,   -- { dimension: 0..100 }
  first_name        text,
  birthdate         date,
  gender            text,               -- femme / homme / non-binaire / autre
  seeking           text[] default '{}',-- ['femmes'] ['hommes'] ['tout']
  city              text,
  headline          text,               -- une phrase d'accroche
  bio               text,
  photo_path        text,               -- chemin privé (révélé au match)
  age_confirmed     boolean not null default false,
  is_visible        boolean not null default false,
  sensitive_consent boolean not null default false,
  completed         boolean not null default false,
  updated_at        timestamptz not null default now(),
  created_at        timestamptz not null default now()
);
create index if not exists idx_sosmeet_profiles_email on public.sosmeet_profiles (email);
create index if not exists idx_sosmeet_profiles_user on public.sosmeet_profiles (user_id);
create index if not exists idx_sosmeet_profiles_visible on public.sosmeet_profiles (is_visible) where is_visible = true;

-- ── Intérêt « se connecter en conscience » (unidirectionnel) ──
create table if not exists public.sosmeet_interests (
  id         uuid primary key default gen_random_uuid(),
  from_user  uuid not null references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (from_user, to_user)
);
create index if not exists idx_sosmeet_interests_to on public.sosmeet_interests (to_user);

-- ── Match réciproque (paire ordonnée user_a < user_b) ──
create table if not exists public.sosmeet_matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references auth.users(id) on delete cascade,
  user_b     uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);
create index if not exists idx_sosmeet_matches_a on public.sosmeet_matches (user_a);
create index if not exists idx_sosmeet_matches_b on public.sosmeet_matches (user_b);

-- ── Messagerie (uniquement entre profils matchés) ──
create table if not exists public.sosmeet_messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.sosmeet_matches(id) on delete cascade,
  sender_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_sosmeet_messages_match on public.sosmeet_messages (match_id, created_at);

-- ── Sécurité : signalements et blocages ──
create table if not exists public.sosmeet_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  reason      text,
  created_at  timestamptz not null default now()
);
create table if not exists public.sosmeet_blocks (
  id         uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

-- ── RLS fermée partout : tout passe par les routes serveur ──
alter table public.sosmeet_waitlist  enable row level security;
alter table public.sosmeet_profiles  enable row level security;
alter table public.sosmeet_interests enable row level security;
alter table public.sosmeet_matches   enable row level security;
alter table public.sosmeet_messages  enable row level security;
alter table public.sosmeet_reports   enable row level security;
alter table public.sosmeet_blocks    enable row level security;

-- Bucket de stockage privé pour les photos (révélation au match) :
--   id: sosmeet-photos, public: false, 8 Mo, image/jpeg|png|webp

-- ═══════════════════════════════════════════════════════════════════════════
-- SOS MEET — À APPLIQUER DANS L'ÉDITEUR SQL SUPABASE
-- Projet krdfvggmfswbohuevzlb. Tout est idempotent : réexécutable sans risque.
-- Contient deux choses : la migration solo restée en attente, et les dix
-- tables du parcours couple.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- PARTIE 1 — SOLO : le profil s'appuie sur le compte, plus sur la waitlist.
-- Lève la vieille contrainte email → waitlist, qui était une verrue.
-- ───────────────────────────────────────────────────────────────────────────
alter table public.sosmeet_profiles drop constraint if exists sosmeet_profiles_email_fkey;
alter table public.sosmeet_profiles alter column email drop not null;
create unique index if not exists uq_sosmeet_profiles_user
  on public.sosmeet_profiles (user_id) where user_id is not null;


-- ───────────────────────────────────────────────────────────────────────────
-- PARTIE 2 — COUPLE « Se retrouver »

-- ════════════════════════════════════════════════════════════════════
-- LE DUO
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couples (
  id             uuid primary key default gen_random_uuid(),
  invite_code    text not null unique,          -- court, lisible, non devinable (§4)
  invite_expires timestamptz not null,          -- une invitation périme
  partner_a      uuid not null references auth.users(id) on delete cascade,
  partner_b      uuid references auth.users(id) on delete set null,
  status         text not null default 'INVITATION_ENVOYEE',
  -- Vigilance (§7). Jamais exposé aux partenaires.
  safety_flag    text,                          -- null | 'a_verifier' | 'suspendu'
  safety_note    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint partners_distincts check (partner_b is null or partner_a <> partner_b)
);
create unique index if not exists idx_couples_invite on public.sosmeet_couples (invite_code);
create index if not exists idx_couples_a on public.sosmeet_couples (partner_a);
create index if not exists idx_couples_b on public.sosmeet_couples (partner_b);
create index if not exists idx_couples_status on public.sosmeet_couples (status);

-- Une personne ne peut avoir qu'un seul duo actif à la fois.
create unique index if not exists idx_couples_actif_a on public.sosmeet_couples (partner_a)
  where status <> 'ARCHIVE';
create unique index if not exists idx_couples_actif_b on public.sosmeet_couples (partner_b)
  where partner_b is not null and status <> 'ARCHIVE';

-- ════════════════════════════════════════════════════════════════════
-- LES RÉPONSES (une ligne par partenaire, jamais lisible par l'autre)
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couple_answers (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.sosmeet_couples(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  answers       jsonb not null default '{}'::jsonb,  -- { qid: number }  fermées et échelles
  open_answers  jsonb not null default '{}'::jsonb,  -- { qid: string }  SENSIBLE, ne sort jamais
  timings       jsonb not null default '{}'::jsonb,  -- anti-bâclage, comme le solo
  scores        jsonb not null default '{}'::jsonb,  -- dérivé : dimensions, sincérité
  sealed_at     timestamptz,                         -- scellé = plus modifiable (I2)
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (couple_id, user_id)
);
create index if not exists idx_couple_answers_couple on public.sosmeet_couple_answers (couple_id);

-- ════════════════════════════════════════════════════════════════════
-- DONNÉES DE NAISSANCE (couches énergétiques) · art. 9 RGPD, consentement dédié
-- Séparées des réponses : on peut les purger sans détruire le diagnostic.
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couple_birth (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.sosmeet_couples(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  birth_date    date not null,
  birth_time    time,                            -- inconnue possible, on dégrade (§6.C)
  birth_place   text,
  birth_lat     numeric(9,6),
  birth_lon     numeric(9,6),
  birth_tz      text,                            -- IANA, ex. 'Europe/Paris'
  time_accuracy text not null default 'exacte',  -- exacte | approximative | inconnue
  consent       boolean not null default false,  -- consentement explicite dédié
  unique (couple_id, user_id)
);

-- ════════════════════════════════════════════════════════════════════
-- CATALOGUE DES PROFILS · les 4 profils arrivent plus tard, donc en données
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couple_profile_types (
  id           text primary key,                 -- ex. 'P1'
  label        text not null,
  tagline      text,
  description  text,
  color        text,
  sort_order   int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Dynamiques de dyade : ce que donne profil X + profil Y. 4x4 = 16 combinaisons.
create table if not exists public.sosmeet_couple_dyads (
  profile_a    text not null references public.sosmeet_couple_profile_types(id),
  profile_b    text not null references public.sosmeet_couple_profile_types(id),
  label        text not null,
  dynamic      text not null,                    -- le texte de la dynamique
  watchpoints  jsonb not null default '[]'::jsonb,
  strengths    jsonb not null default '[]'::jsonb,
  primary key (profile_a, profile_b)
);

-- ════════════════════════════════════════════════════════════════════
-- PROFILAGE MANUEL + TRAÇABILITÉ (I3)
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couple_profiling (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.sosmeet_couples(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  profile_type  text references public.sosmeet_couple_profile_types(id),
  rationale     text,                            -- pourquoi ce profil, interne
  assigned_by   uuid references auth.users(id),
  assigned_at   timestamptz,
  validated_by  uuid references auth.users(id),  -- double regard possible
  validated_at  timestamptz,
  unique (couple_id, user_id)
);

create table if not exists public.sosmeet_couple_audit (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.sosmeet_couples(id) on delete cascade,
  actor_id   uuid references auth.users(id),
  action     text not null,   -- 'lecture_questionnaire' | 'profil_attribue' | 'statut_change' | ...
  target     text,            -- user_id concerné, statut visé, etc.
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_couple_audit_couple on public.sosmeet_couple_audit (couple_id, created_at desc);

-- ════════════════════════════════════════════════════════════════════
-- LE DIAGNOSTIC
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couple_reports (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.sosmeet_couples(id) on delete cascade,
  version       int not null default 1,          -- refaire la carte dans X semaines
  crossing      jsonb not null,                  -- §6.A  accords, frictions, malentendus
  energetics    jsonb,                           -- §6.B  HD, astro, numérologie
  synthesis     jsonb not null,                  -- §6.C  failles classées, leviers, points d'or
  engine_version text not null,                  -- pour rejouer un diagnostic ancien
  published_at  timestamptz,                     -- visible par les partenaires seulement si non nul
  created_at    timestamptz not null default now(),
  unique (couple_id, version)
);

-- ════════════════════════════════════════════════════════════════════
-- BIBLIOTHÈQUE COUPLE
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.sosmeet_couple_library (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  theme        text not null,        -- 'disputes' | 'desir' | 'fondations' | 'respect' | ...
  title        text not null,
  teaser       text,
  body         text,                 -- markdown
  media_url    text,
  duration_min int,
  -- Déblocage : ce contenu répond à ces failles. Vide = toujours accessible.
  unlocks_on   jsonb not null default '[]'::jsonb,   -- ['communication', 'desir']
  min_severity int not null default 0,               -- ne s'ouvre qu'au-delà de ce niveau
  sort_order   int not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.sosmeet_couple_library_progress (
  couple_id  uuid not null references public.sosmeet_couples(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_id    uuid not null references public.sosmeet_couple_library(id) on delete cascade,
  done_at    timestamptz,
  primary key (couple_id, user_id, item_id)
);

-- RLS fermée partout : tout accès passe par les routes serveur.
alter table public.sosmeet_couples                enable row level security;
alter table public.sosmeet_couple_answers         enable row level security;
alter table public.sosmeet_couple_birth           enable row level security;
alter table public.sosmeet_couple_profile_types   enable row level security;
alter table public.sosmeet_couple_dyads           enable row level security;
alter table public.sosmeet_couple_profiling       enable row level security;
alter table public.sosmeet_couple_audit           enable row level security;
alter table public.sosmeet_couple_reports         enable row level security;
alter table public.sosmeet_couple_library         enable row level security;
alter table public.sosmeet_couple_library_progress enable row level security;


-- ───────────────────────────────────────────────────────────────────────────
-- PARTIE 3 — VÉRIFICATION. Doit renvoyer 10 lignes, toutes avec rls = true.
-- ───────────────────────────────────────────────────────────────────────────
select tablename, rowsecurity as rls_active
from pg_tables
where schemaname = 'public' and tablename like 'sosmeet_couple%'
order by tablename;

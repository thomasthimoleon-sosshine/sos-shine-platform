-- ════════════════════════════════════════════════════════════
-- SOS Meet — schéma waitlist + profils de compatibilité
-- À exécuter dans le SQL editor de Supabase (une seule fois).
-- ════════════════════════════════════════════════════════════

-- ── Table waitlist ──────────────────────────────────────────
create table if not exists public.sosmeet_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  first_name  text not null,
  city        text,           -- Paris / Lyon / Bordeaux / Autre
  stage       text,           -- niveau de cheminement
  consent     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_sosmeet_waitlist_created on public.sosmeet_waitlist (created_at desc);

-- ── Table profils de compatibilité (questionnaire profond) ──
-- Données sensibles (RGPD art. 9 : convictions, vie intime) :
-- consentement explicite dédié + hébergement UE.
create table if not exists public.sosmeet_profiles (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique references public.sosmeet_waitlist (email) on delete cascade,
  answers       jsonb not null default '{}'::jsonb,   -- { questionId: value }
  scores        jsonb not null default '{}'::jsonb,   -- { dimension: 0..100 }
  sensitive_consent boolean not null default false,
  completed      boolean not null default false,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_sosmeet_profiles_email on public.sosmeet_profiles (email);

-- ── RLS : tout passe par la route serveur (service role). ────
-- Aucun accès direct anon/authenticated : la clé service role
-- bypass la RLS, et personne d'autre ne lit/écrit.
alter table public.sosmeet_waitlist enable row level security;
alter table public.sosmeet_profiles enable row level security;

-- (Pas de policy pour anon/authenticated => tout accès direct refusé.)
-- Si vous souhaitez autoriser l'insertion publique via la clé anon,
-- décommentez la policy ci-dessous (déconseillé : préférez la route serveur) :
--
-- create policy "sosmeet_waitlist_insert_public"
--   on public.sosmeet_waitlist for insert
--   to anon with check (true);

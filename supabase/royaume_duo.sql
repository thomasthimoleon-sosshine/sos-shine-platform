-- ═══════════════════════════════════════════════════════════════
-- BRAISE — Parcours Couple
--
-- La règle du parcours est une règle de base de données, pas une
-- règle d'interface : tant que les deux n'ont pas terminé, aucune
-- requête, même forgée à la main, ne peut lire les réponses de
-- l'autre. C'est ce qui rend les réponses honnêtes.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Le lien entre deux personnes ─────────────────────────────

create table if not exists public.royaume_duo_links (
  id           uuid primary key default gen_random_uuid(),
  -- Code court partagé de vive voix, jamais par écrit si possible.
  code         text not null unique,
  initiator_id uuid not null references auth.users (id) on delete cascade,
  partner_id   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  revealed_at  timestamptz,
  constraint royaume_duo_links_distinct check (partner_id is null or partner_id <> initiator_id)
);

create index if not exists royaume_duo_links_initiator_idx on public.royaume_duo_links (initiator_id);
create index if not exists royaume_duo_links_partner_idx   on public.royaume_duo_links (partner_id);

-- ── 2. Les réponses ─────────────────────────────────────────────

create table if not exists public.royaume_duo_answers (
  id          uuid primary key default gen_random_uuid(),
  link_id     uuid not null references public.royaume_duo_links (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  value       smallint check (value between 1 and 7),
  selected    text[],
  answer_text text,
  updated_at  timestamptz not null default now(),
  unique (link_id, user_id, question_id)
);

create index if not exists royaume_duo_answers_link_idx on public.royaume_duo_answers (link_id);

-- ── 3. L'état d'avancement ──────────────────────────────────────

create table if not exists public.royaume_duo_progress (
  link_id      uuid not null references public.royaume_duo_links (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  completed    boolean not null default false,
  completed_at timestamptz,
  primary key (link_id, user_id)
);

-- ── 4. Le verrou ────────────────────────────────────────────────
-- Vrai seulement quand les deux membres du lien ont terminé.
-- SECURITY DEFINER : la fonction doit pouvoir compter les deux
-- lignes de progression, ce que l'appelant n'a justement pas le
-- droit de faire tant que la révélation n'a pas eu lieu.

create or replace function public.royaume_duo_is_revealed(p_link_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select count(*) = 2
      from public.royaume_duo_progress p
      join public.royaume_duo_links l on l.id = p.link_id
      where p.link_id = p_link_id
        and p.completed
        and p.user_id in (l.initiator_id, l.partner_id)
    ),
    false
  );
$$;

create or replace function public.royaume_duo_is_member(p_link_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.royaume_duo_links l
    where l.id = p_link_id
      and auth.uid() in (l.initiator_id, l.partner_id)
  );
$$;

-- ── 5. RLS ──────────────────────────────────────────────────────

alter table public.royaume_duo_links    enable row level security;
alter table public.royaume_duo_answers  enable row level security;
alter table public.royaume_duo_progress enable row level security;

-- Liens : visibles par leurs deux membres.
drop policy if exists royaume_links_select on public.royaume_duo_links;
create policy royaume_links_select on public.royaume_duo_links
  for select using (auth.uid() in (initiator_id, partner_id));

drop policy if exists royaume_links_insert on public.royaume_duo_links;
create policy royaume_links_insert on public.royaume_duo_links
  for insert with check (auth.uid() = initiator_id);

-- Rejoindre : seul le champ partner_id peut être posé, et seulement
-- sur un lien encore libre.
drop policy if exists royaume_links_join on public.royaume_duo_links;
create policy royaume_links_join on public.royaume_duo_links
  for update
  using (partner_id is null and auth.uid() <> initiator_id)
  with check (partner_id = auth.uid());

-- Réponses : les siennes toujours ; celles de l'autre seulement
-- après la révélation. C'est ici que tient tout le parcours.
drop policy if exists royaume_answers_select_own on public.royaume_duo_answers;
create policy royaume_answers_select_own on public.royaume_duo_answers
  for select using (auth.uid() = user_id);

drop policy if exists royaume_answers_select_partner on public.royaume_duo_answers;
create policy royaume_answers_select_partner on public.royaume_duo_answers
  for select using (
    auth.uid() <> user_id
    and public.royaume_duo_is_member(link_id)
    and public.royaume_duo_is_revealed(link_id)
  );

drop policy if exists royaume_answers_write_own on public.royaume_duo_answers;
create policy royaume_answers_write_own on public.royaume_duo_answers
  for insert with check (
    auth.uid() = user_id and public.royaume_duo_is_member(link_id)
  );

drop policy if exists royaume_answers_update_own on public.royaume_duo_answers;
create policy royaume_answers_update_own on public.royaume_duo_answers
  for update
  using (auth.uid() = user_id and not public.royaume_duo_is_revealed(link_id))
  with check (auth.uid() = user_id);

-- Progression : chacun voit et écrit la sienne. On peut savoir que
-- l'autre a terminé — c'est un booléen, pas un contenu.
drop policy if exists royaume_progress_select on public.royaume_duo_progress;
create policy royaume_progress_select on public.royaume_duo_progress
  for select using (public.royaume_duo_is_member(link_id));

drop policy if exists royaume_progress_write on public.royaume_duo_progress;
create policy royaume_progress_write on public.royaume_duo_progress
  for insert with check (auth.uid() = user_id and public.royaume_duo_is_member(link_id));

drop policy if exists royaume_progress_update on public.royaume_duo_progress;
create policy royaume_progress_update on public.royaume_duo_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 6. Horodatage de la révélation ──────────────────────────────

create or replace function public.royaume_duo_stamp_reveal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed and public.royaume_duo_is_revealed(new.link_id) then
    update public.royaume_duo_links
       set revealed_at = coalesce(revealed_at, now())
     where id = new.link_id;
  end if;
  return new;
end;
$$;

drop trigger if exists royaume_duo_reveal on public.royaume_duo_progress;
create trigger royaume_duo_reveal
  after insert or update on public.royaume_duo_progress
  for each row execute function public.royaume_duo_stamp_reveal();

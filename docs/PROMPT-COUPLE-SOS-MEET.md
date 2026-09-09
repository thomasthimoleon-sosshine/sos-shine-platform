# PROMPT — SOS MEET · PARCOURS « SE RETROUVER » (COUPLE)

> À donner au Claude qui construit **le parcours couple** en parallèle du parcours solo.
> Complète le prompt maître `docs/PROMPT-MAITRE-SOS-MEET.md` (à lire d'abord pour la charte,
> la base, les moteurs, les règles). Ce document ne couvre QUE la piste couple.
> Dernière mise à jour : 27 août 2026.

---

## 0. L'IDÉE

La deuxième porte de SOS Meet : **« Se retrouver »**, pour les **couples** qui veulent se
re-rencontrer plutôt que se séparer. *« Se retrouver coûte bien moins qu'une rupture. »*

Ce n'est PAS du matching avec des inconnus. Les **deux partenaires répondent séparément** à un
questionnaire, puis l'app leur rend **une carte de leur relation** (ce qui les unit, les zones de
friction, les malentendus) + des **rituels de re-rencontre** (exercices concrets).

Accueil et charte déjà en place : hero à deux portes (`app/sos-meet/SosMeetClient.tsx`), page
d'entrée `app/sos-meet/couple/` (concept + « prévenez-moi »). Image : `public/sosmeet/couple.png`.

---

## 1. PARCOURS UTILISATEUR (couple)

1. **Créer le duo** — un·e partenaire (A) démarre depuis `/sos-meet/couple`, connecté à son compte
   SOS Shine. Il/elle obtient un **lien d'invitation** (code unique) à envoyer à l'autre.
2. **Rejoindre** — le/la partenaire (B) ouvre le lien, se connecte ou crée un compte, et rejoint le duo.
3. **Chacun répond, séparément** — les deux remplissent le **questionnaire couple** (voir §3), sans se
   relire. Temps de réponse capté (comme le solo).
4. **La carte de la relation** — quand **les deux** ont fini, on génère la carte : accords, frictions,
   malentendus, + 3 à 5 **rituels de re-rencontre**. Les deux y accèdent.
5. (Plus tard) suivi : refaire la carte dans X semaines pour voir l'évolution.

---

## 2. BASE DE DONNÉES (nouvelles tables — préfixe `sosmeet_couple*`, ne PAS toucher aux tables solo)

RLS fermée partout (accès via routes serveur + service role), comme le reste de SOS Meet.

```sql
-- Le duo
create table public.sosmeet_couples (
  id            uuid primary key default gen_random_uuid(),
  invite_code   text not null unique,           -- code court pour le lien d'invitation
  created_by    uuid not null references auth.users(id) on delete cascade,
  partner_a     uuid not null references auth.users(id) on delete cascade,
  partner_b     uuid references auth.users(id) on delete set null, -- rejoint plus tard
  status        text not null default 'pending', -- pending | both_in | a_done | b_done | ready
  created_at    timestamptz not null default now()
);
-- Les réponses de chaque partenaire
create table public.sosmeet_couple_answers (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.sosmeet_couples(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  answers    jsonb not null default '{}'::jsonb,
  timings    jsonb not null default '{}'::jsonb,
  completed  boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (couple_id, user_id)
);
-- La carte générée (quand les deux ont fini)
create table public.sosmeet_couple_report (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null unique references public.sosmeet_couples(id) on delete cascade,
  report     jsonb not null,                     -- { accords[], frictions[], malentendus[], rituels[] }
  created_at timestamptz not null default now()
);
alter table public.sosmeet_couples enable row level security;
alter table public.sosmeet_couple_answers enable row level security;
alter table public.sosmeet_couple_report enable row level security;
```
(MCP Supabase instable → écrire dans `supabase/migrations/` et appliquer quand il répond ; rendre les API robustes.)

---

## 3. LE QUESTIONNAIRE COUPLE (`lib/sosmeet/couple/questionnaire.ts`)

Un **nouveau** jeu de questions, orienté relation existante (à prioriser avec Julia). Dimensions
suggérées : **communication, confiance, intimité, projets communs, répartition/charge, conflits,
autonomie/espace, tendresse, désir, rancœurs**. Chaque question taguée comme pour le solo
(`dimension`, `type`, options avec `value`). Deux natures de questions :
- **« Moi »** (comment JE vis la relation) → pour comparer les deux perceptions.
- **« Nous / l'autre »** (comment je perçois le couple / mon/ma partenaire) → révèle les **malentendus**
  (écart entre ce que A pense et ce que B vit).

Réutiliser `lib/sosmeet/coherence.ts` pour un indice de sincérité par partenaire (optionnel).

### La carte (`lib/sosmeet/couple/report.ts`)
`buildCoupleReport(answersA, answersB)` → `{ accords[], frictions[], malentendus[], rituels[] }` :
- **accords** : dimensions où A et B sont proches ET positifs.
- **frictions** : dimensions où les deux sont bas, ou très éloignés.
- **malentendus** : fort écart entre la perception de l'un et le vécu de l'autre.
- **rituels** : 3-5 exercices choisis selon les 2-3 frictions principales (banque de rituels à écrire
  avec Julia, voix SOS Shine).

---

## 4. FICHIERS À CRÉER (piste couple — restent dans ces dossiers)

```
app/sos-meet/couple/
  page.tsx + CoupleClient.tsx        # DÉJÀ LÀ (landing concept). À enrichir : bouton « Créer notre duo ».
  duo/ (page + client)               # créer/rejoindre un duo, obtenir/coller le code d'invitation
  questionnaire/ (page + client)     # le questionnaire couple (stepper, comme le solo)
  carte/ (page + client)             # la carte de la relation + rituels
app/api/sosmeet/couple/
  create/route.ts                    # crée un duo + invite_code (authed)
  join/route.ts                      # rejoint via invite_code (authed)
  answers/route.ts                   # enregistre les réponses d'un partenaire (authed)
  report/route.ts                    # génère/retourne la carte quand les deux ont fini (authed)
lib/sosmeet/couple/
  questionnaire.ts                   # banque de questions couple
  report.ts                          # buildCoupleReport()
supabase/migrations/XXXX_sosmeet_couple.sql
```

---

## 5. RÈGLES DE PARALLÉLISME (pour ne pas entrer en collision avec le parcours solo)

Le parcours **solo** (autre session) travaille sur : `app/sos-meet/{profil,questionnaire,decouverte}`,
`app/api/sosmeet/{me,questionnaire,discover,interests,matches,messages}`, `lib/sosmeet/{essentiel,
matching}.ts`, et les tables `sosmeet_profiles/interests/matches/messages`.

**Le parcours couple NE touche PAS** à ces fichiers/tables. Il reste dans `*/couple/*`,
`lib/sosmeet/couple/*`, `api/sosmeet/couple/*`, tables `sosmeet_couple*`.

**Fichiers partagés — coordonner avant d'éditer :**
- `app/sos-meet/SosMeetClient.tsx` (l'accueil à deux portes) — **propriété du parcours solo** ; la porte
  couple pointe déjà vers `/sos-meet/couple`, rien à y changer côté couple.
- `app/sos-meet/layout.tsx` (polices/charte) — partagé, ne pas modifier.
- `lib/sosmeet/coherence.ts` — réutilisable en lecture ; si besoin d'y ajouter des règles couple,
  **le signaler** (éviter d'éditer en même temps).

**Toujours** `git fetch` + `git rebase origin/claude/build-sos-shine-v1-LaIX0` avant de pousser.
Même branche, même charte couture (noir/grenat, Bodoni/Jost). Voix de Julia. RGPD/+18.

---

## 6. PREMIÈRE ÉTAPE RECOMMANDÉE (couple)
1. Migration `sosmeet_couple*` + route `create`/`join` (le duo + le lien d'invitation).
2. Le **questionnaire couple** (banque + stepper) — prioriser les questions avec Julia.
3. La **carte** (`buildCoupleReport`) + la page `carte/`.
4. La banque de **rituels de re-rencontre** (avec Julia, voix SOS Shine).

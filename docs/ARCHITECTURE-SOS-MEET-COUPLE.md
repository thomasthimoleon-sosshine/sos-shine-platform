# ARCHITECTURE · SOS MEET COUPLE « Se retrouver »

> Diagnostic et reconstruction relationnelle. Deux partenaires répondent séparément, l'équipe
> qualifie chacun manuellement, un moteur croise les réponses et rend une carte des failles
> assortie d'un plan de retrouvailles.
>
> Ce document couvre **l'architecture, le schéma de base et le flux complet**. Les modules
> (questionnaire, moteur, livrable, bibliothèque) sont détaillés au fur et à mesure.
> Il complète `PROMPT-MAITRE-SOS-MEET.md` et remplace la partie technique de
> `PROMPT-COUPLE-SOS-MEET.md`, dont le périmètre était bien plus léger.

---

## 0. DÉCISION DE STACK (à valider, elle conditionne tout le reste)

La stack proposée au brief (Prisma, Clerk, NestJS, S3, Shadcn/ui) **n'est pas retenue**, et ce
n'est pas un détail d'implémentation. Voici pourquoi, point par point.

| Proposé | Retenu | Raison |
|---|---|---|
| Clerk / NextAuth | **Supabase Auth** (existant) | 159 fichiers de la plateforme authentifient déjà via `auth.users`. Une décision produit déjà validée dit : « le compte SOS Meet **est** un compte SOS Shine ». Clerk créerait une seconde identité, et un couple pourrait exister sous deux comptes différents du même humain. |
| Prisma + PostgreSQL | **Supabase Postgres** (existant) | La sécurité de SOS Meet repose sur **RLS fermée partout** : aucune policy `anon`/`authenticated`, tout passe par des routes serveur en service-role. Prisma court-circuiterait ce modèle et rendrait la confidentialité entre partenaires beaucoup plus difficile à garantir. |
| NestJS | **Next.js API Routes** (existant) | Un second serveur à déployer, à sécuriser et à maintenir, sans bénéfice ici. Le déploiement Vercel est déjà en place. |
| S3 / Cloudflare R2 | **Supabase Storage** (existant) | Le bucket privé `sosmeet-photos` fonctionne déjà avec le même modèle d'autorisation. Ajouter S3 dupliquerait la gestion des accès. |
| Shadcn/ui | **Charte couture maison** | SOS Meet a une identité écrite (Bodoni Moda + Jost, noir et grenat). Shadcn imposerait une esthétique générique qu'il faudrait combattre à chaque composant. |

Ce qui **est** retenu du brief : Next.js App Router, TypeScript, l'approche mobile-first, et
l'exigence d'une architecture qui tient la charge.

**Ce qu'il faut valider avant d'écrire le moteur énergétique** : le calcul Human Design et
l'astrologie exigent des positions planétaires de qualité éphéméride. La référence du domaine est
la Swiss Ephemeris. Ses portages JavaScript ont des contraintes (binaires natifs mal supportés en
serverless, licences à vérifier). Je dois tester les options réellement dans le bac à sable avant
de m'engager. Voir §6.C.

---

## 1. LE FLUX COMPLET DU COUPLE

```
   PARTENAIRE A                 SYSTÈME                    PARTENAIRE B
        │                          │                             │
  1 ────┤ crée le duo              │                             │
        │  ──────────────────────► │ génère invite_code          │
        │                          │ statut: INVITATION_ENVOYEE  │
        │ ◄──── lien d'invitation  │                             │
        │                                                        │
  2     │  ═══ transmet le lien (hors plateforme) ══════════════► │
        │                          │ ◄─────────── rejoint le duo  │
        │                          │ statut: DUO_FORME            │
        │                          │                              │
  3 ────┤ questionnaire            │            questionnaire ────┤
        │  (sauvegarde auto)       │       (sauvegarde auto)      │
        │  ──────────────────────► │ ◄─────────────────────────── │
        │                          │ chacun scellé à la fin       │
        │                          │ statut: QUESTIONNAIRES_COMPLETS
        │                          │                              │
  4     │            ÉQUIPE SOS SHINE (admin)                     │
        │            lit les deux questionnaires                  │
        │            attribue 1 profil sur 4 à chacun             │
        │            statut: PROFILAGE_VALIDE                     │
        │                          │                              │
  5     │            MOTEUR (asynchrone)                          │
        │            A. croisement des réponses                   │
        │            B. couches énergétiques                      │
        │            C. synthèse + plan                           │
        │            statut: DIAGNOSTIC_PRET                      │
        │                          │                              │
  6 ────┤ ◄──── la carte ──────────┤ ────── la carte ───────────► │
        │       + bibliothèque débloquée selon les failles        │
```

### Les statuts, et ce qui les fait avancer

| Statut | Signification | Transition déclenchée par |
|---|---|---|
| `INVITATION_ENVOYEE` | A a créé le duo, B n'a pas rejoint | A crée le duo |
| `DUO_FORME` | Les deux comptes sont liés | B saisit le code |
| `EN_COURS` | Au moins un questionnaire commencé | première réponse enregistrée |
| `ATTENTE_PARTENAIRE` | Un seul a terminé | un partenaire scelle son questionnaire |
| `QUESTIONNAIRES_COMPLETS` | Les deux ont scellé | second scellement |
| `PROFILAGE_EN_COURS` | L'équipe a ouvert le dossier | premier profil attribué |
| `PROFILAGE_VALIDE` | Les deux profils sont posés et validés | validation du second profil |
| `CALCUL_EN_COURS` | Le moteur tourne | déclenchement automatique |
| `DIAGNOSTIC_PRET` | La carte est lisible par les deux | fin du calcul |
| `ARCHIVE` | Le duo a été dissous ou les données purgées | demande utilisateur ou RGPD |
| `SUSPENDU_VIGILANCE` | Signaux de danger détectés, voir §7 | moteur ou équipe |

Un statut ne recule jamais tout seul. Seule l'équipe peut renvoyer un dossier en arrière, et
l'action est tracée.

---

## 2. LES QUATRE INVARIANTS

Ce sont les règles qu'aucun module n'a le droit de casser. Elles priment sur toute fonctionnalité.

**I1. Un partenaire ne voit jamais les réponses brutes de l'autre.**
Techniquement : aucune route ne renvoie `answers` d'un autre `user_id`. La carte ne contient que
des valeurs **dérivées** (scores, écarts, libellés choisis dans un catalogue fermé). Les réponses
en texte libre ne sortent **jamais** de la base vers l'autre partenaire, sous aucune forme, même
reformulée. Elles servent uniquement au profilage humain et à la modération.

**I2. Le questionnaire se scelle.**
Une fois scellé, un partenaire ne peut plus modifier ses réponses. Sans cela, celui qui répond en
second pourrait ajuster après coup, et le diagnostic ne vaudrait rien.

**I3. Toute lecture admin d'un questionnaire est journalisée.**
Qui, quand, quel couple, quelle action. C'est une exigence RGPD sur données sensibles, et c'est
aussi ce qui protège l'équipe.

**I4. Le produit n'est pas un thérapeute et ne le simule pas.**
Ni diagnostic clinique, ni injonction. Et surtout : voir §7 sur la détection de danger.

---

## 3. SCHÉMA DE BASE DE DONNÉES

Préfixe `sosmeet_couple*`. RLS fermée partout, accès via routes serveur en service-role, comme le
reste de SOS Meet. Aucune table du parcours solo n'est touchée.

```sql
-- ════════════════════════════════════════════════════════════════════
-- LE DUO
-- ════════════════════════════════════════════════════════════════════
create table public.sosmeet_couples (
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
create unique index idx_couples_invite on public.sosmeet_couples (invite_code);
create index idx_couples_a on public.sosmeet_couples (partner_a);
create index idx_couples_b on public.sosmeet_couples (partner_b);
create index idx_couples_status on public.sosmeet_couples (status);

-- Une personne ne peut avoir qu'un seul duo actif à la fois.
create unique index idx_couples_actif_a on public.sosmeet_couples (partner_a)
  where status <> 'ARCHIVE';
create unique index idx_couples_actif_b on public.sosmeet_couples (partner_b)
  where partner_b is not null and status <> 'ARCHIVE';

-- ════════════════════════════════════════════════════════════════════
-- LES RÉPONSES (une ligne par partenaire, jamais lisible par l'autre)
-- ════════════════════════════════════════════════════════════════════
create table public.sosmeet_couple_answers (
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
create index idx_couple_answers_couple on public.sosmeet_couple_answers (couple_id);

-- ════════════════════════════════════════════════════════════════════
-- DONNÉES DE NAISSANCE (couches énergétiques) · art. 9 RGPD, consentement dédié
-- Séparées des réponses : on peut les purger sans détruire le diagnostic.
-- ════════════════════════════════════════════════════════════════════
create table public.sosmeet_couple_birth (
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
create table public.sosmeet_couple_profile_types (
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
create table public.sosmeet_couple_dyads (
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
create table public.sosmeet_couple_profiling (
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

create table public.sosmeet_couple_audit (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.sosmeet_couples(id) on delete cascade,
  actor_id   uuid references auth.users(id),
  action     text not null,   -- 'lecture_questionnaire' | 'profil_attribue' | 'statut_change' | ...
  target     text,            -- user_id concerné, statut visé, etc.
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index idx_couple_audit_couple on public.sosmeet_couple_audit (couple_id, created_at desc);

-- ════════════════════════════════════════════════════════════════════
-- LE DIAGNOSTIC
-- ════════════════════════════════════════════════════════════════════
create table public.sosmeet_couple_reports (
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
create table public.sosmeet_couple_library (
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

create table public.sosmeet_couple_library_progress (
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
```

### Pourquoi ce découpage

**`open_answers` séparé de `answers`.** Le texte libre est la donnée la plus dangereuse du système :
il contient des phrases entières, reconnaissables, parfois accusatrices. Le séparer permet de le
purger indépendamment, et rend impossible une fuite par inadvertance dans un `select *` mal cadré.

**`sosmeet_couple_birth` séparé.** Date, heure et lieu de naissance ne servent qu'aux couches
énergétiques. Un couple peut refuser cette couche et avoir quand même son diagnostic. La table
séparée rend ce refus techniquement propre.

**`profile_types` en table et non en enum.** Les 4 profils arrivent plus tard. Une table permet de
les créer, les renommer et les décrire sans migration. Un cinquième profil un jour ne coûtera rien.

**`reports` versionné.** Refaire la carte dans six semaines pour mesurer l'évolution est un usage
prévu. `engine_version` permet de savoir avec quel moteur un ancien diagnostic a été produit.

---

## 4. LE CODE D'INVITATION

Point de sécurité sous-estimé : ce code donne accès à un espace intime.

- Format : 8 caractères, alphabet sans ambiguïté (`ABCDEFGHJKMNPQRSTUVWXYZ23456789`, ni `I`, ni `O`,
  ni `0`, ni `1`), tiré avec un générateur cryptographique. Environ 30 bits d'entropie.
- **Expire** au bout de 7 jours. Un code mort ne traîne pas dans une conversation WhatsApp.
- **Usage unique** : consommé dès que B rejoint.
- **Limitation de débit** sur la route `join` par IP et par compte, sinon le code est énumérable.
- A peut **révoquer** et régénérer son code tant que B n'a pas rejoint.
- Le code n'apparaît **jamais** dans une URL indexable, et la page qui l'affiche est `noindex`.

---

## 5. ARBORESCENCE

```
app/sos-meet/couple/
  page.tsx + CoupleClient.tsx        # landing concept (existe déjà)
  duo/                               # créer ou rejoindre le duo, état d'avancement
  questionnaire/                     # le stepper, sauvegarde auto, scellement
  attente/                           # « ton partenaire n'a pas fini », pédagogie de l'attente
  carte/                             # le livrable
  bibliotheque/
    page.tsx                         # thèmes débloqués selon les failles
    [slug]/page.tsx                  # un contenu

app/api/sosmeet/couple/
  duo/route.ts                       # POST créer · GET état · DELETE dissoudre
  join/route.ts                      # POST rejoindre par code (rate-limité)
  answers/route.ts                   # GET reprise · PATCH sauvegarde auto · POST sceller
  birth/route.ts                     # POST données de naissance + consentement
  report/route.ts                    # GET la carte (jamais de réponses brutes)
  library/route.ts                   # GET contenus débloqués · POST marquer fait

app/admin/sosmeet/couples/
  page.tsx                           # file d'attente des dossiers à profiler
  [id]/page.tsx                      # les deux questionnaires + attribution des profils
app/api/admin/sosmeet/couples/
  route.ts                           # liste (admin)
  [id]/route.ts                      # détail, journalise la lecture (I3)
  [id]/profile/route.ts              # attribuer et valider un profil
  [id]/status/route.ts               # forcer un statut, tracé

lib/sosmeet/couple/
  types.ts                           # statuts, dimensions, formes du rapport
  questionnaire.ts                   # la banque de questions couple
  crossing.ts                        # §6.A  croisement des réponses
  energetics/
    numerology.ts                    # pur, déterministe, aucune dépendance
    humandesign.ts                   # dépend de l'éphéméride
    astrology.ts                     # synastrie et composite
    ephemeris.ts                     # la couche à valider (§0)
  synthesis.ts                       # §6.C  failles classées, leviers, points d'or
  library.ts                         # règles de déblocage
  safety.ts                          # §7  détection de danger
  invite.ts                          # génération et validation du code

supabase/migrations/XXXX_sosmeet_couple.sql
```

---

## 6. LE MOTEUR

### A. Croisement des réponses

Le questionnaire pose **deux natures de questions** sur chaque dimension. C'est ce qui rend le
diagnostic intéressant, et c'est le cœur de l'algorithme.

- **Question « moi »** : comment JE vis cette dimension. Note `self`.
- **Question « l'autre »** : comment je crois que MON PARTENAIRE la vit. Note `perceived`.

D'où trois métriques par dimension, et non une seule :

```
divergence(d)  = |A.self(d) − B.self(d)|
     Les deux ne vivent pas la même relation.

malentendu(d)  = max( |A.perceived_of_B(d) − B.self(d)| ,
                      |B.perceived_of_A(d) − A.self(d)| )
     L'un se trompe sur ce que l'autre vit. C'est la métrique la plus précieuse :
     un malentendu se répare par une conversation, une divergence demande un arbitrage.

detresse(d)    = 100 − moyenne( A.self(d), B.self(d) )
     Les deux souffrent sur cette dimension, même s'ils sont d'accord.
```

Classification :

| Condition | Verdict |
|---|---|
| `divergence` faible et `detresse` faible | **Point d'or**, à nommer et à protéger |
| `malentendu` fort et `divergence` faible | **Malentendu**, le plus réparable |
| `divergence` forte | **Faille**, les deux ne vivent pas la même histoire |
| `detresse` forte, `divergence` faible | **Zone d'usure**, accord dans la difficulté |

Score d'impact, qui donne l'ordre du livrable :

```
impact(d) = poids(d) × ( 0.45·divergence + 0.35·detresse + 0.20·malentendu ) × asymetrie(d)
```

`asymetrie` majore les cas où un seul des deux souffre : c'est là que se logent les ruptures qui
surprennent celui qui n'avait rien vu.

### B. Couches énergétiques

Elles **enrichissent** la lecture, elles ne la fondent pas. Règle produit, à tenir dans le code
comme dans le texte : **une faille n'est jamais détectée par l'astrologie**. Les failles viennent
des réponses. Les couches donnent un langage pour les nommer et éclairent des tempéraments.

- **Numérologie** : calcul pur, déterministe, aucune dépendance externe. Chemin de vie, année
  personnelle. Se code en une journée et se teste exactement.
- **Human Design** : exige les positions planétaires à la naissance **et** au point de conception
  (arc solaire de 88 degrés avant la naissance). Sans éphéméride, impossible.
- **Astrologie** : synastrie (aspects entre les deux thèmes) et composite (thème du couple).
  Exige la même éphéméride.

**Dégradation gracieuse, prévue dès le schéma** : sans heure de naissance, l'ascendant, les maisons
et l'autorité HD deviennent indéterminés. Le système doit alors **le dire** au lieu d'inventer. Le
champ `time_accuracy` sert exactement à ça, et le livrable affiche la limite plutôt que de la
masquer. C'est ce qui sépare un produit sérieux d'un générateur de texte.

Le calcul tourne **une fois**, en tâche asynchrone, et le résultat est figé dans
`reports.energetics`. On ne recalcule pas une éphéméride à chaque affichage de page.

### C. Synthèse

Assemble le tout :
- **Carte des failles** classées par `impact`, chacune avec son verdict et sa métrique dominante.
- **Dynamique de la dyade** : lue dans `sosmeet_couple_dyads` selon les deux profils attribués.
- **Leviers prioritaires** : les 3 failles les plus hautes, traduites en actions.
- **Points d'or** : ce qui tient. Toujours présenté **avant** les failles. Un couple qui ouvre son
  diagnostic sur ses fractures le referme.

---

## 7. VIGILANCE (non négociable)

Un diagnostic de couple va rencontrer des situations d'emprise, de contrôle, ou de violence. Un
produit qui répondrait à ça par un « rituel de reconnexion » ferait du mal.

Le questionnaire comporte donc des items de vigilance (peur, contrôle des fréquentations ou de
l'argent, humiliation, contrainte sexuelle). Au-delà d'un seuil, chez **un seul** des deux :

1. Le couple passe en `SUSPENDU_VIGILANCE`. Aucune carte n'est publiée.
2. La personne concernée voit, **seule et sans que l'autre le sache**, un écran sobre proposant des
   ressources d'aide réelles (numéros nationaux, associations).
3. L'équipe est alertée dans l'admin.
4. Rien de tout cela n'apparaît jamais dans le livrable commun, ni dans aucune vue accessible à
   l'autre partenaire.

Cette règle prime sur toutes les autres fonctionnalités.

---

## 8. PLAN DE DÉVELOPPEMENT

**MVP, le duo qui tient debout**
Migration, code d'invitation, création et jonction du duo, questionnaire avec sauvegarde auto et
scellement, écran d'attente, admin de profilage avec journalisation. Pas encore de moteur : le
livrable est produit à la main par l'équipe. Objectif : valider le parcours et la qualité du
questionnaire sur de vrais couples, avant d'automatiser quoi que ce soit.

**V1, le moteur**
Croisement des réponses (§6.A), numérologie, synthèse, carte publiée automatiquement, bibliothèque
avec déblocage selon les failles, module de vigilance (§7).

**V2, les couches lourdes**
Éphéméride validée, Human Design, synastrie et composite, PDF, refonte de la carte à six semaines
pour mesurer l'évolution, permanences live.

---

## 9. CE QUI ME MANQUE POUR ALLER PLUS LOIN

1. **Les 4 profils.** Le schéma les accueille sans migration, mais la dynamique de dyade (16
   combinaisons) ne peut pas s'écrire sans eux.
2. **Le questionnaire couple.** Les dimensions sont proposées ci-dessus, les questions restent à
   écrire, dans la voix de Julia, avec la double nature « moi » et « l'autre ».
3. **Le modèle économique.** Gratuit comme le solo au lancement, ou payant ? Cela change l'onboarding.
4. **Qui fait le profilage** et sous quel délai. C'est le goulot d'étranglement du produit : chaque
   couple demande du temps humain.
5. **La banque de rituels et la bibliothèque**, à écrire avec Julia.

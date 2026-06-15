# AUDIT STRUCTUREL — SOS SHINE PLATFORM
**Date :** 15 juin 2026  
**Branche auditée :** `claude/enhance-quiz-ux-1OvNd`  
**Périmètre :** Lecture seule — code source + migrations SQL + configuration

---

## 1. CARTOGRAPHIE GÉNÉRALE

### Structure de l'application

L'application est un monorepo **Next.js 15 (App Router)** hébergé sur Vercel, avec Supabase comme backend.

```
sos-shine-platform/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/              # 20+ sections d'administration (founder-only)
│   ├── api/                # 65 route handlers API
│   ├── dashboard/          # 18 sections membres authentifiés
│   ├── encyclopedie/       # Contenu public + protocoles
│   ├── quiz/               # Quiz landing V2
│   ├── quiz-approfondi/    # Quiz V3 (12 dimensions)
│   ├── protocole/[slug]/   # Pages protocoles (public)
│   ├── event/[id]/         # Événements publics
│   ├── ceremonie/          # Landing cérémonie plein air
│   └── (auth, blog, etc.)  # Pages publiques diverses
├── components/             # 25 composants partagés
├── lib/                    # Utilitaires, moteurs, services
│   ├── stripe/             # Config centralisée (config.ts)
│   ├── email-templates/    # 39 templates (quiz-v2, automated, seeds)
│   ├── crm/                # CRM (auth, enroll, resend, supabase-admin)
│   └── XpEngine.ts         # Moteur XP V2 (anti-farming)
├── supabase/migrations/    # 40+ migrations SQL chronologiques
└── middleware.ts           # Contrôle d'accès global (route guard)
```

### Pages publiques (sans authentification)

`/` `/login` `/signup` `/encyclopedie/*` `/contact` `/cgv` `/confidentialite`  
`/mentions-legales` `/notre-histoire` `/signature-emotionnelle/*` `/compte-inactif`  
`/livre-sos-shine` `/livre-supers-pouvoirs` `/forgot-password` `/reset-password`  
`/inscription-confirmee` `/parents-enfants` `/success` `/cancel` `/blog/*`  
`/rejoindre/*` `/quiz` `/ceremonie/*` `/auth/*` `/api/*` `/protocole/*`  
`/event/*` `/quiz-approfondi`

### Pages membres (authentification requise)

`/dashboard/*` (18 sections) et `/mon-chemin` `/onboarding`

### API Routes (65 handlers)

| Namespace | Endpoints | Rôle |
|-----------|-----------|------|
| `/api/stripe/*` | 9 routes | Checkout, webhook, portal, verify, upgrade |
| `/api/crm/*` | 10 routes | Contacts, séquences, envoi, tracking clicks/opens |
| `/api/cron/*` | 6 routes | Emails auto, quiz-abandon, séquences, subscriptions, push |
| `/api/quiz-v2/*` | 4 routes | Save, complete, email-capture, track |
| `/api/quiz-v3/*` | 2 routes | Generate (IA), save |
| `/api/admin/*` | 8 routes | Blog, membres, visits, candidatures, etc. |
| `/api/track/*` | 4 routes | Visit, duration, AB-test visit/convert |
| `/api/bots/*` | 4 routes | Auto, post, schedule, seed |
| `/api/events/*` | 1 route | Register |
| `/api/push/*` | 3 routes | Subscribe, send, cron |
| `/api/*` divers | 9 routes | Feed, geocode, notify, PDF, signature-lead, etc. |

---

## 2. BASE DE DONNÉES SUPABASE

### Vue d'ensemble

**65+ tables** organisées en 8 domaines fonctionnels. Toutes les tables ont RLS activé (sauf exceptions signalées ci-dessous).

### Domaine : Utilisateurs et profils

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `profiles` | id, role, full_name, avatar_url, bio, birth_date, plan, plan_status, subscription_id, onboarding_completed | Miroir de `auth.users`. `role` : `user` / `admin_content` / `admin_support` / `founder` |
| `subscriptions` | user_id, plan, status, stripe_subscription_id, stripe_customer_id, current_period_start/end | Source de vérité abonnements |
| `user_xp` | user_id, total_xp, level (1-10), shines_given, shines_received | Gamification — niveaux exponentiels |
| `user_progress` | user_id, douleur_id, step_index, completed_at | Progression dans les protocoles encyclopédie |
| `encyclopedia_progress` | user_id, module_id, best_score_percentage, xp_awarded | Boss Quests encyclopédie |
| `user_badges` | user_id, badge_id, awarded_at | ⚠️ RLS à vérifier |
| `user_action_counters` | user_id, action_type, count | ⚠️ RLS à vérifier |
| `daily_user_actions` | user_id, action_type, action_date, count | Anti-farming — caps quotidiens |

### Domaine : Contenu

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `douleurs` | slug, title, description, step_count, tags, related_slugs | Modules encyclopédie (protocoles) |
| `douleur_steps` | douleur_id, step_index, title, video_url, audio_url, cover_image_url | Étapes de chaque protocole |
| `posts` | user_id, content, media_url, media_type, likes_count, comments_count | Fil communautaire |
| `blog_articles` | slug, title, content, published_at, douleur_link | Articles blog |
| `resources` | title, category, file_url, premium_only | Librairie de ressources |

### Domaine : Social et messagerie

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `shine_connections` | sender_id, receiver_id, status, created_at | Graphe social (clé pour matching futur) |
| `private_messages` | sender_id, receiver_id, content, read_at | Messagerie 1-à-1 |
| `messages` | room_id, user_id, content, created_at | Chat de groupe |
| `signaling_rooms` | room_id, participants, created_at | WebRTC signaling (conférences audio/vidéo) |

### Domaine : Quiz

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `signature_leads` | email, first_name, quiz_version, scores, archetype, session_id | V1 legacy |
| `quiz_v2_responses` | session_id, email, responses (JSONB), scores (JSONB), dominant_dimension, secondary_dimension, completed_at | 10 dimensions → 4 axes → archétype |
| `quiz_v3_responses` | session_id, email, birthdate, answers (JSONB), profile (JSONB), result_text, top_protocol_slug, completed_at | 12 dimensions → texte IA personnalisé |
| `protocols` | slug, title, dimension_weights (JSONB), status, release_date | Protocoles associés aux archetypes |
| `protocol_notifications` | user_email, quiz_response_id, protocol_id | Notifs "protocole bientôt disponible" |

### Domaine : Paiements / Événements

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `ceremonie_reservations` | prenom, nom, email, status (pending/paid/refunded/cancelled), stripe_session_id | ⚠️ `FOR UPDATE USING (true)` — trop permissif |
| `events` | title, date, location, capacity, registered_count | Événements numériques |
| `physical_events` | title, date, location, price_cents, stripe_payment_link | Événements physiques avec paiement |
| `group_events` | id, title, host_id, participants | Événements de groupe membres |

### Domaine : CRM / Emails

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `crm_contacts` | email, first_name, status, tags (JSONB), quiz_score, source | Hub CRM |
| `crm_sequences` | name, trigger, steps_count, active | Séquences email automatisées |
| `crm_sequence_steps` | sequence_id, step_number, delay_days, template_id | Étapes de séquences |
| `crm_sequence_enrollments` | contact_id, sequence_id, current_step, enrolled_at, completed_at | Suivi individuel |
| `crm_campaign_events` | contact_id, event_type (sent/opened/clicked), metadata | Tracking engagement |
| `email_templates` | name, subject, html_content, category | Templates base de données |

### Domaine : Analytics / A/B

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `site_visits` | user_id, page_path, referrer, device_type, session_id, utm_source/medium/campaign/content, time_on_page_seconds, country | Analytics propriétaires |
| `ab_test_config` | test_name, variants (JSONB), weights (JSONB), active | Configuration A/B tests |
| `nps_responses` | user_id, score, comment, created_at | NPS Surveys |

### Domaine : Gamification avancée

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `user_streaks` | user_id, current_streak, longest_streak, last_active_date | Streaks de connexion |
| `user_affiliation` | user_id, referral_code, referred_count, earnings_cents | Programme d'affiliation |
| `retraits` | user_id, amount_cents, status, iban_last4 | Retraits affiliés |

### Tables "fantômes" identifiées

Les tables suivantes ont des références dans le code mais leur RLS n'a pas été validé dans les migrations :
- `user_badges` — pas de migration RLS dédiée trouvée
- `user_action_counters` — pas de migration RLS dédiée trouvée
- `waitlist_entries` — référencée dans `/api/waitlist` sans migration visible

### Données par utilisateur

Un utilisateur authentifié possède des données dans : `profiles`, `subscriptions`, `user_xp`, `user_progress`, `encyclopedia_progress`, `daily_user_actions`, `user_streaks`, `user_badges`, `user_action_counters`, `shine_connections`, `private_messages`, `posts`, `user_affiliation`.

---

## 3. AUTH ET PROFILS

### Flux d'authentification

```
Visiteur → /quiz (public) → Quiz V2/V3 → Email capturé en mid-quiz
                ↓
         /signup → Supabase Auth (email/password)
                ↓
         /auth/callback → Callback OAuth/email confirm → /onboarding
                ↓
         /dashboard → Gate: subscription check via FeatureGate.tsx
```

### Middleware de protection (`middleware.ts`)

Toutes les routes sont protégées par défaut. Une allowlist de routes publiques est maintenue manuellement dans `middleware.ts:44`. Si une route oubliée n'est pas dans la liste, elle redirige vers `/login` (comportement fail-closed, sûr).

**Risque de maintenance :** La liste grandit avec chaque nouvelle page publique. Toute nouvelle route doit être ajoutée manuellement — aucun mécanisme automatique.

### Structure du profil (`profiles`)

```typescript
{
  id: UUID,                    // = auth.users.id
  role: 'user' | 'admin_content' | 'admin_support' | 'founder',
  full_name: string,
  avatar_url: string | null,
  bio: string | null,
  birth_date: date | null,     // ajouté migration 20260328
  plan: 'essential' | 'serenite' | 'premium' | null,
  plan_status: string | null,  // 'active' | 'trialing' | 'past_due' | 'canceled'
  subscription_id: string | null,
  onboarding_completed: boolean,
  created_at: timestamptz
}
```

### Exposition publique des profils

- `/dashboard/membre/[id]` — page profil publique des membres (accessible à tous les membres authentifiés)
- `shine_connections` expose la liste des connexions
- `private_messages` expose les messages entre 2 utilisateurs

**Absent :** Aucun champ `profile_visibility` sur `profiles`. Impossible de savoir si un utilisateur a consenti à la visibilité de son profil dans un contexte de matching. Ce champ est requis avant tout déploiement de fonctionnalité "rencontre".

### Admin et roles

Les fonctions `is_admin()` et `is_founder()` sont des Stored Procedures Supabase utilisées dans les politiques RLS. Le rôle `founder` bypass la plupart des restrictions. Pas de 2FA obligatoire pour les comptes admin.

---

## 4. MOTEUR QUIZ ET MATCHING

### Quiz V2 — 10 dimensions → 4 axes → Archétype

**Accès :** `/quiz` (public, `app/quiz/`)

**Dimensions scorées (10 axes) :**  
`rejet`, `abandon`, `humiliation`, `trahison`, `injustice`, `emotion`, `mode`, `zone`, `dominant_dimension`, `secondary_dimension`

**4 axes synthétiques :**
1. **Blessure** : Rejet / Abandon / Humiliation / Trahison / Injustice (5 archétypes)
2. **Émotion** : Mode de régulation émotionnelle dominant
3. **Mode** : Style relationnel et d'existence
4. **Zone** : Domaine de vie prioritairement impacté

**Pipeline :**
```
15 questions → scores JSONB → dominant_dimension + secondary_dimension
→ email capturée Q5 → séquence email 19 templates (J0→J15)
→ page résultat → protocole recommandé
→ CTA inscription
```

**Tables :** `quiz_v2_responses`, `signature_leads` (legacy V1), `protocols`, `protocol_notifications`

**RLS V2 :**
- INSERT : `WITH CHECK (true)` — ouvert à tous (anonyme OK)
- UPDATE : `USING (session_id = session_id)` — **⚠️ tautologie** : cette policy ne filtre rien, tout le monde peut mettre à jour n'importe quelle réponse par session_id

### Quiz V3 — 12 dimensions → Résultat IA personnalisé

**Accès :** `/quiz-approfondi` (public depuis fix middleware)

**12 dimensions :**  
`ARCH`, `MF`, `PAR`, `COND`, `ATT`, `SOMA`, `CORPS`, `ENF`, `SPI`, `ENE`, `TGEN`, `PHASE`

**Pipeline :**
```
Formulaire court → POST /api/quiz-v3/generate (appel LLM)
→ Texte résultat personnalisé + top_protocol_slug
→ Sauvegarde quiz_v3_responses
→ Email de résultat
```

**RLS V3 :**
- UPDATE : `USING (true)` — **⚠️ permissif** : tout le monde peut modifier toute réponse V3

### Système de protocoles

`protocols` contient la liste des protocoles avec `dimension_weights` (JSONB) — un vecteur de poids par dimension permettant de scorer la correspondance entre le profil quiz et chaque protocole. La recommandation est calculée côté client/API en comparant le vecteur de l'utilisateur aux poids des protocoles.

### Système XP (`lib/XpEngine.ts`)

**Niveaux (1-10) avec seuils exponentiels :**

| Niveau | Nom | Seuil XP |
|--------|-----|----------|
| 1 | Étincelle | 0 |
| 2 | Lueur | 50 |
| 3 | Flamme | 150 |
| 4 | Lumière | 350 |
| 5 | Éclat | 700 |
| 6 | Rayonnement | 1 200 |
| 7 | Aurore | 2 000 |
| 8 | Soleil | 3 000 |
| 9 | Étoile | 4 000 |
| 10 | Diamant | 1 000 000 (max théorique) |

**Actions et récompenses :**

| Action | XP de base | Cap quotidien |
|--------|-----------|---------------|
| Publier vidéo/audio | 300 XP | 1/jour |
| Publier texte | 150 XP | 2/jour |
| Commenter | 50 XP | 5/jour |
| Donner un Shine | 15→10→5 XP | 3/jour (dégressif) |
| Consommer un média | 25 XP | 4/jour |
| Consommer un article | 20 XP | 2/jour |
| Boss Quest (encyclopédie) | 1000 + (étapes × 200) XP | retake = delta seulement |

**Anti-farming :** RPC atomique `check_and_increment_daily_action` + table `daily_user_actions` (par user × action × date). Les re-tentatives de quiz encyclopédie ne donnent que le delta d'amélioration.

**Matching futur :** Le niveau XP est le seul signal de maturité/engagement actuellement disponible. Il sera un critère de filtrage pertinent pour les rencontres (éviter les profils inactifs).

---

## 5. STRIPE ET PAIEMENT

### Plans disponibles

| Plan | Prix | Durées | Payment Link |
|------|------|--------|--------------|
| **Essentielle** | 9,90€/mois | Mensuel uniquement | `3cIcMXdu...` |
| **Sérénité** | 29,90€/mois (-10% trim. / -20% sem. / -30% annuel) | Mensuel, 3m, 6m, 12m | `4gM6oz4X...` (mensuel) |
| ~~Premium~~ | ~~99,90€~~ | Archivé — non vendu | — |

> **Note :** Le plan "49,90€" mentionné parfois dans des communications n'existe PAS dans le code. Il n'y a aucun `STRIPE_PRICE_*` ni payment link à ce montant. Ne pas créer ce produit.

### Flux de paiement

```
Membre clique CTA → /dashboard/tarifs ou popup FeatureGate
  → GET /api/stripe/checkout (crée Stripe Checkout Session)
  → OU redirection directe vers Payment Link buy.stripe.com
  → Stripe traite le paiement
  → POST /api/stripe/webhook (événement checkout.session.completed)
    → update subscriptions SET plan='serenite', status='active'
    → update profiles SET plan='serenite'
    → Email de bienvenue abonnement
  → Redirection /success
```

**Méthodes de détection du plan dans le webhook :**
1. `PRODUCT_TO_PLAN` (6 product IDs hardcodés dans `config.ts`) — fragile si nouveaux produits
2. `detectPlanFromAmount` — fallback si product_id inconnu : ≥ 2000 centimes = sérénité

### Points de fragilité identifiés

1. **Webhook sans idempotence explicite :** L'event `checkout.session.completed` peut déclencher plusieurs fois (retry Stripe). Sans vérification de `stripe_session_id` déjà traité, un double-traitement est possible.

2. **PRODUCT_TO_PLAN hardcodé :** Si un nouveau produit Stripe est créé sans mise à jour de `config.ts`, le webhook tombera sur le fallback `detectPlanFromAmount` — qui peut mal classifier un produit à 29€ one-shot vs abonnement 29,90€/mois.

3. **Pas de gestion plan `premium` en downgrade :** Le code assume que `premium` est archivé mais ne handle pas le cas d'un utilisateur existant sur ce plan qui résilierait.

4. **Portal Stripe :** `/api/stripe/portal` dépend d'un `stripe_customer_id` en base. Si manquant (utilisateur créé avant l'intégration Stripe), le portal génère une erreur 500.

### Portefeuille Stripe actuel

- 6 produits actifs dans `PRODUCT_TO_PLAN`
- 5 payment links actifs dans `PAYMENT_LINKS`
- Coupon waitlist configurable via `STRIPE_WAITLIST_COUPON_ID`

---

## 6. SYSTÈME D'EMAILS

### Infrastructure

**Envoi :** [Resend](https://resend.com) via `lib/crm/resend.ts`  
**Templating :** TypeScript pur (pas de moteur de template externe) — chaque template est une fonction retournant du HTML inline  
**CRM interne :** Tables `crm_contacts`, `crm_sequences`, `crm_sequence_steps`, `crm_sequence_enrollments`

### Inventaire des templates (39 au total)

**Quiz V2 — Séquence abandon + nurturing (19 templates dans `lib/email-templates/quiz-v2/`) :**

| Email | Déclencheur | Objet/Thème |
|-------|-------------|-------------|
| email-01-capture | Saisie email Q5 | Confirmation + accès résultat |
| email-02-result | Complétion quiz | Résultat personnalisé |
| email-03 à email-15 | J+1 à J+13 | Nurturing éducatif (question, histoire, témoignage, argent, temps, repos, bascule, intérieur, doute, raisons, avant-dernier) |
| email-16 (transfert) | J+15 | Transfert vers liste newsletter principale |

**Quiz V3 :** `lib/email-templates/quiz-v3-result.ts` — email résultat unique

**Signature émotionnelle :** `lib/email-templates/signature-result.ts`

**Emails automatisés :** `lib/email-templates/automated-emails.ts` (inclut inscription, abonnement, rappels, winback)

**Seeds base de données :** `lib/email-templates/seeds.ts` (populate `email_templates`)

### 6 Cron jobs d'envoi (`/api/cron/`)

| Cron | Fréquence | Fonction |
|------|-----------|----------|
| `/api/cron/quiz-abandon` | Déclenché sur abandon quiz | Email de relance si email capturé sans complétion |
| `/api/cron/quiz-emails` | Quotidien | Envoie le prochain email de la séquence quiz V2 |
| `/api/cron/emails` | Quotidien | Emails automatisés (inscription J1/J3/J7/J14) |
| `/api/cron/sequences` | Quotidien | Traite les inscriptions CRM en attente d'étape |
| `/api/cron/campaigns` | Ponctuel | Campagnes CRM manuelles |
| `/api/cron/subscriptions` | Quotidien | Rappels renouvellement, alertes paiement échoué |

### Risques email identifiés

1. **⚠️ Double envoi possible :** La séquence quiz V2 (`crm_sequence_enrollments`) et le cron `quiz-emails` opèrent tous deux sur les réponses quiz — sans mécanisme de déduplication croisé visible. Un contact peut recevoir des emails depuis les 2 pipelines.

2. **⚠️ Emails de test hardcodés :** Le code contient des adresses email de test hardcodées (`julialaureau@sosshine.com`, `ttse335@gmail.com`). Ces adresses reçoivent des copies en production — à externaliser en variable d'environnement.

3. **⚠️ Transfert newsletter sans consentement RGPD explicite :** À J+15, le contact quiz est transféré vers la liste newsletter principale. Il n'y a pas de champ `newsletter_consent` ni de mécanisme de double opt-in pour ce transfert. Exposition RGPD.

4. **Tracking opens/clicks :** Pixels de tracking ouverts (`/api/crm/track/open`) et liens redirecteurs (`/api/crm/track/click`) sont implémentés mais leur opt-out n'est pas visible.

---

## 7. SÉCURITÉ ET QUALITÉ

### Endpoints non protégés (appels sans auth)

| Endpoint | Risque | Mitigation actuelle |
|----------|--------|---------------------|
| `POST /api/quiz-v2/save` | Spam / flood de données | Pas de rate limit visible |
| `POST /api/quiz-v3/generate` | Appel LLM non authentifié, coût API | Pas de rate limit visible |
| `POST /api/signature-lead` | Flood base `signature_leads` | `lib/anti-spam.ts` existe (à vérifier) |
| `POST /api/track/visit` | Pollution analytics | Rate limit IP possible en Vercel |
| `POST /api/ceremonie/reserve` | Flood `ceremonie_reservations` | Pas de rate limit visible |

### Politiques RLS problématiques

| Table | Policy | Problème |
|-------|--------|----------|
| `quiz_v2_responses` | `FOR UPDATE USING (session_id = session_id)` | **Tautologie** — filtre non fonctionnel, tout UPDATE autorisé |
| `quiz_v3_responses` | `FOR UPDATE USING (true)` | Tout UPDATE autorisé sans condition |
| `ceremonie_reservations` | `FOR UPDATE USING (true)` | Webhook Stripe peut modifier mais un attaquant aussi |

### Variables d'environnement sensibles requises

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         # Clé admin — utilisée côté serveur uniquement
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ESSENTIAL_MONTHLY
STRIPE_PRICE_SERENITE_MONTHLY
RESEND_API_KEY
OPENAI_API_KEY                    # Quiz V3 génération IA
NEXT_PUBLIC_SITE_URL
```

**Risque :** `SUPABASE_SERVICE_ROLE_KEY` est utilisée dans plusieurs API routes. Si une de ces routes est mal protégée (pas de vérification auth), elle bypass toutes les RLS.

### Code mort / dette technique identifiée

1. **Plan `premium` archivé** mais toujours présent dans tous les types, configs et conditions — fragile à maintenir (oubli facile dans une nouvelle feature)
2. **Quiz V1 (`signature_leads`)** maintenu en parallèle de V2 et V3 — 3 systèmes quiz coexistent
3. **`lib/bots/`** — système de bots (publication automatique de contenu) qui touche `posts`, `messages`, `profiles` — risque de pollution de la base si activé accidentellement en prod
4. **`app/admin/prelaunch/`** — page de pré-lancement probablement obsolète
5. **`app/design-system/`** — page de design system interne (utile mais non protégée explicitement)

### Rate limiting

`lib/anti-spam.ts` existe mais son application n'est pas systématique. Aucun middleware global de rate limiting n'est configuré (ni Vercel Edge Config, ni Redis-based). Points d'entrée publics exposés aux abus.

---

## 8. ANALYSE D'ÉCART VERS LA VISION "RENCONTRE"

La vision "rencontre/matching" vise à permettre à des membres SOS Shine de se trouver, se connecter et potentiellement se rencontrer en fonction de leurs profils archétypaux et de leur niveau d'engagement.

### Ce qui EXISTE déjà

| Composant | Table/Fichier | État |
|-----------|--------------|------|
| Graphe social | `shine_connections` (sender_id, receiver_id, status) | ✅ Complet |
| Messagerie privée | `private_messages` (sender_id, receiver_id, content, read_at) | ✅ Complet |
| Profil public membre | `/dashboard/membre/[id]` | ✅ Fonctionnel |
| Niveau d'engagement | `user_xp.level` (1-10) | ✅ Robuste |
| Archétype | `quiz_v2_responses.dominant_dimension` | ✅ Calculé |
| Compatibilité | `protocols.dimension_weights` (JSONB vectoriel) | ✅ Structuré |
| Géolocalisation technique | `/api/geocode` route + `site_visits.country` | ✅ Partiel |

### Ce qui MANQUE (par ordre de priorité)

| Fonctionnalité | Difficulté | Commentaire |
|----------------|-----------|-------------|
| **1. Champ `profile_visibility`** | 🟢 Facile | Migration + toggle UI. Bloquant RGPD. Requis en premier. |
| **2. Champ `intention`** (amitié / amour / networking) | 🟢 Facile | Colonne `profiles.matching_intention`. Essentiel pour le filtrage. |
| **3. Champ géographique** (ville, rayon) | 🟡 Moyen | Colonnes + geocoding + index spatial (PostGIS ou simple lat/lng). |
| **4. Algorithme de matching** | 🔴 Complexe | Score = f(archétype_compat, niveau_XP, distance, intention). Nouvelle API `/api/matching/discover`. |
| **5. Blocage / signalement** | 🟡 Moyen | Tables `user_blocks`, `user_reports` + modération admin. Sans ça, impossible de lancer sans risque légal. |
| **6. Page de découverte** | 🟡 Moyen | `/dashboard/decouvrir` — affiche profils compatibles filtrés. |
| **7. Modération admin** | 🔴 Complexe | File de modération, outils de suspension, audit log des signalements. |
| **8. Consentement matching explicite** | 🟢 Facile | Opt-in distinct du profil visible — requis RGPD pour traitement données sensibles (blessures psychologiques). |

### Matrice de risque de la vision

```
DIMENSION SENSIBLE : Les blessures d'âme (rejet, abandon, humiliation...)
sont des données psychologiques quasi-médicales. Le RGPD impose un
consentement explicite et une base légale renforcée pour les traiter
dans un contexte de matching. Sans cela : exposition légale MAJEURE.
```

---

## 9. SYNTHÈSE PRIORISÉE

### ⚠️ Top 5 risques à traiter en priorité

| # | Risque | Impact | Effort |
|---|--------|--------|--------|
| **R1** | RLS quiz_v2/v3 tautologiques → tout UPDATE autorisé | 🔴 Critique | 🟢 1h |
| **R2** | Emails test hardcodés en production | 🔴 Fuite données | 🟢 30min |
| **R3** | Quiz → newsletter sans consentement RGPD (J+15) | 🔴 Légal | 🟡 1j |
| **R4** | Pas de rate limiting sur endpoints publics coûteux (/quiz-v3/generate) | 🟠 Financier | 🟡 2h |
| **R5** | Webhook Stripe sans idempotence → double activation possible | 🟠 Données | 🟡 2h |

**Corrections immédiates recommandées :**

```sql
-- Corriger RLS quiz V2 (UPDATE par session_id réel)
DROP POLICY "quiz_v2_responses_update_own" ON public.quiz_v2_responses;
CREATE POLICY "quiz_v2_responses_update_own" ON public.quiz_v2_responses
  FOR UPDATE USING (session_id = current_setting('app.session_id', true));

-- Corriger RLS quiz V3
DROP POLICY "quiz_v3_update_session" ON public.quiz_v3_responses;
CREATE POLICY "quiz_v3_update_session" ON public.quiz_v3_responses
  FOR UPDATE USING (session_id = current_setting('app.session_id', true));
```

### ✅ Top 5 fondations solides à ne pas toucher

| # | Composant | Pourquoi le garder intact |
|---|-----------|--------------------------|
| **F1** | `lib/stripe/config.ts` | Source unique de vérité Stripe — bien architecturée. Modifier prudemment (product IDs hardcodés). |
| **F2** | `lib/XpEngine.ts` + RPCs atomiques | Anti-farming robuste. Toute modification des seuils impacte tous les niveaux existants. |
| **F3** | Middleware route guard (fail-closed) | Sécurité périmétrique saine. N'ajouter que des routes, jamais supprimer la logique. |
| **F4** | Séquence email quiz V2 (19 templates) | Séquence de nurturing éprouvée — toucher l'ordre ou les délais cassera les enrollments en cours. |
| **F5** | `shine_connections` + `private_messages` | Graphe social déjà en production. Fondation directe de la feature rencontre — ne pas migrer le schéma. |

### Ce qu'il ne faut PAS toucher sans plan complet

1. **La table `profiles`** — schema central miroir de `auth.users`. Toute migration peut bloquer les connexions en cours.
2. **Le webhook Stripe** — moindre erreur = abonnements non activés = churn immédiat.
3. **Les crons d'emails en production** — une modification du scheduling casse l'envoi pour tous les contacts en cours d'enrollment.
4. **`user_xp.level`** — la rétrogradation de niveau est psychologiquement problématique pour les membres. Ne jamais réduire rétroactivement.

### Roadmap recommandée vers la fonctionnalité "Rencontre"

```
Phase 0 (sécurité — 1 semaine)
  ├─ Corriger RLS quiz V2/V3
  ├─ Externaliser emails hardcodés
  └─ Ajouter consentement newsletter RGPD

Phase 1 (fondations matching — 2-3 semaines)
  ├─ Ajouter profile_visibility (migration + UI toggle)
  ├─ Ajouter matching_intention (migration + onboarding)
  ├─ Tables user_blocks + user_reports
  └─ Page admin modération signalements

Phase 2 (algorithme — 3-4 semaines)
  ├─ /api/matching/discover (score archétype + niveau + intention)
  ├─ Page /dashboard/decouvrir
  └─ Géolocalisation optionnelle (lat/lng + rayon)

Phase 3 (expérience — 2 semaines)
  ├─ Notifications "nouveau match"
  ├─ Amélioration UX messagerie privée
  └─ Events "rencontres groupées" (s'appuie sur physical_events)
```

---

*Audit produit sur la base du code source du dépôt, des migrations SQL et de la configuration. Aucune donnée de production n'a été consultée.*

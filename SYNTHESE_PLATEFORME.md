# SYNTHÈSE PLATEFORME — SOS SHINE

> Document de travail pour ciblage et simplification. État : 2026-06-24.
> Généré par analyse statique du code. [À VÉRIFIER] = non confirmé sans runtime.

---

## 1. QUIZ — SIGNATURE ÉMOTIONNELLE

### À quoi ça sert
Funnel d'acquisition principal. Permet à un visiteur anonyme de découvrir son "archétype émotionnel", capture son email, et le redirige vers l'offre.

### Ce qui existe
- Route : `/signature-emotionnelle` (public, sans auth)
- Logique : `lib/signature-test.ts`
- **15 questions**, **10 profils** (P1–P10) — pas "4 axes" (terminologie obsolète)
- Profils : L'Analyste, L'Électron Libre, Le Pilier, La Citadelle, Le Gardien du Cadre, Le Caméléon, La Vigie, L'Idéaliste, Le Diplomate, Le Catalyseur
- Scoring : chaque réponse ajoute 1–3 points à un ou plusieurs profils. Gagnant = score max.
- Flow : Intro (prénom) → 15 questions slide → loading 2,8s → capture email → résultat complet (archétype, lumière, ombre, protocole)
- CTA post-quiz : bouton "Rejoindre" → `/rejoindre`, lien "Recommencer"

### Données capturées
- Table `signature_leads` : email, prénom, profile_key (INSERT anonyme autorisé par RLS)
- Table `crm_contacts` : source='signature_test' (upsert)
- Auto-enrollment dans séquences CRM avec `trigger_type='signature_test'`

### État : **LIVE**
Entièrement fonctionnel et branché. Le funnel lead capture → séquence email est câblé de bout en bout.

---

## 2. PAIEMENT — STRIPE

### À quoi ça sert
Monétisation : abonnements mensuels/trimestriels/semestriels/annuels. Désactive/active l'accès au contenu members-only.

### Ce qui existe
- `POST /api/stripe/checkout` — crée une session Checkout Stripe
- `POST /api/stripe/webhook` — reçoit tous les événements Stripe
- `GET /api/stripe/status` — vérifie l'abonnement actif
- `POST /api/stripe/portal` — portail self-service client

**3 plans × 4 durées = 12 price IDs Stripe :**

| Plan | Mensuel | Trimestriel | Semestriel | Annuel |
|------|---------|-------------|-----------|--------|
| Essential | 9,90€ | ~8,90€/m | ~7,90€/m | ~6,90€/m |
| Sérénité | 49,90€ | ~44,90€/m | ~39,90€/m | ~33,90€/m |
| Premium | 99,90€ | ~89,90€/m | ~79,90€/m | ~66,90€/m |

- Essai gratuit 7j : Sérénité et Premium uniquement
- Coupon waitlist : `-10€/mois à vie` si email trouvé en waitlist
- Webhook handlers : `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed/succeeded`
- Mise à jour automatique de `profiles.plan` et `profiles.is_active` via webhook

### État : **LIVE**
Stripe est entièrement câblé (checkout → webhook → DB → accès). Les 12 price IDs doivent être dans les env vars. [À VÉRIFIER : tous les STRIPE_PRICE_* sont bien renseignés en production]

### Signal
- Fallback vers `STRIPE_PRICE_PREMIUM` si les vars spécifiques par durée ne sont pas définies — risque de régression silencieuse si env partiel.

---

## 3. EMAIL / NURTURING

### À quoi ça sert
Nurturing post-quiz et post-waitlist. CRM interne pour campagnes one-shot et séquences automatisées.

### Ce qui existe
- Provider : **Resend** (`lib/crm/resend.ts`)
- Tables : `crm_contacts`, `crm_campaigns`, `crm_campaign_events`, `crm_sequences`, `crm_sequence_steps`, `crm_sequence_enrollments`
- `POST /api/crm/send` — envoi d'une campagne (admin seulement), batch de 50, tracking open/click
- `POST /api/crm/sequences/enroll` — auto-enrollment sur trigger
- `GET /api/crm/track/open` et `/click` — pixels de tracking
- `GET /api/cron/campaigns` et `/sequences` — traitement des envois planifiés (cron externe)
- Admin UI : `/admin/crm` (liste contacts, campagnes, séquences + création)

**Triggers d'enrollment automatique :**
- `'waitlist'` → souscrit depuis waitlist
- `'signature_test'` → souscrit depuis quiz

**Flags de suivi :**
- `crm_contacts.unsubscribed` (bool)
- `crm_sequence_enrollments.status` : active / completed / unsubscribed
- `crm_campaign_events.event_type` : sent / open / click / sequence_sent

### État : **WIP / LIVE PARTIEL**
- Infrastructure complète et câblée
- Enrollment automatique actif (quiz + waitlist → séquence)
- [À VÉRIFIER] : les cron jobs sont-ils configurés côté Vercel/externe ? Sans eux, `next_send_at` n'est jamais traité et les séquences ne partent pas.
- [À VÉRIFIER] : contenu des séquences en base (steps réels vs vides)

---

## 4. AUTH & SÉCURITÉ

### À quoi ça sert
Contrôle d'accès au contenu payant et aux espaces membres.

### Ce qui existe
- Auth : Supabase Auth (email/password), JWT dans cookies HTTP-only
- Middleware (`middleware.ts`) : valide le JWT sur chaque requête
- Rôles : `member` (défaut), `founder`, `admin_content`, `admin_support`
- Désactivation de compte : middleware redirige vers `/compte-inactif` si `is_active=false` et pas admin
- RLS : activé sur toutes les tables sensibles ; policies documentées dans migrations

**Routes protégées :** tout `/dashboard/*` et `/admin/*`

**Routes publiques :** `/`, `/login`, `/signup`, `/rejoindre`, `/encyclopedie/*`, `/contact`, légales, `/signature-emotionnelle`, `/compte-inactif`, `/auth/*`, `/api/*`

**Limites de sécurité visibles :**
- Pas de rate limiting explicite sur `/api/signature-lead` et `/api/waitlist` (POST anonymes) — vulnérable au flood/spam
- La réduction waitlist repose uniquement sur la présence de l'email en base (pas de vérification d'identité) — peut être exploitée
- Webhook Stripe : signature vérifiée (correct)
- CRM admin : `verifyAdminAccess()` présent

### État : **LIVE** (avec failles mineures connues)

---

## 5. PAGES PUBLIQUES

| URL | Fonction |
|-----|----------|
| `/` | Homepage (CMS-driven, préchargée depuis `landing_sections` + fallback statique) |
| `/login` | Connexion |
| `/signup` | Inscription |
| `/signature-emotionnelle` | Quiz d'acquisition (funnel principal) |
| `/rejoindre` | Page pricing / waitlist (bascule prelaunch/launch selon `site_settings`) |
| `/encyclopedie` | Liste des douleurs (accès public, contenu limité) |
| `/encyclopedie/[slug]` | Fiche douleur individuelle (public) |
| `/parents-enfants` | Guide parental bien-être — page statique décorative, sans lien aux douleurs |
| `/contact` | Formulaire de contact |
| `/cgv` | CGV |
| `/confidentialite` | Politique de confidentialité |
| `/mentions-legales` | Mentions légales |
| `/compte-inactif` | Page de blocage pour comptes non payants |

**Anomalie :** La homepage contient `page.tsx` (1 128 lignes) + `page-prelaunch.tsx` + `page-launch.tsx` — trois fichiers pour une même route. `page.tsx` importe l'un ou l'autre selon un flag DB. Duplication de logique importante.

---

## 6. BASE DE DONNÉES

Tables principales (Supabase PostgreSQL + 42 migrations) :

| Table | Rôle |
|-------|------|
| `profiles` | Compte utilisateur (plan, rôle, is_active, pseudo, avatar) |
| `douleurs` | Contenu principal (3 étapes : comprendre/libérer/agir, médias) |
| `subscriptions` | Abonnements Stripe (statut, plan, période) |
| `messages` | Chat par douleur + général |
| `posts` | Mur communautaire + Éclat (types : annonce, community, eclat…) |
| `post_likes` / `post_comments` | Engagement posts |
| `events` | Événements (webinars, ateliers, soin collectif, shine walk) |
| `event_registrations` | Inscriptions événements |
| `private_messages` | Messagerie directe 1:1 |
| `notifications` | Notifications in-app |
| `signaling_rooms` | Signalement WebRTC (calls 1:1 et groupe) |
| `group_events` | Sessions vidéo groupe (host, statut, room_id) |
| `landing_sections` | CMS homepage (contenu JSONB par section) |
| `site_settings` | Paramètres globaux (clé/valeur, dont prelaunch_enabled) |
| `content_views` | Analytics consommation (vidéo, audio, PDF, page) |
| `user_progress` | Avancement par douleur (étapes 1/2/3 complétées) |
| `user_xp` | Points d'expérience et niveaux (gamification) |
| `challenges` | Défis communautaires avec récompenses |
| `challenge_participations` | Participation aux défis |
| `pinned_posts` | Posts épinglés (gagnants de défis) |
| `shine_connections` | Système de connexions / Mes Rayons (ami/connexion) |
| `signature_leads` | Leads quiz (email, prénom, profil) |
| `crm_contacts` | Liste email unifiée |
| `crm_campaigns` | Campagnes email one-shot |
| `crm_campaign_events` | Tracking envois/ouvertures/clics |
| `crm_sequences` | Séquences email automatisées |
| `crm_sequence_steps` | Étapes des séquences |
| `crm_sequence_enrollments` | Progression contacts dans séquences |
| `affiliates` | Affiliés (tiers bronze/silver/gold/diamond, code referral) |
| `affiliate_clicks` / `_conversions` / `_payouts` | Tracking affiliation |
| `waitlist` | Liste d'attente pré-lancement (table PostgreSQL séparée via `pg`) |
| `user_goals` | Objectifs personnels (définis à l'onboarding) |

---

## 7. FUNNELS ANNEXES

### Waitlist / pré-lancement
- Route : `/rejoindre` (affiche countdown si `prelaunch_enabled=true` dans `site_settings`)
- Date de lancement codée : 2026-03-22 — **dépassée** (aujourd'hui 2026-06-24)
- Formulaire email+nom → `POST /api/waitlist` → table `waitlist` (pg) + `crm_contacts` source='waitlist' + enrollment séquence
- [À VÉRIFIER] : `prelaunch_enabled` est-il toujours actif en production ? Si oui, les visiteurs voient encore le countdown.

### /cadeau
- **N'existe pas.** Aucune route, aucun fichier. Mentionné dans le brief comme funnel possible — à créer si besoin.

### Événements
- Pages membres : `/dashboard/evenements`
- Géocodage ville → coordonnées via `GET /api/geocode` (Nominatim OpenStreetMap)
- Inscription : `event_registrations`
- Replay : `events.replay_url` (stocké en base)

### Programme d'affiliation
- Route membres : `/dashboard/affiliation`
- Application manuelle (formulaire motivation, audience, canaux) → statut `pending` → admin valide
- Tiers : bronze 10%, silver 15%, gold 20%, diamond 25%
- Code referral : généré côté client (`SOS-XXXXXX-USERID`) — [À VÉRIFIER] : le code est-il sauvegardé en base lors de l'application ou seulement généré localement ?
- Tracking via `affiliate_clicks`, `affiliate_conversions`, `affiliate_payouts`

### Onboarding
- Route : `/onboarding` (post-signup probablement)
- Choix d'objectifs prédéfinis (8 options : confiance, relation toxique, séparation, amour propre, leadership, deuil, burn-out, dépendance affective)
- Sauvegarde dans `user_goals` en base Supabase

---

## 8. DESIGN SYSTEM / COMPOSANTS

### Framework
- Tailwind CSS v4 custom (pas de shadcn/ui, pas de bibliothèque externe)
- Thème dark, tokens couleur custom (`--gold`, `--dark`, `--dark-card`, etc.) dans `globals.css` (22 Ko)
- Fonts : DM Sans (corps) + Cormorant Garamond (display)
- Animations : Framer Motion partout

### Composants live (utilisés dans l'app)
| Composant | Rôle | Utilisé ? |
|-----------|------|-----------|
| `AudioPlayer.tsx` | Lecture audio (douleurs) | Oui |
| `VoiceRecorder.tsx` | Enregistrement vocal (messages) | Oui |
| `FileUpload.tsx` | Upload vers Supabase Storage | Oui |
| `NotificationBell.tsx` | Centre de notifications | Oui (layout dashboard) |
| `FavoriteButton.tsx` | Favoris (localStorage) | Oui |
| `ThemeToggle.tsx` | Bascule dark/light | Oui |
| `ThemeProvider.tsx` | Context thème | Oui (layout racine) |
| `XPBadge.tsx` | Affichage niveau XP | Oui (dashboard, profil) |
| `ShineChatbot.tsx` | Chatbot FAQ (matching mots-clés) | [À VÉRIFIER] |
| `SecurityProvider.tsx` | Wrapper sécurité app | Oui (layout racine) |
| `ui/CTAButton.tsx` | Bouton CTA réutilisable | Oui |

### Composants construits mais **non branchés**
| Composant | Rôle | Statut |
|-----------|------|--------|
| `ConferenceRoom.tsx` (361 lignes) | Visioconférence WebRTC complète | **MORT** — n'est importé nulle part dans `/app` |
| `Whiteboard.tsx` | Tableau collaboratif Excalidraw | **MORT** — importé uniquement dans ConferenceRoom |
| `IncomingCallModal.tsx` | Modal d'appel entrant | **MORT** — n'est importé nulle part dans `/app` |

### Pages stub (UI construite, données simulées)
- `/dashboard/shine-audible` — Netflix audio simulé (images Unsplash hardcodées, 0 vraie donnée)
- `/dashboard/shine-tv` — Netflix vidéo simulé (idem)

### Données locales non persistées (localStorage uniquement)
- `/dashboard/journal` — Journal humeur — **non sauvegardé en DB**
- `/dashboard/favoris` — Favoris douleurs — **non sauvegardé en DB**
- `/dashboard/objectifs` (partiellement) — Goals perso en localStorage, alors que `user_goals` existe en DB

### i18n
- `lib/i18n/useTranslation.ts` + `lib/i18n/translations.ts` — système de traduction interne
- **Une seule langue (français).** Pas de multi-langue réel. Surcouche inutile.

---

## CARTE DE COMPLEXITÉ

| Élément | État | Utilisé ? | Complexité | Candidat simplification/suppression ? |
|---------|------|-----------|------------|---------------------------------------|
| Quiz Signature Émotionnelle | Live | Oui | Moyenne | Non — cœur du funnel |
| Stripe checkout + webhook | Live | Oui | Haute | Non — cœur du revenu |
| CRM email (campagnes) | Live partiel | Oui (si crons actifs) | Haute | À discuter — mutualisable avec Resend natif |
| CRM séquences auto | Live partiel | Oui | Haute | À discuter — valeur réelle si steps existent |
| Auth Supabase + middleware | Live | Oui | Faible | Non |
| RLS policies | Live | Oui | Moyenne | Non |
| Homepage CMS (`landing_sections`) | Live | Oui | Haute | À discuter — justifié si éditions fréquentes |
| `page.tsx` + `page-prelaunch.tsx` + `page-launch.tsx` | Live | Oui | Haute | **OUI** — 3 fichiers, 1 route, duplication majeure |
| `sanitizeContent()` (regex douleur→challenge) | Live | Oui | Faible | **OUI** — workaround fragile, renommer à la source |
| WebRTC ConferenceRoom | Mort | **Non** | Très haute | **OUI — supprimer** |
| Whiteboard Excalidraw | Mort | **Non** | Haute | **OUI — supprimer** |
| IncomingCallModal | Mort | **Non** | Moyenne | **OUI — supprimer** |
| `signaling_rooms` (table) | WIP | Non | Moyenne | **OUI** si WebRTC supprimé |
| `group_events` (table) | WIP | [À VÉRIFIER] | Faible | À discuter |
| Shine Audible (stub) | Stub | Affiché mais vide | Faible | **OUI — supprimer ou différer** |
| Shine TV (stub) | Stub | Affiché mais vide | Faible | **OUI — supprimer ou différer** |
| Journal (localStorage) | Live | Oui | Faible | À discuter — brancher en DB ou supprimer |
| Favoris (localStorage) | Live | Oui | Faible | **OUI** — brancher `post_likes` ou supprimer |
| Objectifs (localStorage + DB mixé) | WIP | Partiellement | Faible | **OUI** — unifier sur `user_goals` |
| i18n (`useTranslation`) | Live | Oui | Faible | **OUI** — une seule langue, remplacer par strings directes |
| Système d'affiliation complet | Live partiel | Oui (UI) | Très haute | À discuter — distraction si audience petite |
| Bots (4 API routes, auto/seed/post/schedule) | Live | [À VÉRIFIER] | Moyenne | À discuter — utile seulement si communauté vide |
| Gamification XP + niveaux | Live | Oui | Moyenne | À discuter — non essentiel au cœur |
| Défis communautaires | Live | Oui | Haute | À discuter |
| Mes Rayons (connexions sociales) | Live | Oui | Haute | À discuter — réseau social complet dans une app bien-être |
| Messagerie privée | Live | Oui | Haute | À discuter — doublon partiel avec chat douleur |
| Chat par douleur | Live | Oui | Moyenne | Non — lié au contenu |
| `parents-enfants` (page statique) | Live | Oui | Très faible | À discuter — pas connecté au reste |
| Geocodage événements (Nominatim) | Live | Oui | Faible | Non si événements gardés |
| Notify API (admin broadcast) | Live | Oui | Faible | Non |
| Admin CRM UI (`/admin/crm/*`) | Live | Oui | Haute | Non si CRM gardé |
| Admin dashboard-edit | Live | Oui | Faible | Non |
| Admin prelaunch | Live | [À VÉRIFIER actif] | Faible | À vérifier — mode prelaunch encore ON ? |
| Waitlist (table `pg` séparée) | Live | Oui | Faible | **OUI** — doublon avec `crm_contacts`, unifier |
| `user_goals` table | Live partiel | Oui (onboarding) | Faible | Non — brancher objectifs dessus |
| `content_views` analytics | Live | [À VÉRIFIER] | Faible | Non |

---

## SIGNAUX GRAS À REMONTER

### Fonctionnalités construites mais jamais branchées
- **WebRTC complet** (ConferenceRoom + IncomingCallModal + Whiteboard) — 700+ lignes, 0 import dans l'app. Supprimable immédiatement.
- **Shine Audible / Shine TV** — pages accessibles depuis la nav mais contenu 100% simulé (Unsplash + fakes). Trompeur pour l'utilisateur.

### Doublons
- **Waitlist** en table `pg` (PostgreSQL direct) ET dans `crm_contacts` — deux sources de vérité pour la même chose.
- **Homepage** : `page.tsx` + `page-prelaunch.tsx` + `page-launch.tsx` — même page, trois fichiers avec logique dupliquée.
- **Objectifs** : `user_goals` en Supabase + localStorage dans `/dashboard/objectifs` — deux systèmes de stockage non synchronisés.
- **Messagerie** : chat par douleur + messagerie privée 1:1 — deux systèmes de messages sans articulation claire.

### Code mort / routes mortes / tables potentiellement vides
- `signaling_rooms` — table en base pour le WebRTC mort
- `group_events` — [À VÉRIFIER] si des sessions sont réellement créées
- Shin Audible/TV — pages dans la nav pointant vers du contenu inexistant
- Favoris et Journal — données perdues à chaque changement de navigateur/appareil (localStorage)

### Complexité sans valeur au cœur du produit
- **i18n** (`useTranslation`) — architecture de traduction sans multi-langue réel. Ajoute une couche d'indirection pour rien.
- **`sanitizeContent()`** — 15 regex pour remplacer "douleur" par "challenge émotionnel" ou "expérience de vie" dans le CMS, au lieu de renommer les strings à la source.
- **Programme d'affiliation complet** (4 tables, tiers, tracking, paiements) — investissement élevé pour une audience qui n'est peut-être pas encore là.
- **Gamification** (XP, niveaux, défis, pins, classements) — couche sociale lourde sur une app de bien-être individuel.
- **Bots** (4 routes API pour seeder du contenu communautaire) — présuppose que la communauté est vide et doit être simulée.

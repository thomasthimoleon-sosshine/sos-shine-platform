Tu es un assistant qui travaille sur la plateforme **SOS Shine**, une application web communautaire de bien-être et développement personnel fondée par Julia Laureau (thérapeute holistique et auteure du livre "SOS Shine — Briller Comme un Diamant"), co-fondée avec Wiliam et Thomas.

---

## STACK TECHNIQUE

- **Framework** : Next.js 16 (App Router) avec React 19, TypeScript 5
- **Base de données / Auth / Storage** : Supabase (PostgreSQL + Auth + Realtime + Storage bucket "uploads")
- **Paiements** : Stripe (abonnements récurrents avec webhooks)
- **Emails transactionnels** : Resend
- **UI** : Tailwind CSS 4, Framer Motion (animations), design system custom avec thème sombre/clair (CSS variables : `--dark`, `--gold`, `--text-primary`, etc.)
- **Fonts** : Cormorant Garamond (display) + DM Sans (body)
- **Hébergement** : Vercel
- **Autres** : Excalidraw (whiteboard), WebRTC natif (visio/audio)

---

## ARCHITECTURE DES PAGES

### Pages publiques (accessibles sans connexion) :
- `/` — Landing page dynamique (CMS via table `landing_sections`), avec mode pre-launch et mode lancement
- `/login` — Connexion (Supabase Auth)
- `/signup` — Inscription
- `/rejoindre` — Page "Rejoindre la communauté" (pricing/abonnements)
- `/contact` — Page de contact
- `/encyclopedie` — Encyclopédie publique des expériences de vie (liste)
- `/encyclopedie/[slug]` — Détail d'un challenge émotionnel (version publique)
- `/signature-emotionnelle` — Quiz interactif "Signature Émotionnelle" (10 profils : Cristallin, Volcan, Racine, etc.)
- `/parents-enfants` — Section Parents & Enfants (en cours de développement)
- `/cgv`, `/confidentialite`, `/mentions-legales` — Pages légales
- `/compte-inactif` — Page affichée quand un compte n'a plus d'abonnement actif

### Dashboard membre (authentifié + abonnement actif) :
- `/dashboard` — Accueil personnalisé : salutation contextuelle (matin/soir), citation du jour, accès rapide, fil d'actualité des Rayons, widget parcours (objectifs + journal), protocole en 3 étapes
- `/dashboard/encyclopedie` — Liste des challenges émotionnels accessibles
- `/dashboard/encyclopedie/[slug]` — Détail d'un challenge avec **protocole en 3 étapes** :
  - Étape 1 "Comprendre" : vidéo explicative, audio, PDF, image
  - Étape 2 "Libérer & Intégrer" : audio énergétique, vidéo, PDF, image
  - Étape 3 "Agir" : audio méditation, vidéo, PDF, exercice écrit, image
- `/dashboard/favoris` — Challenges favoris sauvegardés
- `/dashboard/chat` — Chat général communautaire (texte + audio, option anonyme)
- `/dashboard/chat/[slug]` — Chat dédié par challenge émotionnel
- `/dashboard/messages` — Messagerie privée (liste des conversations)
- `/dashboard/messages/[id]` — Conversation privée 1-to-1 (texte + audio)
- `/dashboard/mur` — Mur communautaire (publications avec likes, commentaires, catégories : témoignage, partage, question, remerciements, gratitude, citation)
- `/dashboard/mon-eclat` — "Mon Éclat" : espace personnel de publication (texte, image, vidéo, audio), visibilité publique ou rayons seulement
- `/dashboard/mes-rayons` — "Mes Rayons" : système de connexions sociales (envoi de demandes, acceptation/déclin, fil d'actualité des connexions)
- `/dashboard/membre/[id]` — Profil d'un autre membre
- `/dashboard/evenements` — Calendrier des événements (soins collectifs, ateliers, lives, rencontres, Shine Walks) avec inscription et géolocalisation
- `/dashboard/objectifs` — Suivi d'objectifs personnels (stockés en localStorage)
- `/dashboard/journal` — Journal intime (stocké en localStorage)
- `/dashboard/affiliation` — Programme d'affiliation avec 4 niveaux (Bronze 10%, Silver 15%, Gold 20%, Diamond 25%), suivi des clics/conversions/gains, demandes de retrait
- `/dashboard/profil` — Profil personnel (prénom, pseudo, bio, avatar, vidéo)

### Administration (rôles : founder, admin_content, admin_support) :
- `/admin` — Dashboard admin : stats globales (membres, challenges, événements, messages), chiffre d'affaires Stripe
- `/admin/douleurs` — CRUD des challenges émotionnels (créer, éditer, publier/dépublier, upload médias)
- `/admin/evenements` — Gestion des événements
- `/admin/publications` — Gestion des publications sur le mur
- `/admin/membres` — Gestion des membres (activer/désactiver comptes, bannir temporairement la publication, changer rôles)
- `/admin/candidatures` — Gestion des candidatures d'affiliation (approuver/rejeter)
- `/admin/retraits` — Gestion des demandes de retrait d'affiliés
- `/admin/parametres` — Paramètres du site (textes du dashboard, couleurs des étapes, labels, images)
- `/admin/bots` — Système de bots simulant l'activité communautaire (profils fictifs qui postent dans le chat et sur le mur)
- `/admin/dashboard-edit` — Édition visuelle du dashboard
- `/admin/prelaunch` — Paramètres de la page pre-launch
- `/admin/landing` — CMS de la landing page (édition des sections, drag & drop, contenu, styles)
- `/admin/crm` — CRM intégré :
  - `/admin/crm/contacts` — Gestion des contacts
  - `/admin/crm/campaigns` — Campagnes email (création, planification, envoi via Resend)
  - `/admin/crm/campaigns/new` — Création de campagne
  - `/admin/crm/sequences` — Séquences email automatisées
  - `/admin/crm/sequences/new` — Création de séquence

---

## MODÈLES DE DONNÉES (Tables Supabase)

1. **profiles** — Utilisateurs (id UUID lié à auth.users, prenom, pseudo, email, role, avatar_url, bio, video_url, plan, is_bot, is_active, publish_banned_until)
2. **subscriptions** — Abonnements Stripe (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, cancel_at_period_end, trial_end, waitlist_discount)
3. **douleurs** — Challenges émotionnels / encyclopédie (title, slug, description, 12 champs médias pour les 3 étapes, is_active, is_published)
4. **messages** — Chat communautaire (user_id, douleur_id, content, audio_url, message_type, is_general, is_deleted, is_anonymous)
5. **posts** — Publications mur communautaire (author_id, title, content, image/video/audio, post_type, category, media_type, visibility, is_published, delete_locked)
6. **post_likes** — Likes sur posts
7. **post_comments** — Commentaires sur posts
8. **events** — Événements (title, description, event_type: soin_collectif/atelier/live/rencontre/shine_walk, location, event_date, live_url, replay_url, price, max_participants, hosts)
9. **event_registrations** — Inscriptions aux événements
10. **content_views** — Analytics de consommation de contenu
11. **notifications** — Notifications (new_douleur, new_event, new_post, new_soin, warning)
12. **private_messages** — Messagerie privée (sender_id, receiver_id, content, audio_url, is_read)
13. **signaling_rooms** — Salles WebRTC (visio/audio 1-to-1 et groupe)
14. **group_events** — Événements vidéo de groupe
15. **affiliates** — Affiliés (referral_code, motivation, canaux de promotion, gains, tier)
16. **affiliate_clicks** — Tracking des clics affiliés
17. **affiliate_conversions** — Conversions d'affiliation (signup, subscription, renewal)
18. **affiliate_payouts** — Paiements aux affiliés
19. **withdrawal_requests** — Demandes de retrait (IBAN ou PayPal)
20. **shine_connections** — Système "Mes Rayons" (connexions entre membres : pending/accepted/declined)
21. **site_settings** — Paramètres du site (clé-valeur, modifiables par les admins)
22. **landing_sections** — Sections CMS de la landing page (section_key, content JSON, styles JSON, position, is_visible)

---

## PLANS D'ABONNEMENT

| Plan | Mensuel | 3 mois (-10%) | 6 mois (-20%) | Annuel (-30%) |
|------|---------|---------------|---------------|---------------|
| **Essentielle** | 9,90€/mois | 8,90€/mois | 7,90€/mois | 6,90€/mois |
| **Sérénité** | 49,90€/mois | 44,90€/mois | 39,90€/mois | 33,90€/mois |
| **Premium** | 99,90€/mois | 89,90€/mois | 79,90€/mois | 66,90€/mois |

- Essentielle : "L'autonomie et l'accès à la base de connaissances"
- Sérénité : "Un accompagnement énergétique régulier" (période d'essai disponible)
- Premium : "L'immersion totale et l'accès privilégié" (période d'essai disponible)
- Coupon waitlist pour les early adopters
- Date de fin de pré-lancement : 22 mars 2026

---

## RÔLES UTILISATEURS

- **member** — Membre standard (accès dashboard si abonnement actif)
- **founder** — Fondateur (accès total admin + toujours accès dashboard)
- **admin_content** — Admin contenu (accès admin)
- **admin_support** — Admin support (accès admin)

---

## API ENDPOINTS

- `/api/stripe/checkout` — Création session Stripe Checkout
- `/api/stripe/portal` — Portail client Stripe
- `/api/stripe/status` — Vérification statut abonnement
- `/api/stripe/webhook` — Webhook Stripe (checkout.session.completed, subscription.created/updated/deleted, invoice.payment_failed/succeeded)
- `/api/feed` — Fil d'actualité des Rayons
- `/api/rayons` — Gestion des connexions "Mes Rayons" (GET + PATCH)
- `/api/notify` — Envoi de notifications
- `/api/geocode` — Géocodage d'adresses pour événements
- `/api/waitlist` — Inscription liste d'attente
- `/api/signature-lead` — Capture de leads via le quiz Signature Émotionnelle
- `/api/admin/members` — Gestion admin des membres
- `/api/admin/candidatures` — Gestion admin des candidatures d'affiliation
- `/api/admin/withdrawals` — Gestion admin des retraits
- `/api/bots/auto` — Génération automatique d'activité par bots
- `/api/bots/post` — Publication par un bot
- `/api/bots/schedule` — Planification d'activité bot
- `/api/bots/seed` — Initialisation des profils bots
- `/api/crm/campaigns` — CRUD campagnes email
- `/api/crm/contacts` — Gestion contacts CRM
- `/api/crm/send` — Envoi d'emails (via Resend)
- `/api/crm/sequences` — CRUD séquences email
- `/api/crm/sequences/enroll` — Inscription à une séquence
- `/api/crm/track/click` — Tracking clics email
- `/api/crm/track/open` — Tracking ouvertures email
- `/api/cron/campaigns` — Cron d'envoi des campagnes planifiées
- `/api/cron/sequences` — Cron d'exécution des séquences

---

## COMPOSANTS CLÉS

- **ShineChatbot** — Chatbot FAQ sur la landing page (réponses basées sur mots-clés)
- **NotificationBell** — Cloche de notifications avec badge temps réel
- **ThemeToggle** / **ThemeProvider** — Bascule thème sombre/clair
- **SecurityProvider** — Protection des routes
- **FileUpload** — Upload de fichiers vers Supabase Storage
- **VoiceRecorder** — Enregistrement audio navigateur
- **AudioPlayer** — Lecteur audio custom
- **Whiteboard** — Tableau blanc collaboratif (Excalidraw)
- **ConferenceRoom** — Salle de conférence WebRTC (visio/audio)
- **IncomingCallModal** — Modal d'appel entrant
- **FavoriteButton** — Bouton favori pour les challenges

---

## FONCTIONNALITÉS SPÉCIALES

1. **Quiz "Signature Émotionnelle"** — 15 questions, 10 profils possibles (Cristallin, Volcan, Racine, Forteresse, Sentinelle, Caméléon, Architecte, Phénix, Harmoniseur, Étincelle), chaque profil a un archétype, une essence, une lumière, une ombre, et un protocole recommandé. Capture d'email en fin de quiz pour le CRM.

2. **Système de Bots** — Profils fictifs qui simulent l'activité communautaire (messages dans le chat, publications sur le mur) pour animer la plateforme au lancement. Configurable depuis l'admin.

3. **CRM intégré** — Gestion de contacts, campagnes email programmées, séquences automatisées, tracking d'ouvertures et de clics. Utilise Resend comme provider email.

4. **Programme d'affiliation** — 4 niveaux de commission, système complet avec tracking clics/conversions, demandes de retrait (IBAN/PayPal), gestion admin.

5. **"Mes Rayons"** — Réseau social interne : envoi de demandes de connexion, fil d'actualité des publications de ses connexions, similaire au concept d'amis/followers.

6. **"Mon Éclat"** — Espace de micro-blogging personnel avec catégories (Pensée, Partage, Gratitude, Citation, Moment de joie, Réflexion) et médias (texte, image, vidéo, audio). Visibilité configurable (public ou Rayons uniquement).

7. **Visio WebRTC native** — Appels audio/vidéo 1-to-1 et conférences de groupe directement dans la plateforme.

8. **Landing page CMS** — Toutes les sections de la landing sont éditables depuis l'admin (textes, images, styles, ordre, visibilité). Remplacement automatique des termes "douleur" par "challenge émotionnel" / "expérience de vie".

9. **Internationalisation** — Système i18n avec traductions françaises (la plateforme est en français).

10. **RLS (Row Level Security)** — Toutes les tables ont des politiques de sécurité Supabase (les membres ne voient que leurs propres données, les admins ont accès élargi).

---

## DESIGN

- Thème principal sombre avec accents dorés (`#D4AF37`)
- Design "glassmorphism" (classes `glass`, `glass-hover`, `glass-dense`)
- Animations fluides avec Framer Motion
- Responsive (sidebar desktop, hamburger mobile)
- Typographie élégante : Cormorant Garamond pour les titres, DM Sans pour le corps

---

## CONTACT

- Email principal : julialaureau@sosshine.com
- URL de production : https://sos-shine-platform.vercel.app

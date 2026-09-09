# Document complet de la plateforme SOS Shine — Pour carte mentale NotebookLM

## 1. IDENTITE DE LA PLATEFORME

- Nom : SOS Shine
- Nature : Plateforme SaaS de bien-etre emotionnel et developpement personnel
- Tech stack : Next.js 16, React 19, TypeScript, Supabase (PostgreSQL), Stripe, Resend
- Design : Glassmorphisme, theme sombre par defaut avec bascule clair/sombre
- Polices : Cormorant Garamond (titres elegants) + DM Sans (texte courant)
- Hebergement : Vercel

---

## 2. PAGES PUBLIQUES (Acces libre)

- Page d'accueil (/) — Landing page entierement editable par l'admin (CMS drag and drop avec sections modulaires)
- Connexion (/login) — Email/mot de passe + Google OAuth
- Inscription (/signup) — Creation de compte
- Tarifs (/rejoindre) — Page des abonnements avec 3 plans
- Contact (/contact) — Formulaire de contact
- Encyclopedie publique (/encyclopedie) — Liste des defis emotionnels consultables par tous
- Detail d'un defi (/encyclopedie/[slug]) — Contenu public d'un defi
- Quiz Signature Emotionnelle (/signature-emotionnelle) — 15 questions vers 10 profils emotionnels (Cristallin, Volcan, Racine, Prisme, Brume, Flamme, Ocean, Etoile, Terre, Vent)
- Parents et Enfants (/parents-enfants) — Section en developpement
- Notre Histoire (/notre-histoire) — Page a propos
- Pages legales — CGV, Confidentialite, Mentions legales
- Mot de passe oublie (/forgot-password) — Recuperation de compte
- Onboarding (/onboarding) — Parcours d'accueil des nouveaux membres

---

## 3. ESPACE MEMBRE (Dashboard prive — abonnement actif requis)

### 3.1 Accueil Dashboard
- Message de bienvenue personnalise
- Citation du jour (rotation quotidienne)
- Acces rapides aux fonctionnalites
- Suivi de parcours et progression

### 3.2 Encyclopedie Membre (/dashboard/encyclopedie)
- Liste complete des defis emotionnels (reserves aux membres)
- Chaque defi suit un protocole en 3 etapes :
  - Etape 1 : Comprendre — Comprendre la problematique
  - Etape 2 : Liberer et Integrer — Exercices de liberation
  - Etape 3 : Agir — Actions concretes
- Chaque etape peut contenir : video, audio, PDF, texte riche
- Quiz a choix multiples par defi avec scoring
- Systeme de favoris (bouton coeur)
- Suivi de progression et points d'experience (XP)

### 3.3 Chat communautaire (/dashboard/chat)
- Chat general en temps reel (texte + messages audio)
- Option de publication anonyme
- Chat dedie par defi (/dashboard/chat/[slug])
- Messages vocaux enregistres via le micro

### 3.4 Messagerie privee (/dashboard/messages)
- Liste de conversations 1-a-1
- Envoi de texte et messages audio
- Appels audio/video via WebRTC natif
- Notification d'appel entrant (modal)

### 3.5 Mur communautaire (/dashboard/mur)
- Publications avec categories
- Likes et commentaires
- Plusieurs types de publications
- Support media (images, etc.)

### 3.6 Mon Eclat (/dashboard/mon-eclat)
- Micro-blogging personnel
- 6 categories de publications
- Support texte et media
- Options de confidentialite

### 3.7 Mes Rayons (/dashboard/mes-rayons)
- Systeme de connexions sociales (reseau d'amis)
- Envoi/reception de demandes de connexion
- Fil d'actualite des connexions
- Consultation des profils membres (/dashboard/membre/[id])

### 3.8 Evenements (/dashboard/evenements)
- Calendrier d'evenements
- Geolocalisation des evenements
- Types d'evenements varies
- Inscription aux evenements

### 3.9 Objectifs personnels (/dashboard/objectifs)
- Definition et suivi d'objectifs
- Stockage local (localStorage)

### 3.10 Journal intime (/dashboard/journal)
- Journal prive personnel
- Stockage local (localStorage)
- Export en PDF

### 3.11 Programme d'affiliation (/dashboard/affiliation)
- 4 niveaux : Bronze (10%), Argent (15%), Or (20%), Diamant (25%)
- Lien de parrainage unique
- Suivi des clics, conversions, gains
- Demandes de retrait (IBAN ou PayPal)
- Rapports PDF

### 3.12 Courrier Anonyme (/dashboard/courrier-anonyme)
- Boite aux lettres anonyme
- Poser des questions sans reveler son identite

### 3.13 Shine TV (/dashboard/shine-tv)
- Bibliotheque video streaming
- Favoris et notations

### 3.14 Shine Audible (/dashboard/shine-audible)
- Bibliotheque de podcasts et livres audio
- Favoris, notations, historique d'ecoute

### 3.15 Shine Librairie (/dashboard/shine-librairie)
- Bibliotheque de eBooks et guides
- Favoris et notations

### 3.16 Profil (/dashboard/profil)
- Edition du profil personnel
- Avatar, bio, informations

---

## 4. ESPACE ADMINISTRATEUR

### 4.1 Tableau de bord admin
- Statistiques globales de la plateforme (membres, abonnements, activite)

### 4.2 Gestion de contenu
- Defis / Encyclopedie — CRUD complet des defis emotionnels avec 12 champs media par defi
- Shine TV — Gestion des videos
- Shine Audible — Gestion des pistes audio
- Shine Librairie — Gestion des livres

### 4.3 Gestion communautaire
- Publications — Moderation du mur communautaire
- Membres — Gestion des utilisateurs (roles, statut)
- Courrier anonyme — Lecture et reponse aux messages anonymes
- Defis communautaires — Creation de challenges

### 4.4 CRM et emailing (via Resend)
- Contacts — Gestion des contacts (import, segments)
- Campagnes — Creation et envoi de campagnes email
- Sequences — Automatisation d'emails (sequences programmees)
- Tracking d'ouvertures et de clics

### 4.5 Gestion commerciale
- Abonnements — Suivi des souscriptions Stripe
- Candidatures affiliation — Validation des demandes d'affiliation
- Retraits — Traitement des demandes de paiement affilies

### 4.6 Configuration
- Editeur de landing page — CMS drag and drop pour la page d'accueil
- Editeur de dashboard — Personnalisation visuelle du dashboard
- Parametres globaux — Couleurs, textes, libelles de la plateforme
- Parametres pre-lancement — Mode pre-lancement

### 4.7 Systeme de bots
- Creation de profils bots (faux comptes)
- Simulation d'activite automatique (posts, messages)
- Programmation d'activite

---

## 5. SYSTEME D'ABONNEMENTS (Stripe)

### Plan Essentielle — L'autonomie et l'acces a la base de connaissances
- Mensuel : 9,90 euros
- 3 mois (-10%) : 8,90 euros/mois
- 6 mois (-20%) : 7,90 euros/mois
- 12 mois (-30%) : 6,90 euros/mois

### Plan Serenite — Un accompagnement energetique regulier (essai gratuit 7 jours)
- Mensuel : 49,90 euros
- 3 mois (-10%) : 44,90 euros/mois
- 6 mois (-20%) : 39,90 euros/mois
- 12 mois (-30%) : 33,90 euros/mois

### Plan Premium — L'immersion totale et l'acces privilegie (essai gratuit 7 jours)
- Mensuel : 99,90 euros
- 3 mois (-10%) : 89,90 euros/mois
- 6 mois (-20%) : 79,90 euros/mois
- 12 mois (-30%) : 66,90 euros/mois

---

## 6. SYSTEMES TRANSVERSAUX

### 6.1 Authentification
- Email/mot de passe + Google OAuth
- 4 roles : member, founder, admin_content, admin_support
- Protection des routes par middleware
- Row-Level Security (RLS) sur toutes les tables

### 6.2 Notifications
- Systeme de notifications en temps reel
- Cloche de notification avec badge
- Notifications push in-app

### 6.3 Gamification
- Points d'experience (XP) pour chaque activite
- Badges XP
- Niveaux utilisateur
- Suivi de progression des defis

### 6.4 Medias et fichiers
- Upload drag and drop vers Supabase Storage
- Enregistrement vocal (codec WebM)
- Lecteur audio personnalise
- Appels audio/video WebRTC (1-a-1 et groupe)
- Tableau blanc collaboratif (Excalidraw)

### 6.5 Generation de PDF
- Factures
- Export journal intime
- Certificats
- Rapports d'affiliation

### 6.6 Internationalisation
- Systeme i18n en place
- Langue principale : Francais

### 6.7 Chatbot FAQ
- Bot conversationnel sur la landing page pour repondre aux questions frequentes

---

## 7. BASE DE DONNEES (50+ tables PostgreSQL via Supabase)

### Tables principales
- profiles — Utilisateurs (nom, email, role, avatar, bio, plan, statut bot)
- subscriptions — Abonnements Stripe
- douleurs — Defis emotionnels (contenu encyclopedie)
- douleur_steps — Etapes dynamiques par defi
- douleur_quiz_questions — Questions quiz par defi
- messages — Messages chat (texte/audio, anonyme possible)
- posts, post_likes, post_comments — Mur communautaire
- private_messages — Messagerie privee
- events, event_registrations — Evenements
- shine_connections — Reseau social (Mes Rayons)
- notifications — Notifications
- affiliates, affiliate_clicks, affiliate_conversions, affiliate_payouts — Affiliation
- withdrawal_requests — Demandes de retrait
- user_progress, user_xp, user_goals — Progression et gamification
- shine_tv_videos, shine_audible_tracks, shine_library_books — Contenus medias
- courrier_anonyme — Courrier anonyme
- crm_contacts, crm_campaigns, crm_sequences — CRM
- landing_sections — Sections landing page CMS
- site_settings — Parametres configurables
- onboarding_responses — Donnees d'onboarding
- challenges, challenge_participations — Defis communautaires

---

## 8. INTEGRATIONS EXTERNES

1. Supabase — Base de donnees, authentification, stockage fichiers, temps reel
2. Stripe — Paiements, abonnements, webhooks, portail client
3. Resend — Emails transactionnels, campagnes marketing, sequences automatisees
4. Google OAuth — Connexion sociale
5. WebRTC — Appels audio/video natifs (pas de service tiers)
6. Excalidraw — Tableau blanc collaboratif

---

## 9. TACHES AUTOMATISEES (Crons)

- Campagnes email — Envoi programme des campagnes
- Sequences email — Execution des etapes de sequences
- Statut abonnements — Mise a jour automatique des statuts Stripe

---

## 10. PARCOURS UTILISATEUR TYPE

1. Decouverte : Landing page ou Quiz Signature Emotionnelle
2. Inscription : Creation de compte
3. Onboarding : Parcours d'accueil personnalise
4. Choix d'abonnement : Essentielle, Serenite ou Premium
5. Acces Dashboard : Exploration des defis, chat, communaute
6. Engagement : Publications, connexions (Mes Rayons), evenements
7. Progression : XP, suivi des defis, journal, objectifs
8. Affiliation : Parrainage et revenus passifs

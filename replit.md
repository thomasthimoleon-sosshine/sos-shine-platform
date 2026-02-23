# SOS Shine Platform

## Overview
SOS Shine is a premium community platform built with Next.js 16 for emotional support and life experiences. It features a dark/light luxury design with gold accents, Supabase backend, Stripe payments, and multi-language support (FR/EN/ES).

## Tech Stack
- **Framework**: Next.js 16.1.6 (Turbopack) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Backend**: Supabase (auth, database, storage)
- **Payments**: Stripe
- **UI**: Framer Motion, Excalidraw (whiteboard), custom glassmorphism design, LeClub10-inspired premium animations
- **Fonts**: Cormorant Garamond (display), DM Sans (body)
- **i18n**: Custom translation system with FR/EN/ES support

## Project Structure
```
app/              # Next.js App Router pages
  admin/          # Admin panel
  dashboard/      # User dashboard
    encyclopedie/ # Encyclopedia pages
    favoris/      # Favorites page
    objectifs/    # Personal goals page
    journal/      # Private journal page
    chat/         # Chat pages
    messages/     # Private messages
    mur/          # Community wall
    evenements/   # Events
    visio/        # Video conferences
    profil/       # User profile
  login/          # Login page
  signup/         # Signup page
  encyclopedie/   # Public encyclopedia
  rejoindre/      # Join page
  contact/        # Contact page
  cgv/            # Terms of service
  confidentialite/ # Privacy policy
  mentions-legales/ # Legal mentions
components/       # React components
  ui/             # UI components (CTAButton)
  FavoriteButton.tsx  # Heart/bookmark toggle for encyclopedia
  LanguageSelector.tsx # FR/EN/ES language picker dropdown
  NotificationBell.tsx # Bell icon with notification panel
  ShineChatbot.tsx    # Shine chatbot with FAQ responses
  ThemeProvider.tsx    # CSS variable management from Supabase
  ThemeToggle.tsx      # Dark/light mode toggle (sun/moon)
  AudioPlayer.tsx
  ConferenceRoom.tsx
  FileUpload.tsx
  VoiceRecorder.tsx
  Whiteboard.tsx
hooks/            # Custom React hooks
  useCallNotification.ts
  useWebRTCGroup.ts
lib/              # Utility libraries
  i18n/           # Internationalization system
    translations.ts  # FR/EN/ES translation dictionaries
    useTranslation.ts # React hook for translations
  supabase/       # Supabase client/server helpers
  cn.ts           # className utility
  landing-defaults.ts
public/           # Static assets (fonts, images)
types/            # TypeScript type definitions
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (secret)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (secret)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)
- `NEXT_PUBLIC_SITE_URL` - Site URL for the application

## Development
- Dev server runs on port 5000 with `npm run dev`
- Node.js 22 is required (Next.js 16 compatibility)
- `allowedDevOrigins` configured for Replit proxy

## Features

### Dark/Light Mode
- Toggle button (sun/moon icon) in header and dashboard sidebar
- Light theme preserves gold accents with warm, premium feel
- Persisted in localStorage key `sos-shine-theme`
- CSS variables overridden via `[data-theme="light"]` selector

### Real-time Notifications
- Bell icon in dashboard with unread badge count
- Slide-out notification panel with glassmorphism styling
- Supabase realtime subscription for instant updates
- 30-second polling as fallback
- Supports types: new_douleur, new_event, new_post, new_soin

### Personal Goals (Objectifs)
- Users set personal wellness goals with title, description, target date
- Track active vs completed goals with stats bar
- Stored in localStorage key `sos-shine-goals`
- Full CRUD: create, mark complete, reactivate, delete

### Private Journal
- Write private thoughts with mood tracking (5 moods)
- Entries grouped by month, searchable by mood
- Character count and delete functionality
- Stored in localStorage key `sos-shine-journal`
- Privacy notice displayed

### Favorites/Bookmarks
- Heart button on encyclopedia articles (list and detail pages)
- Dedicated "Mes Favoris" page in dashboard
- Custom event `favorites-changed` for cross-component sync
- Stored in localStorage key `sos-shine-favorites`

### Multi-language Support (FR/EN/ES)
- Flag-based language selector dropdown in header and dashboard
- 100+ translation keys covering all UI strings
- Custom `useTranslation()` hook with parameter interpolation
- Persisted in localStorage key `sos-shine-locale`
- Custom event `locale-changed` for cross-component sync
- Default locale: French
- "douleur" never appears - uses "emotional challenge" (EN) / "desafío emocional" (ES)

### Signature Émotionnelle (Psychometric Test)
- Interactive 15-question personality test at `/signature-emotionnelle`
- 10 emotional profiles with weighted scoring system
- 4-phase UX: intro (name input) → quiz (progress bar) → loading animation → results
- Premium result report with 4 sections: L'Essence, Votre Lumière, La Zone d'Ombre, Votre Protocole
- Personalized with {firstName} injection throughout
- CTA card on landing page (after ticker band) linking to the test
- Data: `lib/signature-test.ts` (questions, profiles, scoring)
- Page: `app/signature-emotionnelle/page.tsx`

### Shine Chatbot
- Named "Shine" with custom avatar image
- FAQ-based responses about pricing, features, confidentiality
- Floating button with online indicator

### Landing Page Design (LeClub10-inspired)
- Word-by-word hero title reveal with blur-to-sharp animation
- Infinite scrolling ticker bands with emotional topics
- GlowingCard component with mouse-follow radial glow (RAF-throttled)
- ScrollProgress bar at top of page
- FloatingOrbs ambient background effect
- Fixed glassmorphism header that hides/shows on scroll direction
- Animated pricing cards with feature stagger reveal
- Text shimmer gradient animation for highlighted words
- Magnetic hover effect on CTA buttons with pulse ring
- prefers-reduced-motion support for accessibility

### Admin CMS
- All landing page sections fully editable from back-office
- Auto-merge logic for new section defaults
- Site settings (colors, logo) applied via ThemeProvider

## Content Sanitization Rule
- The word "douleur" must NEVER appear in visible UI
- Automatically replaced via `sanitizeContent()` function:
  - "douleur" → "challenge émotionnel" / "expérience de vie" / "schéma émotionnel"
  - Applied to all CMS content from Supabase
  - Translations use equivalent terms in EN/ES

## Pre-Launch Mode (Active)
- Homepage shows pre-launch waitlist page with countdown to March 22, 2026 midnight (Paris time)
- Early bird pricing: 19.90€/month (lifetime) for waitlist members, vs 29.90€/month standard
- Waitlist stored in PostgreSQL `waitlist` table (email, name, created_at, source)
- API endpoint: `/api/waitlist` (GET for count, POST to register)
- Original landing page backed up at `app/page-launch.tsx` for post-launch swap

## Recent Changes (Feb 2026)
- Added dark/light mode toggle with persistent theme switching
- Added real-time notification system with bell icon and slide-out panel
- Added personal wellness goals page (Objectifs)
- Added private journal/diary page with mood tracking
- Added favorites/bookmarks system for encyclopedia articles
- Added multi-language support (FR/EN/ES) with language selector
- All UI strings translated across 3 languages
- Added Shine chatbot with custom avatar
- Made all landing page sections CMS-driven from admin
- Redesigned landing page with LeClub10-inspired premium animations

## Deployment
- Build: `npm run build`
- Start: `npm run start` (port 5000)
- Target: Autoscale

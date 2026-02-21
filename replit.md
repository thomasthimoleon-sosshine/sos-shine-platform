# SOS Shine Platform

## Overview
SOS Shine is a premium community platform built with Next.js 16 for emotional support and life experiences. It features a dark, luxury design with gold accents, Supabase backend, and Stripe payments.

## Tech Stack
- **Framework**: Next.js 16.1.6 (Turbopack) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Backend**: Supabase (auth, database, storage)
- **Payments**: Stripe
- **UI**: Framer Motion, Excalidraw (whiteboard), custom glassmorphism design, LeClub10-inspired premium animations
- **Fonts**: Cormorant Garamond (display), DM Sans (body)

## Project Structure
```
app/              # Next.js App Router pages
  admin/          # Admin panel
  dashboard/      # User dashboard
  login/          # Login page
  signup/         # Signup page
  encyclopedie/   # Encyclopedia page
  rejoindre/      # Join page
  contact/        # Contact page
  cgv/            # Terms of service
  confidentialite/ # Privacy policy
  mentions-legales/ # Legal mentions
components/       # React components
  ui/             # UI components (CTAButton)
  AudioPlayer.tsx
  ConferenceRoom.tsx
  FileUpload.tsx
  ThemeProvider.tsx
  VoiceRecorder.tsx
  Whiteboard.tsx
hooks/            # Custom React hooks
  useCallNotification.ts
  useWebRTCGroup.ts
lib/              # Utility libraries
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

## Landing Page Design (LeClub10-inspired)
- Word-by-word hero title reveal with blur-to-sharp animation
- Infinite scrolling ticker bands with emotional topics
- GlowingCard component with mouse-follow radial glow (RAF-throttled)
- ScrollProgress bar at top of page
- FloatingOrbs ambient background effect
- Sparkling diamond particles overlay
- Fixed glassmorphism header that hides/shows on scroll direction
- Luxury letter-spacing uppercase labels
- Animated pricing cards with feature stagger reveal
- Text shimmer gradient animation for highlighted words
- Magnetic hover effect on CTA buttons with pulse ring
- prefers-reduced-motion support for accessibility

## Pre-Launch Mode (Active)
- Homepage now shows pre-launch waitlist page with countdown to March 22, 2026 midnight (Paris time)
- Early bird pricing: 19.90€/month (lifetime) for waitlist members, vs 29.90€/month standard
- Waitlist stored in PostgreSQL `waitlist` table (email, name, created_at, source)
- API endpoint: `/api/waitlist` (GET for count, POST to register)
- Original landing page backed up at `app/page-launch.tsx` for post-launch swap

## Recent Changes (Feb 2026)
- Added pre-launch waitlist page with countdown, early bird pricing, and premium animations
- Waitlist API using built-in PostgreSQL database (pg package)
- Middleware updated to allow API routes without authentication
- Redesigned landing page with LeClub10-inspired premium animations
- Fixed middleware to gracefully handle missing Supabase env vars
- Changed heading CSS from gradient-clip to solid gold color (fixes framer motion opacity conflicts)
- Added prefers-reduced-motion support

## Deployment
- Build: `npm run build`
- Start: `npm run start` (port 5000)
- Target: Autoscale

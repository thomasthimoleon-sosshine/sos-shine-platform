# SOS Shine Platform

## Overview
SOS Shine is a premium community platform built with Next.js 16 for emotional support and life experiences. It features a dark, luxury design with gold accents, Supabase backend, and Stripe payments.

## Tech Stack
- **Framework**: Next.js 16.1.6 (Turbopack) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Backend**: Supabase (auth, database, storage)
- **Payments**: Stripe
- **UI**: Framer Motion, Excalidraw (whiteboard), custom glassmorphism design
- **Fonts**: Cinzel (display), Montserrat/DM Sans (body)

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

## Deployment
- Build: `npm run build`
- Start: `npm run start` (port 5000)
- Target: Autoscale

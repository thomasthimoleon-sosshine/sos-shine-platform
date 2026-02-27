-- ══════════════════════════════════════════════════════════════
-- Migration: Ensure is_active column exists on profiles
-- Fixes: members list empty in admin back-office when column missing
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

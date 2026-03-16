-- ============================================
-- SOS Shine — Greetings Progress Tracking
-- Run this in Supabase SQL Editor
-- ============================================

-- Add greetings_progress column to profiles table
-- Tracks cyclic index per time slot for the rotating greeting system
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS greetings_progress jsonb
DEFAULT '{"night": 0, "morning": 0, "afternoon": 0, "evening": 0}'::jsonb;

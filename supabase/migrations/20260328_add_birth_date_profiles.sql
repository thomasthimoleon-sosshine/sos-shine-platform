-- =============================================
-- Migration: Add optional birth_date to profiles
-- Date: 2026-03-28
-- Purpose: Allow users to optionally provide their birth date
--          for personalized zodiac sign energy weather
-- =============================================

-- 1. Add birth_date column (nullable = optional)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL;

-- 2. Update handle_new_user trigger to capture birth_date from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, prenom, email, role, avatar_url, birth_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Membre'), ' ', 1)),
    COALESCE(NEW.email, ''),
    'member',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL
        THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

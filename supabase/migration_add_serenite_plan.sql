-- Migration: Add 'serenite' plan to profiles and subscriptions tables
-- Run this in Supabase SQL Editor

-- Step 1: Find and drop existing CHECK constraints on profiles.plan
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all CHECK constraints on profiles.plan
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'profiles'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%plan%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint % on profiles', r.conname;
  END LOOP;

  -- Drop all CHECK constraints on subscriptions.plan
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'subscriptions'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%plan%'
  LOOP
    EXECUTE format('ALTER TABLE public.subscriptions DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint % on subscriptions', r.conname;
  END LOOP;
END $$;

-- Step 2: Add the plan column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT;

-- Step 3: Add the plan column to subscriptions if it doesn't exist
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan TEXT;

-- Step 4: Re-create constraints with the new 'serenite' value
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('essential', 'serenite', 'premium'));

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('essential', 'serenite', 'premium'));

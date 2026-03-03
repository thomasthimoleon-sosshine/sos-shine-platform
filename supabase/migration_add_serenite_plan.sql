-- Migration: Add 'serenite' plan to profiles and subscriptions tables
-- Run this on existing databases to support the new 3-tier pricing structure

-- Update profiles.plan constraint to include 'serenite'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('essential', 'serenite', 'premium'));

-- Update subscriptions.plan constraint to include 'serenite'
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('essential', 'serenite', 'premium'));

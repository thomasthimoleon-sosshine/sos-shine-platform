-- =============================================
-- Migration: Profil enrichi + Mode anonyme
-- Date: 2026-02-17
-- =============================================

-- 1. Ajouter les colonnes profil (pseudo, bio, video_url)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pseudo TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- 2. Ajouter is_anonymous aux messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- 3. Créer le profil Julia Laureau avec rôle fondateur
-- Note: Julia doit d'abord s'inscrire via /signup avec l'email julialaureau@sosshine.com
-- Ensuite, exécutez cette commande pour lui donner le rôle fondateur :
-- UPDATE profiles SET role = 'founder' WHERE email = 'julialaureau@sosshine.com';
--
-- OU vous pouvez le faire directement depuis Admin > Membres en cliquant sur son badge de rôle.

-- ══════════════════════════════════════════════════════════════
-- Migration: Blocage de suppression + Avertissements utilisateurs
-- 1. Ajout colonne delete_locked sur posts
-- 2. Mise a jour RLS pour empecher suppression quand verrouille
-- 3. Ajout type 'warning' pour les notifications
-- ══════════════════════════════════════════════════════════════

-- 1. Ajouter delete_locked aux posts (false par defaut = suppression autorisee)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS delete_locked BOOLEAN NOT NULL DEFAULT false;

-- 2. Mettre a jour la politique RLS de suppression des posts par l'auteur
-- L'auteur ne peut supprimer que si delete_locked = false
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (
    auth.uid() = author_id
    AND delete_locked = false
  );

-- La politique admin reste inchangee (les admins peuvent toujours supprimer)
-- "Admins can delete any post" reste active

-- 3. Mettre a jour la contrainte notification_type pour inclure 'warning'
-- On supprime l'ancienne contrainte si elle existe et on la recree
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_notification_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_notification_type_check
  CHECK (notification_type IN ('new_douleur', 'new_event', 'new_post', 'new_soin', 'warning'));

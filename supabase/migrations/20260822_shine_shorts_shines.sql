-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — « Shines » sur les formats courts
--
-- L'équivalent du « j'aime » : un membre donne un Shine à un format court.
-- Jusqu'ici le bouton existait dans la modale mais n'était qu'un compteur
-- local (useState) : rien n'était enregistré, le compte repartait de zéro
-- à chaque ouverture. Cette table lui donne enfin un support.
--
-- À ne pas confondre avec shine_shorts_favorites, qui est « enregistrer »
-- (mettre de côté pour soi) — les deux coexistent, comme sur Instagram.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS shine_shorts_shines (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  short_id   uuid NOT NULL REFERENCES shine_shorts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, short_id)
);

CREATE INDEX IF NOT EXISTS idx_shine_shorts_shines_short ON shine_shorts_shines(short_id);
CREATE INDEX IF NOT EXISTS idx_shine_shorts_shines_user  ON shine_shorts_shines(user_id);

ALTER TABLE shine_shorts_shines ENABLE ROW LEVEL SECURITY;

-- Le nombre de Shines est public : tout le monde le voit sous la vidéo.
DROP POLICY IF EXISTS "shine_shorts_shines_select_all" ON shine_shorts_shines;
CREATE POLICY "shine_shorts_shines_select_all" ON shine_shorts_shines
  FOR SELECT USING (true);

-- On ne donne un Shine qu'en son propre nom.
DROP POLICY IF EXISTS "shine_shorts_shines_insert_own" ON shine_shorts_shines;
CREATE POLICY "shine_shorts_shines_insert_own" ON shine_shorts_shines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Et on ne retire que le sien.
DROP POLICY IF EXISTS "shine_shorts_shines_delete_own" ON shine_shorts_shines;
CREATE POLICY "shine_shorts_shines_delete_own" ON shine_shorts_shines
  FOR DELETE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

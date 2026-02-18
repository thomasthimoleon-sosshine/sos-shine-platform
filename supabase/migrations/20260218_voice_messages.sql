-- ══════════════════════════════════════════════════════
-- Ajout du support messages vocaux (audio)
-- ══════════════════════════════════════════════════════

-- Ajouter audio_url aux messages privés
ALTER TABLE private_messages
  ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio'));

-- Rendre content nullable pour les messages audio (qui n'ont pas de texte)
ALTER TABLE private_messages
  ALTER COLUMN content DROP NOT NULL;

-- Ajouter audio_url aux messages communautaires
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio'));

-- ══════════════════════════════════════════════════════
-- Table : private_messages (messagerie privée 1-to-1)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS private_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) <= 2000),
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index pour charger rapidement les conversations d'un utilisateur
CREATE INDEX idx_pm_sender   ON private_messages(sender_id, created_at DESC);
CREATE INDEX idx_pm_receiver ON private_messages(receiver_id, created_at DESC);
CREATE INDEX idx_pm_pair     ON private_messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

-- ── Row Level Security ──
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- Un utilisateur ne peut lire que ses propres messages (envoyés ou reçus)
CREATE POLICY "Users can read own messages"
ON private_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Un utilisateur peut envoyer un message (il est l'expéditeur)
CREATE POLICY "Users can send messages"
ON private_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Un utilisateur peut marquer comme lu les messages qu'il a reçus
CREATE POLICY "Users can mark received messages as read"
ON private_messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Un utilisateur peut supprimer ses propres messages envoyés
CREATE POLICY "Users can delete own sent messages"
ON private_messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

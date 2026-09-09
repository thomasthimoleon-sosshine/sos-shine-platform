-- ══════════════════════════════════════════════
-- Messages d'encouragement paramétrables
-- ══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS encouragement_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  time_slot text NOT NULL CHECK (time_slot IN ('night', 'morning', 'afternoon', 'evening')),
  message text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_encouragement_slot_active ON encouragement_messages(time_slot, is_active, sort_order);

-- RLS
ALTER TABLE encouragement_messages ENABLE ROW LEVEL SECURITY;

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "encouragement_messages_read" ON encouragement_messages
  FOR SELECT TO authenticated USING (true);

-- Écriture uniquement pour les fondateurs/admins
CREATE POLICY "encouragement_messages_write" ON encouragement_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

-- ══════════════════════════════════════════════════════════════
-- "Mes Rayons" — Système de connexions personnelles SOS Shine
-- Equivalent d'amis mais avec la terminologie "Rayon" (rayon de lumière)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.shine_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Empêcher les doublons (A→B et B→A)
  CONSTRAINT unique_connection UNIQUE (sender_id, receiver_id),
  CONSTRAINT no_self_connection CHECK (sender_id <> receiver_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_shine_connections_sender ON public.shine_connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_shine_connections_receiver ON public.shine_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_shine_connections_status ON public.shine_connections(status);

-- RLS
ALTER TABLE public.shine_connections ENABLE ROW LEVEL SECURITY;

-- Lecture : voir ses propres connexions (envoyées ou reçues)
CREATE POLICY "Users can view own connections"
  ON public.shine_connections FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Insertion : envoyer un rayon
CREATE POLICY "Users can send a rayon"
  ON public.shine_connections FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Mise à jour : le destinataire peut accepter/refuser
CREATE POLICY "Receiver can update connection status"
  ON public.shine_connections FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Suppression : l'un ou l'autre peut supprimer la connexion
CREATE POLICY "Users can delete own connections"
  ON public.shine_connections FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

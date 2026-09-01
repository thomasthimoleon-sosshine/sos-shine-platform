-- SOS SHINE® — Événements physiques (page /event)
-- Table indépendante des events membres (soins collectifs, lives, etc.)
-- Destinée aux événements publics avec QR code, Stripe, visuels libres

CREATE TABLE IF NOT EXISTS public.physical_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  event_date    TIMESTAMPTZ,
  end_time      TEXT,                    -- ex: "21h30"
  location_name TEXT,
  address       TEXT,
  image_url     TEXT,
  is_free       BOOLEAN DEFAULT false,
  price_label   TEXT,                    -- ex: "21€ d'acompte · 90€ sur place"
  stripe_url    TEXT,                    -- lien Stripe payment link
  cta_label     TEXT DEFAULT 'Réserver ma place',
  max_spots     INTEGER,
  is_published  BOOLEAN DEFAULT false,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seul le service role peut lire/écrire (admin)
ALTER TABLE public.physical_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "physical_events_public_read" ON public.physical_events
  FOR SELECT USING (is_published = true);

CREATE POLICY "physical_events_admin_all" ON public.physical_events
  FOR ALL USING (true) WITH CHECK (true);

-- Seed: L'Éveil
INSERT INTO public.physical_events (
  title, subtitle, description, event_date, end_time,
  location_name, address, is_free, price_label,
  stripe_url, cta_label, max_spots, is_published, sort_order
) VALUES (
  'L''Éveil',
  'Premier événement physique SOS Shine · Été 2026',
  'Une soirée au bord du lac. Quelque chose va changer en toi.',
  '2026-06-13 18:00:00+02',
  '21h30',
  'Lac de Saint-Cassien',
  'Adresse communiquée 24h avant',
  false,
  '21€ d''acompte · Solde 90€ en espèces sur place',
  'https://buy.stripe.com/bJe5kvai06p5d7r0C65ZC0p',
  'Réserver ma place',
  20,
  true,
  0
);

NOTIFY pgrst, 'reload schema';

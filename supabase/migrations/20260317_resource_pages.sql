-- Resource pages: editable book/resource pages accessible from login
CREATE TABLE IF NOT EXISTS resource_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  button_label TEXT NOT NULL DEFAULT '',
  button_url TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE resource_pages ENABLE ROW LEVEL SECURITY;

-- Public read access for published pages
CREATE POLICY "Public can read published resource pages"
  ON resource_pages FOR SELECT
  USING (published = true);

-- Founders can manage all resource pages
CREATE POLICY "Founders can manage resource pages"
  ON resource_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'founder'
    )
  );

-- Seed the two default resource pages
INSERT INTO resource_pages (slug, title, subtitle, content, cover_image, button_label, button_url) VALUES
  ('livre-sos-shine', 'Livre SOS Shine', 'Découvrez le livre qui transforme votre vie', '<p>Contenu du livre SOS Shine à personnaliser depuis le back-office.</p>', '', 'Commander le livre', '#'),
  ('livre-supers-pouvoirs', 'Livre Supers Pouvoirs', 'Réveillez vos supers pouvoirs intérieurs', '<p>Contenu du livre Supers Pouvoirs à personnaliser depuis le back-office.</p>', '', 'Commander le livre', '#')
ON CONFLICT (slug) DO NOTHING;

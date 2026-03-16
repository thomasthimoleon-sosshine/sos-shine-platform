-- ═══════════════════════════════════════════════════════════════
-- SHINE SHORTS — Tables pour les vidéos courtes (cours)
-- ═══════════════════════════════════════════════════════════════

-- Table des Shorts
CREATE TABLE IF NOT EXISTS shine_shorts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  category TEXT NOT NULL DEFAULT 'cours',
  duration_seconds INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoris des utilisateurs
CREATE TABLE IF NOT EXISTS shine_shorts_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  short_id UUID REFERENCES shine_shorts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, short_id)
);

-- Notes (1 à 5 étoiles)
CREATE TABLE IF NOT EXISTS shine_shorts_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  short_id UUID REFERENCES shine_shorts(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, short_id)
);

-- Avis / Commentaires
CREATE TABLE IF NOT EXISTS shine_shorts_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  short_id UUID REFERENCES shine_shorts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_shine_shorts_favorites_user ON shine_shorts_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_shine_shorts_favorites_short ON shine_shorts_favorites(short_id);
CREATE INDEX IF NOT EXISTS idx_shine_shorts_ratings_short ON shine_shorts_ratings(short_id);
CREATE INDEX IF NOT EXISTS idx_shine_shorts_reviews_short ON shine_shorts_reviews(short_id);
CREATE INDEX IF NOT EXISTS idx_shine_shorts_category ON shine_shorts(category);
CREATE INDEX IF NOT EXISTS idx_shine_shorts_published ON shine_shorts(is_published);

-- RLS (Row Level Security)
ALTER TABLE shine_shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_shorts_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_shorts_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_shorts_reviews ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les shorts publiés
CREATE POLICY "Shorts publiés visibles par tous" ON shine_shorts
  FOR SELECT USING (is_published = true);

-- Politique : Les admins peuvent tout faire sur les shorts
CREATE POLICY "Admins gèrent les shorts" ON shine_shorts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

-- Politique : Favoris - chaque user gère les siens
CREATE POLICY "Users gèrent leurs favoris shorts" ON shine_shorts_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Politique : Notes - chaque user gère les siennes, tout le monde peut lire
CREATE POLICY "Tout le monde lit les notes shorts" ON shine_shorts_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users gèrent leurs notes shorts" ON shine_shorts_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs notes shorts" ON shine_shorts_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : Avis - tout le monde lit, chaque user gère les siens
CREATE POLICY "Tout le monde lit les avis shorts" ON shine_shorts_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users créent leurs avis shorts" ON shine_shorts_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs avis shorts" ON shine_shorts_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users suppriment leurs avis shorts" ON shine_shorts_reviews
  FOR DELETE USING (auth.uid() = user_id);

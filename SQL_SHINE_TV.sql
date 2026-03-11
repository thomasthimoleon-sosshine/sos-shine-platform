-- ═══════════════════════════════════════════════════════════════
-- SHINE TV — Tables pour les vidéos, favoris, notes et avis
-- ═══════════════════════════════════════════════════════════════

-- Table des vidéos Shine TV
CREATE TABLE IF NOT EXISTS shine_tv_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  category TEXT NOT NULL DEFAULT 'healing',
  duration_minutes INTEGER DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoris des utilisateurs
CREATE TABLE IF NOT EXISTS shine_tv_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES shine_tv_videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Notes (1 à 5 étoiles)
CREATE TABLE IF NOT EXISTS shine_tv_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES shine_tv_videos(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Avis / Commentaires
CREATE TABLE IF NOT EXISTS shine_tv_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES shine_tv_videos(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_shine_tv_favorites_user ON shine_tv_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_shine_tv_favorites_video ON shine_tv_favorites(video_id);
CREATE INDEX IF NOT EXISTS idx_shine_tv_ratings_video ON shine_tv_ratings(video_id);
CREATE INDEX IF NOT EXISTS idx_shine_tv_reviews_video ON shine_tv_reviews(video_id);
CREATE INDEX IF NOT EXISTS idx_shine_tv_videos_category ON shine_tv_videos(category);
CREATE INDEX IF NOT EXISTS idx_shine_tv_videos_published ON shine_tv_videos(is_published);

-- RLS (Row Level Security)
ALTER TABLE shine_tv_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_tv_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_tv_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_tv_reviews ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les vidéos publiées
CREATE POLICY "Videos publiées visibles par tous" ON shine_tv_videos
  FOR SELECT USING (is_published = true);

-- Politique : Les admins peuvent tout faire sur les vidéos
CREATE POLICY "Admins gèrent les vidéos" ON shine_tv_videos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

-- Politique : Favoris - chaque user gère les siens
CREATE POLICY "Users gèrent leurs favoris" ON shine_tv_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Politique : Notes - chaque user gère les siennes, tout le monde peut lire
CREATE POLICY "Tout le monde lit les notes" ON shine_tv_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users gèrent leurs notes" ON shine_tv_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs notes" ON shine_tv_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : Avis - tout le monde lit, chaque user gère les siens
CREATE POLICY "Tout le monde lit les avis" ON shine_tv_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users créent leurs avis" ON shine_tv_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs avis" ON shine_tv_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users suppriment leurs avis" ON shine_tv_reviews
  FOR DELETE USING (auth.uid() = user_id);

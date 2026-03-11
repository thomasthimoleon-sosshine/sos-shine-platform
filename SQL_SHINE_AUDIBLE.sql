-- ═══════════════════════════════════════════════════════════════
-- SHINE AUDIBLE — Tables pour les audios, podcasts, méditations
-- ═══════════════════════════════════════════════════════════════

-- Table des audios Shine Audible
CREATE TABLE IF NOT EXISTS shine_audible_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  audio_url TEXT,
  narrator TEXT,
  category TEXT NOT NULL DEFAULT 'meditation',
  content_type TEXT NOT NULL DEFAULT 'podcast' CHECK (content_type IN ('podcast', 'audiobook', 'meditation', 'hypnosis', 'ambient')),
  duration_seconds INTEGER DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoris des utilisateurs
CREATE TABLE IF NOT EXISTS shine_audible_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES shine_audible_tracks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Notes (1 à 5 étoiles)
CREATE TABLE IF NOT EXISTS shine_audible_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES shine_audible_tracks(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Avis / Commentaires
CREATE TABLE IF NOT EXISTS shine_audible_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES shine_audible_tracks(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique d'écoute
CREATE TABLE IF NOT EXISTS shine_audible_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES shine_audible_tracks(id) ON DELETE CASCADE NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  listened_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_shine_audible_favorites_user ON shine_audible_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_shine_audible_favorites_track ON shine_audible_favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_shine_audible_ratings_track ON shine_audible_ratings(track_id);
CREATE INDEX IF NOT EXISTS idx_shine_audible_reviews_track ON shine_audible_reviews(track_id);
CREATE INDEX IF NOT EXISTS idx_shine_audible_tracks_category ON shine_audible_tracks(category);
CREATE INDEX IF NOT EXISTS idx_shine_audible_tracks_type ON shine_audible_tracks(content_type);
CREATE INDEX IF NOT EXISTS idx_shine_audible_tracks_published ON shine_audible_tracks(is_published);
CREATE INDEX IF NOT EXISTS idx_shine_audible_history_user ON shine_audible_history(user_id);

-- RLS (Row Level Security)
ALTER TABLE shine_audible_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_audible_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_audible_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_audible_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_audible_history ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les audios publiés
CREATE POLICY "Audios publiés visibles par tous" ON shine_audible_tracks
  FOR SELECT USING (is_published = true);

-- Politique : Les admins peuvent tout faire sur les audios
CREATE POLICY "Admins gèrent les audios" ON shine_audible_tracks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

-- Politique : Favoris - chaque user gère les siens
CREATE POLICY "Users gèrent leurs favoris audible" ON shine_audible_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Politique : Notes
CREATE POLICY "Tout le monde lit les notes audible" ON shine_audible_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users gèrent leurs notes audible" ON shine_audible_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs notes audible" ON shine_audible_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : Avis
CREATE POLICY "Tout le monde lit les avis audible" ON shine_audible_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users créent leurs avis audible" ON shine_audible_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs avis audible" ON shine_audible_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users suppriment leurs avis audible" ON shine_audible_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Politique : Historique d'écoute
CREATE POLICY "Users gèrent leur historique audible" ON shine_audible_history
  FOR ALL USING (auth.uid() = user_id);

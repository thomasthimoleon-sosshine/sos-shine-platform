-- ═══════════════════════════════════════════════════════════════
-- SHINE LIBRAIRIE — Table pour les eBooks, livres PDF
-- ═══════════════════════════════════════════════════════════════

-- Table des livres Shine Librairie
CREATE TABLE IF NOT EXISTS shine_library_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'SOS Shine',
  description TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  category TEXT NOT NULL DEFAULT 'healing',
  content_type TEXT NOT NULL DEFAULT 'ebook' CHECK (content_type IN ('ebook', 'guide', 'workbook', 'journal', 'protocol')),
  page_count INTEGER DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoris des utilisateurs
CREATE TABLE IF NOT EXISTS shine_library_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES shine_library_books(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Notes (1 à 5 étoiles)
CREATE TABLE IF NOT EXISTS shine_library_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES shine_library_books(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Avis / Commentaires
CREATE TABLE IF NOT EXISTS shine_library_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES shine_library_books(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_shine_library_favorites_user ON shine_library_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_shine_library_favorites_book ON shine_library_favorites(book_id);
CREATE INDEX IF NOT EXISTS idx_shine_library_ratings_book ON shine_library_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_shine_library_reviews_book ON shine_library_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_shine_library_books_category ON shine_library_books(category);
CREATE INDEX IF NOT EXISTS idx_shine_library_books_type ON shine_library_books(content_type);
CREATE INDEX IF NOT EXISTS idx_shine_library_books_published ON shine_library_books(is_published);

-- RLS (Row Level Security)
ALTER TABLE shine_library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_library_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_library_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shine_library_reviews ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les livres publiés
CREATE POLICY "Livres publiés visibles par tous" ON shine_library_books
  FOR SELECT USING (is_published = true);

-- Politique : Les admins peuvent tout faire sur les livres
CREATE POLICY "Admins gèrent les livres" ON shine_library_books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'admin_content'))
  );

-- Politique : Favoris - chaque user gère les siens
CREATE POLICY "Users gèrent leurs favoris library" ON shine_library_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Politique : Notes
CREATE POLICY "Tout le monde lit les notes library" ON shine_library_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users gèrent leurs notes library" ON shine_library_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs notes library" ON shine_library_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : Avis
CREATE POLICY "Tout le monde lit les avis library" ON shine_library_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users créent leurs avis library" ON shine_library_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modifient leurs avis library" ON shine_library_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users suppriment leurs avis library" ON shine_library_reviews
  FOR DELETE USING (auth.uid() = user_id);

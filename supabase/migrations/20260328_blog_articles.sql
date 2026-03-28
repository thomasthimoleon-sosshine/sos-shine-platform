-- Blog articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  author_name TEXT DEFAULT 'SOS Shine',
  author_role TEXT DEFAULT '',
  published_at DATE DEFAULT CURRENT_DATE,
  read_time INT DEFAULT 5,
  category TEXT DEFAULT 'transformation',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  featured BOOLEAN DEFAULT false,
  content TEXT DEFAULT '',
  content_type TEXT DEFAULT 'markdown',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_articles' AND policyname = 'Public can read published articles'
  ) THEN
    CREATE POLICY "Public can read published articles"
      ON blog_articles FOR SELECT
      USING (is_published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_articles' AND policyname = 'Admins can manage articles'
  ) THEN
    CREATE POLICY "Admins can manage articles"
      ON blog_articles FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('founder', 'admin_content', 'admin_support')
        )
      );
  END IF;
END $$;

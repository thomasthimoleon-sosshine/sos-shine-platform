-- Link blog articles to encyclopedia entries (douleurs)
-- Each blog article can optionally be linked to one douleur via its slug

ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS douleur_slug TEXT;

-- Foreign key: if the referenced douleur is deleted, the blog article keeps
-- a NULL douleur_slug (gracefully degrades)
ALTER TABLE blog_articles
  DROP CONSTRAINT IF EXISTS blog_articles_douleur_slug_fkey;

ALTER TABLE blog_articles
  ADD CONSTRAINT blog_articles_douleur_slug_fkey
  FOREIGN KEY (douleur_slug)
  REFERENCES douleurs(slug)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Index for fast lookup when fetching the blog article linked to a douleur
CREATE INDEX IF NOT EXISTS idx_blog_articles_douleur_slug
  ON blog_articles(douleur_slug)
  WHERE douleur_slug IS NOT NULL;

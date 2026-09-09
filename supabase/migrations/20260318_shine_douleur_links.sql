-- ══════════════════════════════════════════════════════════════
-- Migration: Link Shine sections to Encyclopédie (douleurs)
-- Adds douleur_id FK to shine_tv_videos, shine_audible_tracks,
-- shine_shorts, shine_library_books so content can be connected
-- to encyclopedia entries and badges displayed on cards.
-- ══════════════════════════════════════════════════════════════

-- Shine TV Videos
ALTER TABLE shine_tv_videos
  ADD COLUMN IF NOT EXISTS douleur_id UUID REFERENCES douleurs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shine_tv_videos_douleur_id
  ON shine_tv_videos(douleur_id) WHERE douleur_id IS NOT NULL;

-- Shine Audible Tracks
ALTER TABLE shine_audible_tracks
  ADD COLUMN IF NOT EXISTS douleur_id UUID REFERENCES douleurs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shine_audible_tracks_douleur_id
  ON shine_audible_tracks(douleur_id) WHERE douleur_id IS NOT NULL;

-- Shine Shorts
ALTER TABLE shine_shorts
  ADD COLUMN IF NOT EXISTS douleur_id UUID REFERENCES douleurs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shine_shorts_douleur_id
  ON shine_shorts(douleur_id) WHERE douleur_id IS NOT NULL;

-- Shine Library Books
ALTER TABLE shine_library_books
  ADD COLUMN IF NOT EXISTS douleur_id UUID REFERENCES douleurs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shine_library_books_douleur_id
  ON shine_library_books(douleur_id) WHERE douleur_id IS NOT NULL;

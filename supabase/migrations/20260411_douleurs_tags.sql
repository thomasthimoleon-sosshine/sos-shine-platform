-- Ajoute un champ tags (array) sur les douleurs
-- Les tags sont des mots-clés libres pour interconnecter plusieurs douleurs
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Index GIN pour rechercher rapidement par tag
CREATE INDEX IF NOT EXISTS idx_douleurs_tags ON douleurs USING GIN(tags);

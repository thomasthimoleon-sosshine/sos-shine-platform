-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Titres personnalisés par outil dans une étape de protocole
-- Permet à l'admin de nommer chaque ressource (ex. « Séance d'activation
-- énergétique », « Hypnose de William », « Cahier de travail ») au lieu
-- des libellés génériques. Tous nullables : si vide → libellé par défaut.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE douleur_steps
  ADD COLUMN IF NOT EXISTS video_title  text,
  ADD COLUMN IF NOT EXISTS video2_title text,
  ADD COLUMN IF NOT EXISTS audio_title  text,
  ADD COLUMN IF NOT EXISTS audio2_title text,
  ADD COLUMN IF NOT EXISTS pdf_title    text;

NOTIFY pgrst, 'reload schema';

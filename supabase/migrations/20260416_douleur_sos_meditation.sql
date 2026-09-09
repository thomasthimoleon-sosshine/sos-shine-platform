-- SOS meditation per douleur: 5-min emergency meditation audio
-- Accessible via a dedicated red SOS button on the douleur page
-- and via its own route /dashboard/encyclopedie/[slug]/sos

ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS sos_audio_url TEXT;
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS sos_description TEXT;
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS sos_duration_seconds INT;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Second media slots per step
-- Step 1 "Comprendre": 2 videos (primary + secondary)
-- Step 2 "Libérer": 2 audios (primary + secondary)

-- Legacy columns on douleurs table
-- Step 1: second video
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS video_url_2 TEXT;
-- Step 2: second audio (audio_energy_url_2)
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS audio_energy_url_2 TEXT;

-- Dynamic steps table: generic second slots
ALTER TABLE douleur_steps ADD COLUMN IF NOT EXISTS video_url_2 TEXT;
ALTER TABLE douleur_steps ADD COLUMN IF NOT EXISTS audio_url_2 TEXT;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

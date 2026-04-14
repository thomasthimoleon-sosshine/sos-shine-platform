-- Add a second video slot on each step
-- Allows Julia to upload 2 videos per step (e.g. intro + protocol, or version A + version B)

-- Legacy columns on douleurs table (steps 1, 2, 3)
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS video_url_2 TEXT;
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS step2_video_url_2 TEXT;
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS step3_video_url_2 TEXT;

-- Dynamic steps table
ALTER TABLE douleur_steps ADD COLUMN IF NOT EXISTS video_url_2 TEXT;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Separate cover images for each media within a step
ALTER TABLE public.douleur_steps
  ADD COLUMN IF NOT EXISTS video_cover TEXT,
  ADD COLUMN IF NOT EXISTS video2_cover TEXT,
  ADD COLUMN IF NOT EXISTS audio_cover TEXT,
  ADD COLUMN IF NOT EXISTS audio2_cover TEXT;

NOTIFY pgrst, 'reload schema';

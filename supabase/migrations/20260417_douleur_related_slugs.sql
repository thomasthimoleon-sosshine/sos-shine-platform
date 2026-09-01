-- Add manual related douleurs field
-- Julia can pick which modules to recommend at the end of each one
ALTER TABLE public.douleurs
  ADD COLUMN IF NOT EXISTS related_slugs TEXT[] DEFAULT '{}';

NOTIFY pgrst, 'reload schema';

-- Add cover image to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS cover_image TEXT;

NOTIFY pgrst, 'reload schema';

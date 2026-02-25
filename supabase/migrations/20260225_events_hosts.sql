-- Add hosts column to events table
-- Stores an array of founder keys (e.g. ['julia', 'william', 'thomas'])
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hosts TEXT[] DEFAULT '{}';

-- Add time_on_page tracking to site_visits
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS time_on_page_seconds INTEGER;

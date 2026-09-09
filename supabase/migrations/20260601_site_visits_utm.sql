-- Add UTM tracking columns to site_visits
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS utm_content TEXT;

CREATE INDEX IF NOT EXISTS idx_site_visits_utm_source ON site_visits(utm_source);

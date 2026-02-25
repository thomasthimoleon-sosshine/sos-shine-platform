-- Add missing media columns so each step can have video + audio + PDF
ALTER TABLE public.douleurs
  ADD COLUMN IF NOT EXISTS step1_audio_url TEXT,
  ADD COLUMN IF NOT EXISTS step1_pdf_url   TEXT,
  ADD COLUMN IF NOT EXISTS step2_video_url TEXT,
  ADD COLUMN IF NOT EXISTS step2_pdf_url   TEXT,
  ADD COLUMN IF NOT EXISTS step3_video_url TEXT;

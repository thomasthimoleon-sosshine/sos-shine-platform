-- Migration: Add step-level image columns to douleurs table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS step1_image_url TEXT DEFAULT NULL;
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS step2_image_url TEXT DEFAULT NULL;
ALTER TABLE douleurs ADD COLUMN IF NOT EXISTS step3_image_url TEXT DEFAULT NULL;

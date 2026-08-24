-- Migration: 00015_drop_match_from_job_applications.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)
-- Drop the legacy manual 'match' column in favor of 'ai_match_analysis'

ALTER TABLE public.job_applications
DROP COLUMN IF EXISTS match;

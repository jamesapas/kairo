-- Migration: 00012_add_ai_match_analysis_to_job_applications.sql
-- Add ai_match_analysis column to public.job_applications

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS ai_match_analysis JSONB DEFAULT NULL;

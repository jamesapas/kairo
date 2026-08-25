-- Migration: 00016_add_ai_apply_materials_to_job_applications.sql
-- Add ai_apply_materials JSONB column to public.job_applications for persisting Cover Letter, Application Message, and Resume Suggestions

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS ai_apply_materials JSONB DEFAULT NULL;

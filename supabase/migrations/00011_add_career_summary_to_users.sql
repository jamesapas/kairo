-- Migration: 00011_add_career_summary_to_users.sql
-- Add career_summary column to public.users

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS career_summary TEXT;

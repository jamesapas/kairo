-- Migration: 00019_make_education_years_optional.sql
-- Allow start_month and start_year to be optional/nullable in user_educations

ALTER TABLE public.user_educations ALTER COLUMN start_month DROP NOT NULL;
ALTER TABLE public.user_educations ALTER COLUMN start_month DROP DEFAULT;
ALTER TABLE public.user_educations ALTER COLUMN start_year DROP NOT NULL;
ALTER TABLE public.user_educations ALTER COLUMN start_year DROP DEFAULT;

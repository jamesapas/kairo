-- Migration: 00018_make_company_optional_in_job_applications.sql
-- Allow job postings without a company name (drop NOT NULL constraint and set default empty string)

ALTER TABLE public.job_applications 
  ALTER COLUMN company DROP NOT NULL,
  ALTER COLUMN company SET DEFAULT '';

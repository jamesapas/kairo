-- Replace rigid link columns with a flexible links JSONB array
ALTER TABLE public.users
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS github_url,
  DROP COLUMN IF EXISTS portfolio_url,
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb NOT NULL;

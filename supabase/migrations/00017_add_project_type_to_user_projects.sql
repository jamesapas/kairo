-- Migration: 00017_add_project_type_to_user_projects.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

-- Ensure column exists with default 'key'
ALTER TABLE public.user_projects 
  ADD COLUMN IF NOT EXISTS project_type TEXT NOT NULL DEFAULT 'key';

-- Migrate existing rows: user specified that current ones are Key projects
UPDATE public.user_projects
  SET project_type = 'key'
  WHERE project_type IS NULL OR project_type = 'side_project';

-- Set column default to 'key'
ALTER TABLE public.user_projects
  ALTER COLUMN project_type SET DEFAULT 'key';

-- Add check constraint for valid project types
ALTER TABLE public.user_projects
  DROP CONSTRAINT IF EXISTS user_projects_project_type_check;

ALTER TABLE public.user_projects
  ADD CONSTRAINT user_projects_project_type_check 
  CHECK (project_type IN ('key', 'side', 'capstone'));

-- Add index on project_type for efficient filtering/sorting
CREATE INDEX IF NOT EXISTS idx_user_projects_project_type ON public.user_projects(user_id, project_type);

-- Migration: 00010_create_user_projects.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  live_url TEXT,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_sort_order ON public.user_projects(user_id, sort_order ASC, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.user_projects;
CREATE POLICY "Users can view their own projects"
  ON public.user_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.user_projects;
CREATE POLICY "Users can insert their own projects"
  ON public.user_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.user_projects;
CREATE POLICY "Users can update their own projects"
  ON public.user_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.user_projects;
CREATE POLICY "Users can delete their own projects"
  ON public.user_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

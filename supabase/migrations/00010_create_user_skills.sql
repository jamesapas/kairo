-- Migration: 00010_create_user_skills.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Frameworks & Libraries',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON public.user_skills(user_id, category, sort_order ASC);

-- Enable Row Level Security
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own skills" ON public.user_skills;
CREATE POLICY "Users can view their own skills"
  ON public.user_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own skills" ON public.user_skills;
CREATE POLICY "Users can insert their own skills"
  ON public.user_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own skills" ON public.user_skills;
CREATE POLICY "Users can update their own skills"
  ON public.user_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own skills" ON public.user_skills;
CREATE POLICY "Users can delete their own skills"
  ON public.user_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

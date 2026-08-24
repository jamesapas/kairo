-- Migration: 00009_create_user_educations.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

CREATE TABLE IF NOT EXISTS public.user_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_month TEXT NOT NULL DEFAULT 'Aug',
  start_year TEXT NOT NULL DEFAULT '2020',
  end_month TEXT,
  end_year TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT,
  honors TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_educations_user_id ON public.user_educations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_educations_sort_order ON public.user_educations(user_id, sort_order ASC, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_educations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own educations" ON public.user_educations;
CREATE POLICY "Users can view their own educations"
  ON public.user_educations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own educations" ON public.user_educations;
CREATE POLICY "Users can insert their own educations"
  ON public.user_educations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own educations" ON public.user_educations;
CREATE POLICY "Users can update their own educations"
  ON public.user_educations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own educations" ON public.user_educations;
CREATE POLICY "Users can delete their own educations"
  ON public.user_educations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

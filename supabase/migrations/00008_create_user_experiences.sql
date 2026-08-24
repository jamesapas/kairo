-- Migration: 00008_create_user_experiences.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

CREATE TABLE IF NOT EXISTS public.user_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  workplace_type TEXT NOT NULL DEFAULT 'Remote',
  location TEXT,
  start_month TEXT NOT NULL DEFAULT 'Jan',
  start_year TEXT NOT NULL DEFAULT '2024',
  end_month TEXT,
  end_year TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_experiences_user_id ON public.user_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experiences_sort_order ON public.user_experiences(user_id, sort_order ASC, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_experiences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own experiences" ON public.user_experiences;
CREATE POLICY "Users can view their own experiences"
  ON public.user_experiences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own experiences" ON public.user_experiences;
CREATE POLICY "Users can insert their own experiences"
  ON public.user_experiences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own experiences" ON public.user_experiences;
CREATE POLICY "Users can update their own experiences"
  ON public.user_experiences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own experiences" ON public.user_experiences;
CREATE POLICY "Users can delete their own experiences"
  ON public.user_experiences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

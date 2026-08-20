-- Migration: 00002_create_users_table.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

-- 1. Clear out existing profiles table data
TRUNCATE TABLE public.profiles CASCADE;

-- 2. Create public.users table referencing auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for public.users
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
CREATE POLICY "Allow authenticated users to read users"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow users to update own record" ON public.users;
CREATE POLICY "Allow users to update own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert own record" ON public.users;
CREATE POLICY "Allow users to insert own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Trigger function to synchronize auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Backfill any existing auth.users into public.users
INSERT INTO public.users (id, email)
SELECT id, email
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Migration: 00005_consolidate_to_users_table.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

-- 1. Add profile fields to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- 2. Migrate existing data from public.profiles to public.users if profiles exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    UPDATE public.users u
    SET 
      name = COALESCE(u.name, p.name),
      location = COALESCE(u.location, p.location),
      avatar_url = COALESCE(u.avatar_url, p.avatar_url),
      linkedin_url = COALESCE(u.linkedin_url, p.linkedin_url),
      github_url = COALESCE(u.github_url, p.github_url),
      portfolio_url = COALESCE(u.portfolio_url, p.portfolio_url)
    FROM public.profiles p
    WHERE u.id = p.id;
    
    -- Drop the profiles table
    DROP TABLE public.profiles CASCADE;
  END IF;
END $$;

-- 3. Simplify handle_new_user trigger to populate public.users only
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill any missing names in public.users
UPDATE public.users
SET name = split_part(email, '@', 1)
WHERE name IS NULL AND email IS NOT NULL;

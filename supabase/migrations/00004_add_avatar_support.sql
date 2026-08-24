-- Migration: 00004_add_avatar_support.sql
-- Target: Kairo Supabase Project (hqghwnrgyvlthffxesjt)

-- 1. Add avatar_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated avatar uploads" ON storage.objects;
CREATE POLICY "Allow authenticated avatar uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated avatar updates" ON storage.objects;
CREATE POLICY "Allow authenticated avatar updates"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated avatar deletes" ON storage.objects;
CREATE POLICY "Allow authenticated avatar deletes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

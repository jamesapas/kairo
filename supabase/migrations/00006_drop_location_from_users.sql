-- Drop location column from public.users
ALTER TABLE public.users DROP COLUMN IF EXISTS location;

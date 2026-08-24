-- Migration: 00014_deduplicate_and_unique_user_skills.sql
-- Remove duplicate user skills and ensure case-insensitive uniqueness per user

DELETE FROM public.user_skills a
USING public.user_skills b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND LOWER(a.name) = LOWER(b.name);

CREATE UNIQUE INDEX IF NOT EXISTS user_skills_user_id_lower_name_idx 
ON public.user_skills (user_id, LOWER(name));

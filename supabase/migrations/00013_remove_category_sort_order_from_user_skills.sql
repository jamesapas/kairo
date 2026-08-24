-- Migration: 00013_remove_category_sort_order_from_user_skills.sql
-- Drop category and sort_order columns from public.user_skills

ALTER TABLE public.user_skills DROP COLUMN IF EXISTS category;
ALTER TABLE public.user_skills DROP COLUMN IF EXISTS sort_order;

-- Fix exercise_definitions: add missing columns if the table exists with a different schema.
-- Run in Supabase Dashboard → SQL Editor.

-- Add "name" and other expected columns if they don't exist (Postgres 11+)
alter table public.exercise_definitions add column if not exists name text;
alter table public.exercise_definitions add column if not exists muscle_group text;
alter table public.exercise_definitions add column if not exists category text;
alter table public.exercise_definitions add column if not exists equipment text;
alter table public.exercise_definitions add column if not exists description text;
alter table public.exercise_definitions add column if not exists video_url text;
alter table public.exercise_definitions add column if not exists exercisedb_id text;
alter table public.exercise_definitions add column if not exists exercisedb_image_url text;
alter table public.exercise_definitions add column if not exists exercisedb_gif_url text;
alter table public.exercise_definitions add column if not exists exercisedb_target_muscles jsonb default '[]'::jsonb;
alter table public.exercise_definitions add column if not exists exercisedb_secondary_muscles jsonb default '[]'::jsonb;
alter table public.exercise_definitions add column if not exists exercisedb_variations jsonb default '[]'::jsonb;
alter table public.exercise_definitions add column if not exists exercisedb_related_exercises jsonb default '[]'::jsonb;
alter table public.exercise_definitions add column if not exists created_at timestamptz default now();

-- If the table had a different column for "name" (e.g. "title"), copy data and drop old column
-- Uncomment and adjust if you had "title" instead of "name":
-- update public.exercise_definitions set name = title where name is null and title is not null;
-- alter table public.exercise_definitions drop column if exists title;

-- Ensure name is not null for new rows (optional)
-- alter table public.exercise_definitions alter column name set not null;  -- only if no nulls

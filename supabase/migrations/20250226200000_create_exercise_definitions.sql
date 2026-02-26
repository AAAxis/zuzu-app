-- Table for saved exercises from ExerciseDB (dashboard exercises + training builder).
-- Run in Supabase Dashboard → SQL Editor if the table doesn't exist yet.

create table if not exists public.exercise_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text,
  category text,
  equipment text,
  description text,
  video_url text,
  exercisedb_id text,
  exercisedb_image_url text,
  exercisedb_gif_url text,
  exercisedb_target_muscles jsonb default '[]'::jsonb,
  exercisedb_secondary_muscles jsonb default '[]'::jsonb,
  exercisedb_variations jsonb default '[]'::jsonb,
  exercisedb_related_exercises jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists exercise_definitions_name_idx on public.exercise_definitions (name);

-- RLS: allow authenticated to read; insert/update/delete via API (service role) or add policies below
alter table public.exercise_definitions enable row level security;

-- Allow authenticated users to read (for dashboard and training builder)
drop policy if exists "exercise_definitions_select" on public.exercise_definitions;
create policy "exercise_definitions_select"
  on public.exercise_definitions for select
  to authenticated
  using (true);

-- Optional: allow authenticated to insert/update/delete so client can save without API (if you prefer)
-- drop policy if exists "exercise_definitions_insert" on public.exercise_definitions;
-- create policy "exercise_definitions_insert" on public.exercise_definitions for insert to authenticated with check (true);
-- create policy "exercise_definitions_update" on public.exercise_definitions for update to authenticated using (true) with check (true);
-- create policy "exercise_definitions_delete" on public.exercise_definitions for delete to authenticated using (true);

comment on table public.exercise_definitions is 'Saved exercises from ExerciseDB (dashboard library + training builder).';

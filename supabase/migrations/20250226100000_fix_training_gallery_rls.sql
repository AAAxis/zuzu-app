-- Fix RLS on training_gallery: explicit policies so INSERT works.
-- Run in Supabase Dashboard → SQL Editor.

-- Remove the combined policy if it exists
drop policy if exists "Authenticated can do all on training_gallery" on public.training_gallery;

-- Explicit per-operation policies (avoids "new row violates row-level security" on insert)
create policy "training_gallery_select"
  on public.training_gallery for select
  to authenticated
  using (true);

create policy "training_gallery_insert"
  on public.training_gallery for insert
  to authenticated
  with check (true);

create policy "training_gallery_update"
  on public.training_gallery for update
  to authenticated
  using (true)
  with check (true);

create policy "training_gallery_delete"
  on public.training_gallery for delete
  to authenticated
  using (true);

-- Table for dashboard training gallery (photos/videos).
-- Run this in Supabase Dashboard → SQL Editor if the table doesn't exist yet.

create table if not exists public.training_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_type text not null check (media_type in ('photo', 'video')),
  media_url text not null,
  thumbnail_url text,
  category text not null default 'Other',
  created_at timestamptz not null default now()
);

-- Optional: index for listing by date
create index if not exists training_gallery_created_at_idx
  on public.training_gallery (created_at desc);

-- RLS: allow authenticated users to read/write (dashboard is behind auth)
alter table public.training_gallery enable row level security;

drop policy if exists "Authenticated can do all on training_gallery" on public.training_gallery;
create policy "Authenticated can do all on training_gallery"
  on public.training_gallery
  for all
  to authenticated
  using (true)
  with check (true);

-- Allow anon read if you need public gallery (e.g. landing page). Otherwise skip.
-- drop policy if exists "Public read training_gallery" on public.training_gallery;
-- create policy "Public read training_gallery" on public.training_gallery for select to anon using (true);

comment on table public.training_gallery is 'Dashboard training gallery media (images and video links).';

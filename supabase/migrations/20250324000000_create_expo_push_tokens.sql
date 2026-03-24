-- Creates the expo_push_tokens table used to store Expo push notification tokens
-- from the mobile app. Tokens are upserted on each app launch after login.

create table if not exists public.expo_push_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform      text check (platform in ('ios', 'android')),
  updated_at    timestamptz not null default now(),

  unique (user_id, expo_push_token)
);

-- Index for fast lookup when sending notifications to a specific user
create index if not exists expo_push_tokens_user_id_idx on public.expo_push_tokens(user_id);

-- RLS: users can only read/write their own tokens
alter table public.expo_push_tokens enable row level security;

create policy "Users can upsert their own push token"
  on public.expo_push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role (admin/backend) can read all tokens to send notifications
create policy "Service role can read all tokens"
  on public.expo_push_tokens
  for select
  using (auth.role() = 'service_role');

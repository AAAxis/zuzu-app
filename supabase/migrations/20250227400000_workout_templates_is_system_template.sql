-- Add is_system_template so templates created in the dashboard can be shown as
-- "system" / example templates in the Zuzu-fitness app (when it uses the same Supabase).
alter table public.workout_templates add column if not exists is_system_template boolean not null default false;
comment on column public.workout_templates.is_system_template is 'When true, this template appears as an example for all users in the mobile app.';

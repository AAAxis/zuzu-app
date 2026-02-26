-- Add translations support for exercises and workout templates (Hebrew and future locales).
-- Structure: translations jsonb = { "he": { "name": "...", "description": "...", ... } }
-- Source/original stays in main columns; translated values in translations.<locale>.

-- Exercise definitions: Hebrew (and other) translations
alter table public.exercise_definitions add column if not exists translations jsonb default '{}'::jsonb;
comment on column public.exercise_definitions.translations is 'Translations by locale, e.g. {"he": {"name": "...", "description": "...", "muscle_group": "...", "equipment": "..."}}';

-- Optional: explicit Hebrew columns if you prefer querying by column (uncomment if needed)
-- alter table public.exercise_definitions add column if not exists name_he text;
-- alter table public.exercise_definitions add column if not exists description_he text;
-- alter table public.exercise_definitions add column if not exists muscle_group_he text;
-- alter table public.exercise_definitions add column if not exists equipment_he text;

-- Workout templates: translations (table may already exist without this column)
alter table public.workout_templates add column if not exists translations jsonb default '{}'::jsonb;
comment on column public.workout_templates.translations is 'Translations by locale, e.g. {"he": {"template_name": "...", "workout_title": "...", "workout_description": "..."}}';

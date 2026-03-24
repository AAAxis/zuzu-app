-- Add thumbnail, gender, and location fields to workout_templates.

ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS gender text DEFAULT 'unisex';
ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS location text DEFAULT 'gym';

COMMENT ON COLUMN public.workout_templates.thumbnail_url IS 'URL to thumbnail image in Supabase Storage';
COMMENT ON COLUMN public.workout_templates.gender IS 'Target gender: male, female, or unisex';
COMMENT ON COLUMN public.workout_templates.location IS 'Workout location: home or gym';

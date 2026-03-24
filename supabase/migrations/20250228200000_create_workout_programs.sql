-- Workout programs: a program is a list of days, each day is a workout template or rest day.
-- Programs repeat weekly.

CREATE TABLE IF NOT EXISTS public.workout_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_he text,
  description text,
  description_he text,
  thumbnail_url text,
  gender text DEFAULT 'unisex',
  location text DEFAULT 'gym',
  created_by text,
  is_system_program boolean DEFAULT false,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  translations jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.workout_programs IS 'Workout programs built from workout templates. days = [{day_number, type, workout_template_id, label}]';
COMMENT ON COLUMN public.workout_programs.days IS 'Array of program days: [{day_number: 1, type: "workout"|"rest", workout_template_id: uuid|null, label: "Push Day"}]';

ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_programs_select" ON public.workout_programs;
CREATE POLICY "workout_programs_select"
  ON public.workout_programs FOR SELECT
  TO authenticated
  USING (true);

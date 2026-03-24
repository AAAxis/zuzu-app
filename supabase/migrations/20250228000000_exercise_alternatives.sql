-- Add alternative exercise columns to exercise_definitions.
-- Each stores an array of exercise_definitions UUIDs.

ALTER TABLE public.exercise_definitions ADD COLUMN IF NOT EXISTS easier_alternatives jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.exercise_definitions ADD COLUMN IF NOT EXISTS harder_alternatives jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.exercise_definitions ADD COLUMN IF NOT EXISTS equipment_alternatives jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.exercise_definitions.easier_alternatives IS 'Array of exercise_definitions UUIDs for easier alternatives';
COMMENT ON COLUMN public.exercise_definitions.harder_alternatives IS 'Array of exercise_definitions UUIDs for harder alternatives';
COMMENT ON COLUMN public.exercise_definitions.equipment_alternatives IS 'Array of exercise_definitions UUIDs for different-equipment / no-equipment alternatives';

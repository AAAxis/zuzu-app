import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

/**
 * POST /api/programs/seed-ppl
 * Seeds a Push/Pull/Legs 6-day program with workout templates built from your exercise library.
 * Run once: curl -X POST http://localhost:3000/api/programs/seed-ppl
 */
export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not set" }, { status: 500 })
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Load all exercises
  const { data: exercises } = await admin
    .from("exercise_definitions")
    .select("id, name, muscle_group, equipment, video_url")

  if (!exercises || exercises.length === 0) {
    return NextResponse.json({ error: "No exercises in library. Add exercises first." }, { status: 400 })
  }

  // Helper to find exercises by muscle group keywords
  function findExercises(keywords: string[], limit: number) {
    const found = exercises!.filter((ex) => {
      const mg = (ex.muscle_group || "").toLowerCase()
      const name = (ex.name || "").toLowerCase()
      return keywords.some((kw) => mg.includes(kw) || name.includes(kw))
    })
    return found.slice(0, limit)
  }

  function makeWorkoutExercises(
    exList: typeof exercises,
    part: "part_1_exercises" | "part_2_exercises" | "part_3_exercises",
    sets = 3,
    reps = 10
  ) {
    return (exList || []).map((ex, i) => ({
      key: `${ex.id}-seed-${Date.now()}-${i}`,
      definitionId: ex.id,
      name: ex.name,
      category: ex.muscle_group,
      video_url: ex.video_url,
      part,
      suggested_sets: sets,
      suggested_reps: reps,
      suggested_weight: 0,
      suggested_duration: 0,
      notes: "",
    }))
  }

  // Define the 6 workouts
  const workoutDefs = [
    {
      template_name: "Push Day A",
      workout_title: "Push Day A",
      workout_description: "Chest, shoulders, triceps — compound focus",
      part1Keywords: ["chest", "bench", "press"],
      part2Keywords: ["shoulder", "delt", "overhead"],
      part3Keywords: ["tricep", "dip", "extension"],
    },
    {
      template_name: "Pull Day A",
      workout_title: "Pull Day A",
      workout_description: "Back, biceps, rear delts — compound focus",
      part1Keywords: ["back", "row", "pull", "lat"],
      part2Keywords: ["bicep", "curl"],
      part3Keywords: ["rear delt", "face pull", "shrug"],
    },
    {
      template_name: "Legs Day A",
      workout_title: "Legs Day A",
      workout_description: "Quads, hamstrings, glutes, calves — heavy compounds",
      part1Keywords: ["squat", "leg press", "quad", "leg"],
      part2Keywords: ["hamstring", "deadlift", "lunge", "glute"],
      part3Keywords: ["calf", "calves", "core", "abs"],
    },
    {
      template_name: "Push Day B",
      workout_title: "Push Day B",
      workout_description: "Chest, shoulders, triceps — isolation focus",
      part1Keywords: ["chest", "fly", "press", "pec"],
      part2Keywords: ["shoulder", "lateral", "raise"],
      part3Keywords: ["tricep", "pushdown", "skull"],
    },
    {
      template_name: "Pull Day B",
      workout_title: "Pull Day B",
      workout_description: "Back, biceps — isolation focus",
      part1Keywords: ["back", "pulldown", "pull", "row"],
      part2Keywords: ["bicep", "curl", "hammer"],
      part3Keywords: ["forearm", "grip", "rear delt", "shrug"],
    },
    {
      template_name: "Legs Day B",
      workout_title: "Legs Day B",
      workout_description: "Quads, hamstrings, glutes — volume focus",
      part1Keywords: ["leg", "squat", "hack", "extension"],
      part2Keywords: ["hamstring", "curl", "hip thrust", "glute"],
      part3Keywords: ["calf", "calves", "ab", "plank"],
    },
  ]

  const templateIds: string[] = []

  for (const wd of workoutDefs) {
    const p1 = findExercises(wd.part1Keywords, 3)
    const p2 = findExercises(wd.part2Keywords, 2)
    const p3 = findExercises(wd.part3Keywords, 2)

    const payload = {
      created_by: user.email,
      template_name: wd.template_name,
      workout_title: wd.workout_title,
      workout_description: wd.workout_description,
      gender: "unisex",
      location: "gym",
      is_system_template: false,
      part_1_exercises: makeWorkoutExercises(p1, "part_1_exercises", 4, 8),
      part_2_exercises: makeWorkoutExercises(p2, "part_2_exercises", 3, 12),
      part_3_exercises: makeWorkoutExercises(p3, "part_3_exercises", 3, 15),
      translations: {},
      created_date: new Date().toISOString(),
    }

    const { data, error } = await admin
      .from("workout_templates")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      return NextResponse.json({ error: `Failed to create template "${wd.template_name}": ${error.message}` }, { status: 500 })
    }
    templateIds.push(data.id)
  }

  // Create the program
  const { data: program, error: progError } = await admin
    .from("workout_programs")
    .insert({
      name: "Push/Pull/Legs",
      name_he: "דחיפה/משיכה/רגליים",
      description: "Classic 6-day Push/Pull/Legs split with two variations (A/B). Day 7 is rest.",
      description_he: "תוכנית 6 ימים קלאסית של דחיפה/משיכה/רגליים עם שתי וריאציות. יום 7 מנוחה.",
      gender: "unisex",
      location: "gym",
      created_by: user.email,
      is_system_program: false,
      days: [
        { day_number: 1, type: "workout", workout_template_id: templateIds[0], label: "Push A" },
        { day_number: 2, type: "workout", workout_template_id: templateIds[1], label: "Pull A" },
        { day_number: 3, type: "workout", workout_template_id: templateIds[2], label: "Legs A" },
        { day_number: 4, type: "workout", workout_template_id: templateIds[3], label: "Push B" },
        { day_number: 5, type: "workout", workout_template_id: templateIds[4], label: "Pull B" },
        { day_number: 6, type: "workout", workout_template_id: templateIds[5], label: "Legs B" },
        { day_number: 7, type: "rest", workout_template_id: null, label: "Rest" },
      ],
      translations: {
        he: {
          name: "דחיפה/משיכה/רגליים",
          description: "תוכנית 6 ימים קלאסית של דחיפה/משיכה/רגליים עם שתי וריאציות. יום 7 מנוחה.",
        },
      },
    })
    .select("id")
    .single()

  if (progError) {
    return NextResponse.json({ error: `Failed to create program: ${progError.message}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    program_id: program.id,
    template_ids: templateIds,
    message: "Created 6 workout templates (Push A/B, Pull A/B, Legs A/B) and 1 PPL program.",
  })
}

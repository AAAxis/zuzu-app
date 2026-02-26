import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

interface AiExercise {
  exerciseId: string
  part: "part_1_exercises" | "part_2_exercises" | "part_3_exercises"
  suggested_sets: number
  suggested_reps: number
  suggested_weight: number
  suggested_duration: number
  notes: string
}

interface AiGenerateResponse {
  template_name: string
  workout_title: string
  workout_description: string
  exercises: AiExercise[]
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in Vercel environment variables." },
      { status: 500 }
    )
  }

  let body: { prompt?: string; exercises?: { id: string; name: string }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  const exercises = body.exercises ?? []
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    )
  }
  if (exercises.length === 0) {
    return NextResponse.json(
      { error: "Add at least one exercise to your library first (Exercises tab)." },
      { status: 400 }
    )
  }

  const exerciseList = exercises
    .map((e) => `- id: "${e.id}", name: "${e.name}"`)
    .join("\n")

  const systemPrompt = `You are a fitness coach. Given the user's description and the list of available exercises below, respond with ONLY a valid JSON object (no markdown, no code block). Use this exact shape:
{
  "template_name": "string (short name for the template)",
  "workout_title": "string (e.g. Leg Day A)",
  "workout_description": "string (1-2 sentences describing the workout)",
  "exercises": [
    {
      "exerciseId": "must be one of the ids from the list below",
      "part": "part_1_exercises" or "part_2_exercises" or "part_3_exercises",
      "suggested_sets": number (1-6),
      "suggested_reps": number (0-30, 0 if time-based),
      "suggested_weight": number (kg, 0 if bodyweight),
      "suggested_duration": number (seconds, 0 if reps-based),
      "notes": "string (optional form tip or cue)"
    }
  ]
}
You MUST only use exerciseId values from this list:
${exerciseList}
Order exercises logically (e.g. main compound first, then accessories). Match the user's intent: if they mention specific exercises, try to match by name; if they say "leg day" pick relevant exercises from the list. Return only the JSON object.`

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { error: `OpenAI API error: ${res.status} ${err}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      )
    }

    let jsonStr = content
    const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlock) jsonStr = codeBlock[1].trim()

    const parsed = JSON.parse(jsonStr) as AiGenerateResponse
    if (!parsed.template_name || !Array.isArray(parsed.exercises)) {
      return NextResponse.json(
        { error: "Invalid AI response shape" },
        { status: 502 }
      )
    }

    const idSet = new Set(exercises.map((e) => e.id))
    const validExercises = parsed.exercises.filter((e: AiExercise) => idSet.has(e.exerciseId))
    const result: AiGenerateResponse = {
      template_name: parsed.template_name || "AI Workout",
      workout_title: parsed.workout_title || parsed.template_name || "Custom workout",
      workout_description: parsed.workout_description || "",
      exercises: validExercises.map((e: AiExercise) => ({
        exerciseId: e.exerciseId,
        part: ["part_1_exercises", "part_2_exercises", "part_3_exercises"].includes(e.part) ? e.part : "part_1_exercises",
        suggested_sets: Math.min(6, Math.max(1, Number(e.suggested_sets) || 3)),
        suggested_reps: Math.min(30, Math.max(0, Number(e.suggested_reps) ?? 10)),
        suggested_weight: Math.max(0, Number(e.suggested_weight) || 0),
        suggested_duration: Math.max(0, Number(e.suggested_duration) || 0),
        notes: typeof e.notes === "string" ? e.notes : "",
      })),
    }

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set." }, { status: 500 })
  }

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "Exercise name is required" }, { status: 400 })
  }

  const systemPrompt = `You are a fitness expert. Given an exercise name, generate complete exercise details. Respond with ONLY a valid JSON object (no markdown, no code block). Use this exact shape:
{
  "name": "string (clean English name)",
  "name_he": "string (Hebrew name)",
  "muscle_group": "one of: Chest, Back, Legs, Shoulders, Arms, Core, Full Body, Other",
  "equipment": "one of: Bodyweight, Dumbbell, Barbell, Kettlebell, Machine, Band, Cable, Other",
  "category": "one of: Strength, Cardio, Yoga, HIIT, Stretching, Functional, Other",
  "description": "string (2-3 sentences: how to perform the exercise, form cues, tips)",
  "description_he": "string (same description in Hebrew)",
  "muscle_group_he": "string (muscle group name in Hebrew)",
  "equipment_he": "string (equipment name in Hebrew)"
}

Rules:
- Use proper exercise terminology
- Hebrew translations should be natural, not literal
- Description should be practical and concise
- Pick the most accurate muscle_group and equipment from the options listed

Return only the JSON object.`

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
          { role: "user", content: name },
        ],
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `OpenAI API error: ${res.status} ${err}` }, { status: 502 })
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 })
    }

    let jsonStr = content
    const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlock) jsonStr = codeBlock[1].trim()

    const parsed = JSON.parse(jsonStr)
    return NextResponse.json(parsed)
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

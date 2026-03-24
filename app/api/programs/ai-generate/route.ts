import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

interface AiProgramDay {
  day_number: number
  type: "workout" | "rest"
  workout_template_id: string | null
  label: string
}

interface AiProgramResponse {
  name: string
  description: string
  gender: string
  location: string
  days: AiProgramDay[]
}

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

  let body: { prompt?: string; templates?: { id: string; name: string }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  const templates = body.templates ?? []
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 })
  }
  if (templates.length === 0) {
    return NextResponse.json({ error: "Create at least one workout template first (Training Builder)." }, { status: 400 })
  }

  const templateList = templates.map((t) => `- id: "${t.id}", name: "${t.name}"`).join("\n")

  const systemPrompt = `You are a fitness coach designing weekly workout programs. Given the user's description and the list of available workout templates below, respond with ONLY a valid JSON object (no markdown, no code block). Use this exact shape:
{
  "name": "string (short program name, e.g. 'Push/Pull/Legs')",
  "description": "string (1-2 sentences describing the program)",
  "gender": "unisex" or "male" or "female",
  "location": "gym" or "home",
  "days": [
    {
      "day_number": number (starting from 1),
      "type": "workout" or "rest",
      "workout_template_id": "must be one of the template ids below, or null for rest days",
      "label": "string (e.g. 'Push Day', 'Rest', 'Upper Body')"
    }
  ]
}

Rules:
- A program is a repeating weekly cycle (typically 3-7 days)
- Include rest days where appropriate (type: "rest", workout_template_id: null)
- You MUST only use workout_template_id values from this list:
${templateList}
- Match templates to days logically based on their names
- If the user asks for a split you don't have exact templates for, pick the closest matches
- Order days logically for the training split requested

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
          { role: "user", content: prompt },
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

    const parsed = JSON.parse(jsonStr) as AiProgramResponse
    if (!parsed.name || !Array.isArray(parsed.days)) {
      return NextResponse.json({ error: "Invalid AI response shape" }, { status: 502 })
    }

    const idSet = new Set(templates.map((t) => t.id))
    const result: AiProgramResponse = {
      name: parsed.name || "AI Program",
      description: parsed.description || "",
      gender: ["unisex", "male", "female"].includes(parsed.gender) ? parsed.gender : "unisex",
      location: ["gym", "home"].includes(parsed.location) ? parsed.location : "gym",
      days: parsed.days.map((d, i) => ({
        day_number: i + 1,
        type: d.type === "rest" ? "rest" : "workout",
        workout_template_id: d.type === "rest" ? null : (idSet.has(d.workout_template_id!) ? d.workout_template_id : null),
        label: d.label || (d.type === "rest" ? "Rest" : `Day ${i + 1}`),
      })),
    }

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

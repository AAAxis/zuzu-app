import { createSupabaseServer } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

const OPENAI_URL = "https://api.openai.com/v1/chat/completions"

async function translateText(
  text: string,
  targetLang: "en" | "he"
): Promise<string> {
  if (!text.trim()) return ""
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return text

  const langName = targetLang === "he" ? "Hebrew" : "English"

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${langName}. Maintain the same HTML formatting if present. Reply with ONLY the translated text, no explanations.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    })
    if (!res.ok) return text
    const data = await res.json()
    return data?.choices?.[0]?.message?.content?.trim() || text
  } catch {
    return text
  }
}

/**
 * POST - translate blog post fields
 * Body: { title, excerpt, content, from: "en"|"he", to: "en"|"he" }
 * Returns: { title, excerpt, content } translated
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const to = body.to as "en" | "he"
    if (!to || !["en", "he"].includes(to)) {
      return NextResponse.json({ error: "Invalid target language" }, { status: 400 })
    }

    // Translate all fields concurrently
    const [title, excerpt, content] = await Promise.all([
      translateText(body.title || "", to),
      translateText(body.excerpt || "", to),
      translateText(body.content || "", to),
    ])

    return NextResponse.json({ title, excerpt, content })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 }
    )
  }
}

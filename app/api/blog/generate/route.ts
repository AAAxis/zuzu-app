import { createSupabaseServer } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

const OPENAI_URL = "https://api.openai.com/v1/chat/completions"

/**
 * POST - auto-generate a complete blog post about fitness
 * Body: { topic?: string, language?: "en" | "he" }
 * Returns: { title, excerpt, content, category, tags, read_time }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey)
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      )

    const body = await request.json().catch(() => ({}))
    const topic = body.topic || ""
    const language = body.language || "en"

    const langInstruction =
      language === "he"
        ? "Write the entire blog post in Hebrew."
        : "Write the entire blog post in English."

    const topicInstruction = topic
      ? `The blog post should be about: ${topic}`
      : "Choose an interesting fitness, workout, nutrition, or wellness topic."

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
            content: `You are a professional fitness blogger writing for the ZUZU fitness app blog. ${langInstruction}

Generate a complete blog post and return it as a JSON object with these fields:
- title: catchy blog post title (string)
- excerpt: 1-2 sentence summary for preview cards (string)
- content: full article as clean HTML with <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags. Write 800-1200 words. Make it informative and engaging. Do NOT include <html>, <head>, <body> wrappers.
- category: one of "Fitness", "Nutrition", "Workout", "Wellness", "Recovery", "Motivation" (string)
- tags: array of 3-5 relevant tags (string[])
- read_time: estimated reading time in minutes (number)
- image_query: a short English search term (2-4 words) for finding a relevant Pixabay image, e.g. "fitness workout gym" (string, always in English regardless of article language)

Return ONLY valid JSON, no markdown fences or extra text.`,
          },
          {
            role: "user",
            content: topicInstruction,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => "")
      return NextResponse.json(
        { error: `OpenAI error: ${res.status} ${err}` },
        { status: 500 }
      )
    }

    const data = await res.json()
    let rawContent = data?.choices?.[0]?.message?.content?.trim() || ""

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "")

    let generated
    try {
      generated = JSON.parse(rawContent)
    } catch {
      return NextResponse.json(
        { error: "Failed to parse generated content", raw: rawContent },
        { status: 500 }
      )
    }

    // Try to fetch image from Pixabay
    let featured_image = ""
    let featured_image_source = ""
    const pixabayKey = process.env.PIXABAY_API_KEY
    const imageQuery = generated.image_query || generated.category || "fitness"

    if (pixabayKey) {
      try {
        const pxRes = await fetch(
          `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(
            imageQuery
          )}&image_type=photo&orientation=horizontal&per_page=5&safesearch=true`
        )
        if (pxRes.ok) {
          const pxData = await pxRes.json()
          if (pxData.hits && pxData.hits.length > 0) {
            // Pick a random one from top 5
            const idx = Math.floor(Math.random() * Math.min(5, pxData.hits.length))
            const hit = pxData.hits[idx]
            featured_image = hit.webformatURL || hit.largeImageURL || ""
            featured_image_source = hit.pageURL || ""
          }
        }
      } catch {
        // Pixabay fetch failed, continue without image
      }
    }

    return NextResponse.json({
      title: generated.title || "",
      excerpt: generated.excerpt || "",
      content: generated.content || "",
      category: generated.category || "Fitness",
      tags: generated.tags || [],
      read_time: generated.read_time || 5,
      featured_image,
      featured_image_source,
      image_query: imageQuery,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    )
  }
}

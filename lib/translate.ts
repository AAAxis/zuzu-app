/**
 * Server-side translation to Hebrew (and other locales).
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise returns original text.
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions"

export async function translateToHebrew(text: string | null | undefined): Promise<string> {
  if (text == null || String(text).trim() === "") return ""
  const trimmed = String(text).trim()
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return trimmed

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
            content:
              "You are a translator. Translate the following text to Hebrew. Reply with ONLY the Hebrew translation, no explanations or quotes. Keep the same tone and format (e.g. bullet points, numbers).",
          },
          { role: "user", content: trimmed },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    })
    if (!res.ok) return trimmed
    const data = await res.json()
    const translated = data?.choices?.[0]?.message?.content?.trim()
    return translated && translated.length > 0 ? translated : trimmed
  } catch {
    return trimmed
  }
}

/** Translate multiple strings to Hebrew in one go (fewer API calls by batching in one prompt). */
export async function translateManyToHebrew(
  items: { key: string; text: string }[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const toTranslate = items.filter((i) => i.text != null && String(i.text).trim() !== "")
  if (toTranslate.length === 0) {
    items.forEach((i) => (result[i.key] = i.text || ""))
    return result
  }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    toTranslate.forEach((i) => (result[i.key] = i.text))
    return result
  }

  const prompt = toTranslate
    .map((i, idx) => `[${idx}] ${i.text}`)
    .join("\n\n")
  const instruction = `Translate each line below to Hebrew. Reply with the same number of lines, each line is the Hebrew translation for the corresponding [index]. Format: [0] Hebrew text for first\n[1] Hebrew text for second\n... Reply ONLY with the numbered translations, nothing else.`

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
          { role: "system", content: "You are a translator. Translate the given lines to Hebrew. Keep the same format and numbering." },
          { role: "user", content: instruction + "\n\n" + prompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    })
    if (!res.ok) {
      toTranslate.forEach((i) => (result[i.key] = i.text))
      return result
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim() || ""
    const lines = content.split(/\n+/)
    toTranslate.forEach((item, idx) => {
      const line = lines.find((l: string) => l.startsWith(`[${idx}]`))
      const translated = line ? line.replace(new RegExp(`^\\[${idx}\\]\\s*`), "").trim() : item.text
      result[item.key] = translated || item.text
    })
    items.forEach((i) => {
      if (!(i.key in result)) result[i.key] = i.text || ""
    })
    return result
  } catch {
    toTranslate.forEach((i) => (result[i.key] = i.text))
    items.forEach((i) => {
      if (!(i.key in result)) result[i.key] = i.text || ""
    })
    return result
  }
}

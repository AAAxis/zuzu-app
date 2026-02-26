import { NextRequest, NextResponse } from "next/server"

const RAPIDAPI_BASE = "https://exercisedb.p.rapidapi.com"
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com"
const FALLBACK_BASE = "https://v2.exercisedb.dev"

function getApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_EXERCISEDB_RAPIDAPI_KEY ?? process.env.EXERCISEDB_RAPIDAPI_KEY
}

async function rapidApiFetch(endpoint: string): Promise<Response> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error("RapidAPI key not set (EXERCISEDB_RAPIDAPI_KEY or NEXT_PUBLIC_EXERCISEDB_RAPIDAPI_KEY)")
  const url = `${RAPIDAPI_BASE}${endpoint}`
  return fetch(url, {
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": apiKey,
    },
  })
}

async function fallbackFetch(endpoint: string): Promise<Response> {
  const url = `${FALLBACK_BASE}${endpoint}`
  return fetch(url)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, query, bodyPart, equipment, target, id, limit = 20 } = body as {
      action: string
      query?: string
      bodyPart?: string
      equipment?: string
      target?: string
      id?: string
      limit?: number
    }

    let rapidEndpoint: string
    let fallbackEndpoint: string

    switch (action) {
      case "search":
        if (!query?.trim()) {
          return NextResponse.json({ error: "query required" }, { status: 400 })
        }
        rapidEndpoint = `/exercises/name/${encodeURIComponent(query)}?limit=${limit}`
        fallbackEndpoint = `/exercises?name=${encodeURIComponent(query)}&limit=${limit}`
        break
      case "bodyPart":
        if (!bodyPart) {
          return NextResponse.json({ error: "bodyPart required" }, { status: 400 })
        }
        rapidEndpoint = `/exercises/bodyPart/${encodeURIComponent(bodyPart.toUpperCase())}?limit=${limit}`
        fallbackEndpoint = rapidEndpoint
        break
      case "equipment":
        if (!equipment) {
          return NextResponse.json({ error: "equipment required" }, { status: 400 })
        }
        rapidEndpoint = `/exercises/equipment/${encodeURIComponent(equipment.toUpperCase())}?limit=${limit}`
        fallbackEndpoint = rapidEndpoint
        break
      case "target":
        if (!target) {
          return NextResponse.json({ error: "target required" }, { status: 400 })
        }
        rapidEndpoint = `/exercises/target/${encodeURIComponent(target)}?limit=${limit}`
        fallbackEndpoint = rapidEndpoint
        break
      case "byId":
        if (!id) {
          return NextResponse.json({ error: "id required" }, { status: 400 })
        }
        rapidEndpoint = `/exercises/${encodeURIComponent(id)}`
        fallbackEndpoint = rapidEndpoint
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    let res: Response
    try {
      if (getApiKey()) {
        res = await rapidApiFetch(rapidEndpoint)
        if (!res.ok) throw new Error(`RapidAPI ${res.status}`)
      } else {
        res = await fallbackFetch(fallbackEndpoint)
        if (!res.ok) throw new Error(`Fallback ${res.status}`)
      }
    } catch (rapidErr) {
      try {
        res = await fallbackFetch(fallbackEndpoint)
        if (!res.ok) throw new Error(`Fallback ${res.status}`)
      } catch (fallbackErr) {
        const msg = rapidErr instanceof Error ? rapidErr.message : String(rapidErr)
        const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
        return NextResponse.json(
          { error: `ExerciseDB failed: ${msg}; ${fallbackMsg}` },
          { status: 502 }
        )
      }
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

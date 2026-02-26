import { NextRequest, NextResponse } from "next/server"

const RAPIDAPI_IMAGE = "https://exercisedb.p.rapidapi.com/image"
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com"

function getApiKey(): string | undefined {
  return (
    process.env.EXERCISEDB_RAPIDAPI_KEY ??
    process.env.NEXT_PUBLIC_EXERCISEDB_RAPIDAPI_KEY
  )
}

/**
 * Proxies ExerciseDB GIF/image by exercise id so the browser can show animated GIFs
 * without exposing the RapidAPI key. Use: GET /api/exercisedb/image?id=exr_xxx&resolution=360
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  const resolution = request.nextUrl.searchParams.get("resolution") || "360"
  const validRes = ["180", "360", "720", "1080"].includes(resolution)
    ? resolution
    : "360"

  if (!id?.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return NextResponse.json(
      { error: "ExerciseDB image API not configured (EXERCISEDB_RAPIDAPI_KEY)" },
      { status: 503 }
    )
  }

  const url = `${RAPIDAPI_IMAGE}?exerciseId=${encodeURIComponent(id.trim())}&resolution=${validRes}`
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": apiKey,
    },
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: "ExerciseDB image failed" },
      { status: res.status === 404 ? 404 : 502 }
    )
  }

  const contentType = res.headers.get("content-type") || "image/gif"
  const body = await res.arrayBuffer()
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  })
}

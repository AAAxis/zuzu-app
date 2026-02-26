import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

const APIFY_ACTOR_ID = "video-scraper~youtube-channel-video-scraper"
const APIFY_SYNC_URL = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`

function getApifyToken(): string | undefined {
  return process.env.APIFY_API_TOKEN ?? process.env.APIFY_TOKEN
}

/** Apify dataset item shape from youtube-channel-video-scraper */
interface ApifyVideoItem {
  video_id?: string
  video_url?: string
  title?: string
  description?: string
  thumbnail_url?: string
  publish_date?: string
  channel_id?: string
  channel_username?: string
  channel_url?: string
  yt_status?: string
}

/** Fetch channel videos via Apify (no YouTube API key needed) */
async function fetchChannelVideosWithApify(
  channelInput: string
): Promise<{
  channelId: string
  channelTitle: string
  videos: Array<{
    videoId: string
    title: string
    description: string
    publishedAt: string
    thumbnailUrl: string | null
  }>
}> {
  const token = getApifyToken()
  if (!token) return { channelId: "", channelTitle: "", videos: [] }

  const res = await fetch(
    `${APIFY_SYNC_URL}?token=${encodeURIComponent(token)}&timeout=120`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelInputs: [channelInput],
        videoSort: "latest",
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Apify error: ${res.status} ${err}`)
  }

  const items = (await res.json()) as ApifyVideoItem[]
  const first = items[0]
  const channelId = first?.channel_id ?? ""
  const channelTitle = first?.channel_username
    ? `@${first.channel_username}`
    : first?.channel_url ?? "YouTube"

  const videos = items
    .filter((item) => item.video_id && item.yt_status !== "not_found")
    .map((item) => ({
      videoId: item.video_id!,
      title: item.title ?? "Untitled",
      description: item.description ?? "",
      publishedAt: item.publish_date ?? "",
      thumbnailUrl: item.thumbnail_url ?? null,
    }))

  return { channelId, channelTitle, videos }
}

/** Normalize channel handle or ID into Apify channelInput */
function toApifyChannelInput(channelHandle: string, channelId?: string): string {
  if (channelId?.trim()) {
    if (channelId.startsWith("UC") && !channelId.includes("/"))
      return `https://www.youtube.com/channel/${channelId}`
    if (channelId.startsWith("http")) return channelId
    return `https://www.youtube.com/channel/${channelId}`
  }
  const h = channelHandle.replace(/^@/, "").trim()
  if (!h) return ""
  if (h.startsWith("http")) return h
  if (h.startsWith("UC")) return `https://www.youtube.com/channel/${h}`
  return `https://www.youtube.com/@${h}`
}

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  const secretHeader = request.headers.get("x-service-key")
  if (secretHeader && secretHeader === serviceKey) {
    // Authenticated via service key — skip cookie check
  } else {
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
  }

  const apifyToken = getApifyToken()
  if (!apifyToken) {
    return NextResponse.json(
      {
        error:
          "APIFY_API_TOKEN or APIFY_TOKEN is not set. Add it in Vercel (or .env.local) and get a token from https://console.apify.com/account/integrations",
      },
      { status: 500 }
    )
  }

  let body: { channelHandle?: string; channelId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const channelHandle = body.channelHandle?.trim() || ""
  const channelIdInput = body.channelId?.trim()
  const apifyInput = toApifyChannelInput(channelHandle, channelIdInput)

  if (!apifyInput) {
    return NextResponse.json(
      { error: "Provide channelHandle (e.g. @adiblonder) or channelId" },
      { status: 400 }
    )
  }

  let channelId: string
  let channelTitle: string
  let handleForDb: string | null = null

  try {
    const result = await fetchChannelVideosWithApify(apifyInput)
    channelId = result.channelId
    channelTitle = result.channelTitle
    if (channelHandle && !channelIdInput) {
      handleForDb = channelHandle.startsWith("@") ? channelHandle : `@${channelHandle}`
    }

    if (result.videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No videos found on channel",
        channelId,
        channelTitle,
        saved: 0,
      })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const category = channelTitle || "YouTube"
    let saved = 0

    for (const v of result.videos) {
      const mediaUrl = `https://www.youtube.com/watch?v=${v.videoId}`
      const { data: existing } = await adminClient
        .from("training_gallery")
        .select("id")
        .eq("media_url", mediaUrl)
        .limit(1)
        .maybeSingle()
      if (existing) continue
      const { error } = await adminClient.from("training_gallery").insert({
        title: v.title || "Untitled",
        description: v.description || null,
        media_type: "video",
        media_url: mediaUrl,
        thumbnail_url: v.thumbnailUrl,
        category,
      })
      if (!error) saved++
    }

    return NextResponse.json({
      success: true,
      channelId,
      channelTitle,
      channelHandle: handleForDb,
      totalVideos: result.videos.length,
      saved,
      message: `Saved ${saved} videos to Gallery (training_gallery). Skipped duplicates.`,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Apify request failed"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

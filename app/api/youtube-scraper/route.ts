import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

function getYouTubeApiKey(): string | undefined {
  return process.env.YOUTUBE_API_KEY ?? process.env.GOOGLE_API_KEY
}

/** Resolve channel ID from handle (e.g. @adiblonder or adiblonder) */
async function getChannelId(handle: string): Promise<{ channelId: string; channelTitle: string } | null> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey) return null
  const cleanHandle = handle.replace(/^@/, "").trim()
  const url = `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails&forHandle=${encodeURIComponent(cleanHandle)}&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const item = data?.items?.[0]
  if (!item) return null
  return {
    channelId: item.id,
    channelTitle: item.snippet?.title ?? "",
  }
}

/** Get uploads playlist ID for a channel */
async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey) return null
  const url = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const uploads = data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  return uploads ?? null
}

/** Fetch all video IDs from a playlist (paginated) */
async function getPlaylistVideoIds(playlistId: string): Promise<string[]> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey) return []
  const ids: string[] = []
  let pageToken: string | undefined
  do {
    const url = `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails,snippet&playlistId=${encodeURIComponent(playlistId)}&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`
    const res = await fetch(url)
    if (!res.ok) break
    const data = await res.json()
    const items = data?.items ?? []
    for (const item of items) {
      const videoId = item?.contentDetails?.videoId
      if (videoId) ids.push(videoId)
    }
    pageToken = data?.nextPageToken ?? undefined
  } while (pageToken)
  return ids
}

/** Fetch video details (title, description, publishedAt, thumbnails) for up to 50 IDs */
async function getVideoDetails(videoIds: string[]): Promise<
  Array<{
    videoId: string
    title: string
    description: string
    publishedAt: string
    thumbnailUrl: string | null
  }>
> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey || videoIds.length === 0) return []
  const idParam = videoIds.slice(0, 50).join(",")
  const url = `${YOUTUBE_API_BASE}/videos?part=snippet&id=${idParam}&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  const items = data?.items ?? []
  return items.map((item: { id: string; snippet?: { title?: string; description?: string; publishedAt?: string; thumbnails?: { high?: { url?: string }; default?: { url?: string } } } }) => ({
    videoId: item.id,
    title: item.snippet?.title ?? "",
    description: item.snippet?.description ?? "",
    publishedAt: item.snippet?.publishedAt ?? "",
    thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url ?? null,
  }))
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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY or GOOGLE_API_KEY not set" },
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

  let channelId: string
  let channelTitle: string
  let handleForDb: string | null = null

  if (channelIdInput) {
    channelId = channelIdInput
    channelTitle = ""
    const chanUrl = `${YOUTUBE_API_BASE}/channels?part=snippet&id=${encodeURIComponent(channelId)}&key=${apiKey}`
    const cr = await fetch(chanUrl)
    if (cr.ok) {
      const d = await cr.json()
      channelTitle = d?.items?.[0]?.snippet?.title ?? ""
    }
  } else if (channelHandle) {
    const channel = await getChannelId(channelHandle)
    if (!channel) {
      return NextResponse.json(
        { error: `Channel not found for handle: ${channelHandle}` },
        { status: 404 }
      )
    }
    channelId = channel.channelId
    channelTitle = channel.channelTitle
    handleForDb = channelHandle.startsWith("@") ? channelHandle : `@${channelHandle}`
  } else {
    return NextResponse.json(
      { error: "Provide channelHandle (e.g. @adiblonder) or channelId" },
      { status: 400 }
    )
  }

  const playlistId = await getUploadsPlaylistId(channelId)
  if (!playlistId) {
    return NextResponse.json(
      { error: "Could not get uploads playlist for channel" },
      { status: 502 }
    )
  }

  const videoIds = await getPlaylistVideoIds(playlistId)
  if (videoIds.length === 0) {
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
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const details = await getVideoDetails(batch)
    for (const v of details) {
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
  }

  return NextResponse.json({
    success: true,
    channelId,
    channelTitle,
    channelHandle: handleForDb,
    totalVideos: videoIds.length,
    saved,
    message: `Saved ${saved} videos to Gallery (training_gallery). Skipped duplicates.`,
  })
}

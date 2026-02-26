import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

const BUCKET = "training-media"
const MAX_FILE_MB = 100

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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    )
  }

  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim() || null
  const category = (formData.get("category") as string)?.trim() || "Other"
  const file = formData.get("file") as File | null

  if (!title || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Title and file are required" },
      { status: 400 }
    )
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `File must be under ${MAX_FILE_MB}MB` },
      { status: 400 }
    )
  }

  const isImage = file.type.startsWith("image/")
  const isVideo = file.type.startsWith("video/")
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "File must be an image or video" },
      { status: 400 }
    )
  }

  const mediaType = isImage ? "photo" : "video"
  const ext = file.name.split(".").pop() || "bin"
  const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: uploadErr } = await adminClient.storage
    .from(BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false })

  if (uploadErr) {
    return NextResponse.json(
      { error: uploadErr.message },
      { status: 500 }
    )
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(BUCKET).getPublicUrl(filePath)

  const { error: insertErr } = await adminClient
    .from("training_gallery")
    .insert({
      title,
      description,
      media_type: mediaType,
      media_url: publicUrl,
      thumbnail_url: mediaType === "photo" ? publicUrl : null,
      category,
    })

  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, url: publicUrl })
}

import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

export async function PATCH(request: Request) {
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

  let body: {
    id?: string
    name?: string
    name_he?: string | null
    muscle_group?: string | null
    category?: string | null
    equipment?: string | null
    description?: string | null
    video_url?: string | null
    exercisedb_id?: string | null
    exercisedb_image_url?: string | null
    exercisedb_gif_url?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const id = body.id?.trim()
  if (!id) {
    return NextResponse.json(
      { error: "id is required" },
      { status: 400 }
    )
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    )
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const updates: Record<string, unknown> = {
    name,
    name_he: body.name_he ?? name ?? "",
    muscle_group: body.muscle_group ?? null,
    category: body.category ?? null,
    equipment: body.equipment ?? null,
    description: body.description ?? null,
    video_url: body.video_url ?? null,
    exercisedb_id: body.exercisedb_id ?? null,
    exercisedb_image_url: body.exercisedb_image_url ?? null,
    exercisedb_gif_url: body.exercisedb_gif_url ?? null,
  }

  const { error } = await adminClient
    .from("exercise_definitions")
    .update(updates)
    .eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

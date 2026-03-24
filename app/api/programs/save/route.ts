import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"
import { translateManyToHebrew } from "@/lib/translate"

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
  if (!user?.email) {
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
    description?: string
    thumbnail_url?: string | null
    gender?: string
    location?: string
    is_system_program?: boolean
    days?: unknown[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const description = body.description ?? ""

  const he = await translateManyToHebrew([
    { key: "name", text: name },
    { key: "description", text: description },
  ])

  const basePayload = {
    name,
    name_he: he.name || name,
    description,
    description_he: he.description || description,
    thumbnail_url: body.thumbnail_url ?? null,
    gender: body.gender || "unisex",
    location: body.location || "gym",
    is_system_program: body.is_system_program === true,
    days: body.days ?? [],
    created_by: user.email,
    translations: {
      he: {
        name: he.name || name,
        description: he.description || description,
      },
    },
    updated_at: new Date().toISOString(),
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  if (body.id) {
    const { error } = await adminClient
      .from("workout_programs")
      .update(basePayload)
      .eq("id", body.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, id: body.id })
  }

  const { data, error } = await adminClient
    .from("workout_programs")
    .insert(basePayload)
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, id: data?.id })
}

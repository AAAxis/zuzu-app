import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase"

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
    created_by?: string
    template_name?: string
    workout_title?: string
    workout_description?: string
    part_1_exercises?: unknown[]
    part_2_exercises?: unknown[]
    part_3_exercises?: unknown[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const templateName = body.template_name?.trim()
  if (!templateName) {
    return NextResponse.json(
      { error: "template_name is required" },
      { status: 400 }
    )
  }

  const payload = {
    created_by: body.created_by ?? user.email,
    template_name: templateName,
    workout_title: body.workout_title ?? "Custom workout",
    workout_description: body.workout_description ?? "",
    part_1_exercises: body.part_1_exercises ?? [],
    part_2_exercises: body.part_2_exercises ?? [],
    part_3_exercises: body.part_3_exercises ?? [],
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  if (body.id) {
    const { error } = await adminClient
      .from("workout_templates")
      .update(payload)
      .eq("id", body.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, id: body.id })
  }

  const { data, error } = await adminClient
    .from("workout_templates")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, id: data?.id })
}

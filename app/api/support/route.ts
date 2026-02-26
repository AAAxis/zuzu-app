import { createClient } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase-server"
import { supabaseUrl } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set")
  return createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** GET - list all support tickets (admin only) */
export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const admin = getAdmin()
    const { data, error } = await admin
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tickets: data || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** POST - create a new support ticket (public - no auth required) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const admin = getAdmin()
    const { data, error } = await admin.from("support_tickets").insert({
      type: body.type || "contact",
      email: body.email.trim(),
      name: body.name?.trim() || "",
      subject: body.subject?.trim() || "",
      message: body.message?.trim() || "",
      status: "open",
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ticket: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** PATCH - update ticket status/notes (admin only) */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 })

    const admin = getAdmin()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.status !== undefined) updates.status = body.status
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes

    const { data, error } = await admin
      .from("support_tickets")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ticket: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** DELETE - delete a ticket (admin only) */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 })

    const admin = getAdmin()
    const { error } = await admin.from("support_tickets").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

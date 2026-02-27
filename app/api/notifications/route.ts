import { createClient } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase-server"
import { supabaseUrl } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
const BATCH_SIZE = 100

function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set")
  return createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function ensureAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" as const, status: 401 as const }
  const admin = getAdmin()
  const { data } = await admin.auth.admin.getUserById(user.id)
  if (data?.user?.app_metadata?.role !== "admin") {
    return { error: "Forbidden" as const, status: 403 as const }
  }
  return { admin }
}

/** GET - Push token count (admin only). For dashboard. */
export async function GET() {
  try {
    const result = await ensureAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { count, error } = await result.admin
      .from("expo_push_tokens")
      .select("*", { count: "exact", head: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ count: count ?? 0 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** POST - Send push to all devices (admin only). Body: { title?, body?, data? } */
export async function POST(request: NextRequest) {
  try {
    const result = await ensureAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const messageBody = typeof body.body === "string" ? body.body : ""
    const data = body.data && typeof body.data === "object" ? body.data : undefined

    if (!title && !messageBody) {
      return NextResponse.json(
        { error: "At least one of title or body is required" },
        { status: 400 }
      )
    }

    const { data: rows, error } = await result.admin
      .from("expo_push_tokens")
      .select("expo_push_token")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const tokens = (rows || []).map((r) => r.expo_push_token).filter(Boolean)
    if (tokens.length === 0) {
      return NextResponse.json({
        sent: 0,
        message: "No push tokens registered. Users need to open the app and allow notifications.",
      })
    }

    const messages = tokens.map((to) => ({
      to,
      title: title || undefined,
      body: messageBody || undefined,
      data: data || undefined,
      sound: "default",
    }))

    let sent = 0
    let failed = 0
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(batch),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        return NextResponse.json(
          { error: json.errors?.[0]?.message || res.statusText || "Expo push failed" },
          { status: 502 }
        )
      }
      const tickets = Array.isArray(json.data) ? json.data : []
      sent += tickets.filter((t: { status?: string }) => t.status === "ok").length
      failed += tickets.filter((t: { status?: string }) => t.status !== "ok").length
    }

    return NextResponse.json({
      sent,
      failed,
      total: tokens.length,
      message: `Sent to ${sent} device(s)${failed > 0 ? `, ${failed} failed` : ""}.`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

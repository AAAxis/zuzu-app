import { createClient } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase-server"
import { supabaseUrl } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user: caller } } = await supabase.auth.getUser()

  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: callerData } = await adminClient.auth.admin.getUserById(caller.id)
  if (callerData?.user?.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const userId = typeof body?.userId === "string" ? body.userId.trim() : ""
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  const { data: targetUser, error: fetchError } = await adminClient.auth.admin.getUserById(userId)
  if (fetchError || !targetUser?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { ...targetUser.user.app_metadata, role: "admin" },
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

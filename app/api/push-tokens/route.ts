import { createSupabaseServer } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST - Register or update an Expo push token for the current user.
 * Call this from your Expo app after getting the token (e.g. from Notifications.getExpoPushTokenAsync).
 * Body: { expo_push_token: string, platform?: "ios" | "android" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const token = typeof body.expo_push_token === "string" ? body.expo_push_token.trim() : null
    if (!token || !token.startsWith("ExponentPushToken[")) {
      return NextResponse.json(
        { error: "Invalid expo_push_token. Expected ExponentPushToken[...]" },
        { status: 400 }
      )
    }

    const platform = body.platform === "ios" || body.platform === "android" ? body.platform : null

    const { error } = await supabase.from("expo_push_tokens").upsert(
      {
        user_id: user.id,
        expo_push_token: token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,expo_push_token" }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

import { createClient } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase-server"
import { supabaseUrl } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  // Verify the request is from an authenticated user
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Use service role to list all auth users
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Fetch all auth users (paginated, up to 1000)
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Also fetch profiles for enrichment
  const { data: profiles } = await adminClient
    .from("user_profiles")
    .select("*")

  const profileMap = new Map(
    (profiles || []).map((p: Record<string, unknown>) => [p.user_id, p])
  )

  // Merge auth users with their profiles
  const users = authData.users.map((authUser) => {
    const profile = profileMap.get(authUser.id) as Record<string, unknown> | undefined
    return {
      id: authUser.id,
      email: authUser.email || "",
      full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
      avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
      weight_kg: profile?.weight_kg || null,
      height_cm: profile?.height_cm || null,
      bmr: profile?.bmr || null,
      daily_steps: profile?.daily_steps || null,
      goal: profile?.goal || null,
      has_profile: !!profile,
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at || null,
      email_confirmed_at: authUser.email_confirmed_at || null,
      provider: authUser.app_metadata?.provider || "email",
    }
  })

  return NextResponse.json({ users })
}

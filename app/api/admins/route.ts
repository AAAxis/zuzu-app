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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Fetch all auth users
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Filter to admins only (app_metadata.role === "admin")
  const admins = authData.users
    .filter((u) => u.app_metadata?.role === "admin")
    .map((authUser) => ({
      id: authUser.id,
      email: authUser.email || "",
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      role: authUser.app_metadata?.role || "admin",
      provider: authUser.app_metadata?.provider || "email",
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at || null,
      email_confirmed_at: authUser.email_confirmed_at || null,
    }))

  return NextResponse.json({ admins })
}

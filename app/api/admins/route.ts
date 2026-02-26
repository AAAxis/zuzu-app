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

  // Filter admins: users with role "admin" in app_metadata,
  // or if no roles are set yet, all users who can log into the dashboard
  // (confirmed email, email provider — not app-only users)
  const admins = authData.users
    .filter((u) => {
      // If role metadata is set, use it
      if (u.app_metadata?.role === "admin") return true
      // If any user has role metadata, only show admins
      const anyoneHasRole = authData.users.some((au) => au.app_metadata?.role)
      if (anyoneHasRole) return false
      // Fallback: show all confirmed email users as admins
      // (since only admins can log into the dashboard)
      return u.email_confirmed_at && u.app_metadata?.provider === "email"
    })
    .map((authUser) => ({
      id: authUser.id,
      email: authUser.email || "",
      full_name: authUser.user_metadata?.full_name || null,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      role: authUser.app_metadata?.role || "admin",
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at || null,
      email_confirmed_at: authUser.email_confirmed_at || null,
    }))

  return NextResponse.json({ admins })
}

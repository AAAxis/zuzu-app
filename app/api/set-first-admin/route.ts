import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { supabaseUrl } from "@/lib/supabase"

/**
 * One-time endpoint to set the first admin when no admins exist yet.
 *
 * 1. Add to .env.local:
 *    SET_FIRST_ADMIN_SECRET=your-secret-string
 *
 * 2. Ensure the user exists (sign up once at /login or via Supabase Auth).
 *
 * 3. Run once (replace with your email and secret):
 *    curl -X POST http://localhost:3000/api/set-first-admin \
 *      -H "Content-Type: application/json" \
 *      -H "x-set-first-admin-secret: your-secret-string" \
 *      -d '{"email":"you@example.com"}'
 *
 * After that, log in with that email — you'll have dashboard access.
 */
export async function POST(request: Request) {
  const secret = process.env.SET_FIRST_ADMIN_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "SET_FIRST_ADMIN_SECRET is not set in environment" },
      { status: 500 }
    )
  }

  const headerSecret = request.headers.get("x-set-first-admin-secret")
  if (headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set" },
      { status: 500 }
    )
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email) {
    return NextResponse.json({ error: "Body must include email" }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  const existingAdmins = listData.users.filter((u) => u.app_metadata?.role === "admin")
  if (existingAdmins.length > 0) {
    return NextResponse.json(
      {
        error: "An admin already exists. Use Supabase Dashboard to add more admins.",
        hint: "Authentication → Users → select user → edit app_metadata → add role: admin",
      },
      { status: 400 }
    )
  }

  const user = listData.users.find((u) => (u.email || "").toLowerCase() === email)
  if (!user) {
    return NextResponse.json(
      {
        error: "No user found with this email. Sign up first at /login, then call this endpoint again.",
      },
      { status: 404 }
    )
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, role: "admin" },
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `Set ${email} as the first admin. You can now log in at /login and access the dashboard.`,
  })
}

import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseUrl, supabaseAnonKey } from "./supabase"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes: redirect to login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Dashboard requires admin role
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data } = await adminClient.auth.admin.getUserById(user.id)
      const role = data?.user?.app_metadata?.role

      if (role !== "admin") {
        // Not an admin — sign them out and redirect to login
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("error", "not_admin")
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname === "/login") {
    // Only redirect if they're an admin
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data } = await adminClient.auth.admin.getUserById(user.id)
      const role = data?.user?.app_metadata?.role

      if (role === "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

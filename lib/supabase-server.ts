import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseUrl, supabaseAnonKey } from "./supabase"

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll can be called from a Server Component where cookies are read-only.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  })
}

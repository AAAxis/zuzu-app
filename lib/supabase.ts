import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gzxqyjsqyleirvfobyyb.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eHF5anNxeWxlaXJ2Zm9ieXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjI5MjEsImV4cCI6MjA4Njk5ODkyMX0.ZeA2hwN0psKrwusaGdmRwjIP8uGU68qw8SICY7_rJYI"

let client: SupabaseClient | null = null

/**
 * Returns a Supabase client. In the browser we use createBrowserClient from @supabase/ssr
 * so the session is stored in cookies and middleware can read it (fixes login redirect loop).
 * On the server (e.g. in API routes or RSC) the default client is used; middleware uses
 * createServerClient separately.
 */
export function getSupabase() {
  if (typeof window !== "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}

export { supabaseUrl, supabaseAnonKey }

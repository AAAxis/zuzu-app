import { createClient, SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

export function getSupabase() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uhpuqiptxcjluwsetoev.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocHVxaXB0eGNqbHV3c2V0b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTE4OTYsImV4cCI6MjA3MjY2Nzg5Nn0.D_t-dyA4Z192kAU97Oi79At_IDT_5putusXrR0bQ6z8"
    )
  }
  return client
}

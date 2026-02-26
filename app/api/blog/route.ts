import { createClient } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase-server"
import { supabaseUrl } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set")
  return createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** GET - list all blog posts (dashboard sees all, public sees published) */
export async function GET(request: NextRequest) {
  try {
    const admin = getAdmin()
    const all = request.nextUrl.searchParams.get("all") === "true"

    // If requesting all (dashboard), verify auth
    if (all) {
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const { data, error } = await admin
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ posts: data || [] })
    }

    // Public: only published
    const { data, error } = await admin
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** POST - create a new blog post */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const admin = getAdmin()

    // Generate slug from title
    const slug = (body.slug || body.title || "post")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80) + "-" + Date.now().toString(36)

    const { data, error } = await admin.from("blog_posts").insert({
      title: body.title || "",
      slug,
      excerpt: body.excerpt || "",
      content: body.content || "",
      featured_image: body.featured_image || "",
      category: body.category || "",
      author: body.author || "ZUZU Team",
      read_time: body.read_time || 5,
      tags: body.tags || [],
      status: body.status || "draft",
      translations: body.translations || {},
      original_language: body.original_language || "en",
      published_at: body.status === "published" ? new Date().toISOString() : null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** PATCH - update an existing blog post */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: "Missing post id" }, { status: 400 })

    const admin = getAdmin()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) updates.title = body.title
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt
    if (body.content !== undefined) updates.content = body.content
    if (body.featured_image !== undefined) updates.featured_image = body.featured_image
    if (body.category !== undefined) updates.category = body.category
    if (body.author !== undefined) updates.author = body.author
    if (body.read_time !== undefined) updates.read_time = body.read_time
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.translations !== undefined) updates.translations = body.translations
    if (body.original_language !== undefined) updates.original_language = body.original_language

    if (body.status !== undefined) {
      updates.status = body.status
      if (body.status === "published") {
        // Only set published_at if not already set
        const { data: existing } = await admin.from("blog_posts").select("published_at").eq("id", body.id).single()
        if (!existing?.published_at) {
          updates.published_at = new Date().toISOString()
        }
      }
    }

    const { data, error } = await admin
      .from("blog_posts")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

/** DELETE - delete a blog post */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 })

    const admin = getAdmin()
    const { error } = await admin.from("blog_posts").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

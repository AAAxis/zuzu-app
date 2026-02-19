"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"
import { Dumbbell } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  category: string
  published_at: string
  read_time: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await getSupabase()
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, category, published_at, read_time")
        .eq("status", "published")
        .eq("brand", "zuzu")
        .order("published_at", { ascending: false })

      if (!error && data) setPosts(data)
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const categories = ["All", ...new Set(posts.map((p) => p.category).filter(Boolean))]

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "All" || p.category === category
    return matchSearch && matchCat
  })

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ZUZU</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-black transition-colors">Home</Link>
            <Link href="/blog" className="text-sm font-medium text-black">Blog</Link>
          </div>
        </nav>
      </header>

      <section className="pt-28 pb-16 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Blog</h1>
        <p className="text-[var(--muted)] mb-8">Fitness tips, workout guides, and nutrition advice.</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--light)] text-black border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[var(--light)] text-black border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">Loading posts...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[var(--muted)]">No posts yet — check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--primary)] hover:shadow-lg transition-all">
                  {post.featured_image && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image src={post.featured_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {post.category && (
                        <span className="absolute top-3 left-3 bg-[var(--primary)] text-white text-xs font-medium px-2.5 py-1 rounded-full">{post.category}</span>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">{post.title}</h2>
                    <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                      {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
                      {post.read_time && <span>{post.read_time} min read</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

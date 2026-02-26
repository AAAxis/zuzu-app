"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"
import { Dumbbell, Globe } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  category: string
  published_at: string
  read_time: number
  translations?: {
    he?: { title?: string; excerpt?: string; content?: string }
    en?: { title?: string; excerpt?: string; content?: string }
  }
  original_language?: string
}

type Lang = "en" | "he"

function getField(post: BlogPost, field: "title" | "excerpt", lang: Lang): string {
  if (lang === "he" && post.translations?.he?.[field]) return post.translations.he[field]!
  if (lang === "en" && post.translations?.en?.[field]) return post.translations.en[field]!
  return post[field] || ""
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    // Detect browser language
    if (typeof navigator !== "undefined" && navigator.language?.startsWith("he")) {
      setLang("he")
    }
  }, [])

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await getSupabase()
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, category, published_at, read_time, translations, original_language")
        .eq("status", "published")
        .order("published_at", { ascending: false })

      if (!error && data) setPosts(data)
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const categories = ["All", ...new Set(posts.map((p) => p.category).filter(Boolean))]

  const filtered = posts.filter((p) => {
    const title = getField(p, "title", lang)
    const excerpt = getField(p, "excerpt", lang)
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) ||
      excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "All" || p.category === category
    return matchSearch && matchCat
  })

  const isRtl = lang === "he"

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
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-black transition-colors">
              {isRtl ? "ראשי" : "Home"}
            </Link>
            <Link href="/blog" className="text-sm font-medium text-black">
              {isRtl ? "בלוג" : "Blog"}
            </Link>
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "he" : "en")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--light)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
              title={lang === "en" ? "Switch to Hebrew" : "Switch to English"}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "עב" : "EN"}
            </button>
          </div>
        </nav>
      </header>

      <section className="pt-28 pb-16 max-w-6xl mx-auto px-6" dir={isRtl ? "rtl" : "ltr"}>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          {isRtl ? "בלוג" : "Blog"}
        </h1>
        <p className="text-[var(--muted)] mb-8">
          {isRtl
            ? "טיפים לכושר, מדריכי אימונים ועצות תזונה."
            : "Fitness tips, workout guides, and nutrition advice."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder={isRtl ? "חיפוש פוסטים..." : "Search posts..."}
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
          <p className="text-[var(--muted)]">
            {isRtl ? "טוען..." : "Loading posts..."}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-[var(--muted)]">
            {isRtl ? "אין פוסטים עדיין — חזרו בקרוב!" : "No posts yet — check back soon!"}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => {
              const displayTitle = getField(post, "title", lang)
              const displayExcerpt = getField(post, "excerpt", lang)
              return (
                <Link key={post.id} href={`/blog/${post.slug}?lang=${lang}`} className="group">
                  <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--primary)] hover:shadow-lg transition-all">
                    {post.featured_image && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image src={post.featured_image} alt={displayTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        {post.category && (
                          <span className="absolute top-3 left-3 bg-[var(--primary)] text-white text-xs font-medium px-2.5 py-1 rounded-full">{post.category}</span>
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="text-lg font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">{displayTitle}</h2>
                      <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">{displayExcerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString(isRtl ? "he-IL" : "en-US")}</span>}
                        {post.read_time && <span>{post.read_time} {isRtl ? "דק׳ קריאה" : "min read"}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"
import { Dumbbell, Globe } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  category: string
  author: string
  published_at: string
  read_time: number
  tags: string[]
  translations?: {
    he?: { title?: string; excerpt?: string; content?: string }
    en?: { title?: string; excerpt?: string; content?: string }
  }
  original_language?: string
}

type Lang = "en" | "he"

function getField(post: BlogPost, field: "title" | "excerpt" | "content", lang: Lang): string {
  if (lang === "he" && post.translations?.he?.[field]) return post.translations.he[field]!
  if (lang === "en" && post.translations?.en?.[field]) return post.translations.en[field]!
  return post[field] || ""
}

export default function BlogPostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const urlLang = searchParams.get("lang")
    if (urlLang === "he" || urlLang === "en") {
      setLang(urlLang)
    } else if (typeof navigator !== "undefined" && navigator.language?.startsWith("he")) {
      setLang("he")
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await getSupabase()
        .from("blog_posts")
        .select("*")
        .eq("slug", params.slug)
        .eq("status", "published")
        .single()
      if (!error && data) setPost(data)
      setLoading(false)
    }
    if (params.slug) fetchPost()
  }, [params.slug])

  const isRtl = lang === "he"

  const header = (
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
          <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-black transition-colors">
            {isRtl ? "בלוג" : "Blog"}
          </Link>
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
  )

  if (loading) {
    return (
      <>
        {header}
        <main className="min-h-screen bg-white">
          <div className="pt-28 pb-16 max-w-3xl mx-auto px-6">
            <p className="text-[var(--muted)]">{isRtl ? "טוען..." : "Loading..."}</p>
          </div>
        </main>
      </>
    )
  }

  if (!post) {
    return (
      <>
        {header}
        <main className="min-h-screen bg-white">
          <div className="pt-28 pb-16 max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold mb-4">
              {isRtl ? "הפוסט לא נמצא" : "Post not found"}
            </h1>
            <Link href="/blog" className="text-[var(--primary)] hover:underline">
              {isRtl ? "← חזרה לבלוג" : "← Back to blog"}
            </Link>
          </div>
        </main>
      </>
    )
  }

  const displayTitle = getField(post, "title", lang)
  const displayContent = getField(post, "content", lang)

  return (
    <>
      {header}
      <main className="min-h-screen bg-white">
        <article className="pt-28 pb-16 max-w-3xl mx-auto px-6" dir={isRtl ? "rtl" : "ltr"}>
          <Link
            href="/blog"
            className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6 inline-block"
          >
            {isRtl ? "← חזרה לבלוג" : "← Back to blog"}
          </Link>
          {post.category && (
            <span className="inline-block bg-[var(--primary)] text-white text-xs font-medium px-3 py-1 rounded-full mb-4 mx-2">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {displayTitle}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-8">
            {post.author && (
              <span>{isRtl ? `מאת ${post.author}` : `By ${post.author}`}</span>
            )}
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString(
                  isRtl ? "he-IL" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </span>
            )}
            {post.read_time && (
              <span>
                {post.read_time} {isRtl ? "דק׳ קריאה" : "min read"}
              </span>
            )}
          </div>
          {post.featured_image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.featured_image}
                alt={displayTitle}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[var(--border)]">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[var(--light)] text-xs text-[var(--muted)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>
    </>
  )
}

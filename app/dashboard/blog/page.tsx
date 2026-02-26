"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  category: string
  author: string
  read_time: number
  tags: string[]
  status: "draft" | "published"
  featured_image_source?: string
  translations: {
    he?: { title?: string; excerpt?: string; content?: string }
    en?: { title?: string; excerpt?: string; content?: string }
  }
  original_language: "en" | "he"
  created_at: string
  updated_at: string
  published_at: string | null
}

const CATEGORIES = [
  "Fitness",
  "Nutrition",
  "Workout",
  "Wellness",
  "Recovery",
  "Motivation",
]

/** Detect if text is predominantly Hebrew (for dir and original_language). */
function detectLanguage(text: string): "he" | "en" {
  if (!text.trim()) return "en"
  const hebrewRange = /[\u0590-\u05FF\u200F]/g
  const letters = text.replace(/\s/g, "").replace(/<[^>]+>/g, "")
  if (!letters.length) return "en"
  const hebrewCount = (letters.match(hebrewRange) || []).length
  return hebrewCount / letters.length > 0.25 ? "he" : "en"
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all")

  // Editor modal state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const loadPosts = useCallback(async () => {
    const res = await fetch("/api/blog?all=true")
    const data = await res.json().catch(() => ({}))
    if (res.ok && Array.isArray(data.posts)) setPosts(data.posts)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || p.status === filterStatus
    return matchSearch && matchStatus
  })

  function openNew() {
    setEditingPost(null)
    setEditorOpen(true)
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return
    await fetch("/api/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadPosts()
  }

  async function togglePublish(post: BlogPost) {
    const newStatus = post.status === "published" ? "draft" : "published"
    await fetch("/api/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, status: newStatus }),
    })
    loadPosts()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Blog Posts
          </h1>
          <p className="text-[#6B7280] mt-1">
            Create, edit, and manage blog posts with auto-translation
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "draft" | "published")}
          className="px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E5F0] p-12 text-center">
          <p className="text-[#6B7280] mb-4">
            {posts.length === 0
              ? "No blog posts yet. Create your first post!"
              : "No posts match your search."}
          </p>
          {posts.length === 0 && (
            <button
              onClick={openNew}
              className="text-[#7C3AED] font-medium hover:underline"
            >
              Create New Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-[#E8E5F0] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md hover:shadow-purple-500/5 transition-all"
            >
              {/* Thumbnail */}
              {post.featured_image && (
                <div className="w-full md:w-24 h-32 md:h-16 rounded-xl overflow-hidden shrink-0 bg-[#F3F0FF]">
                  <img
                    src={post.featured_image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#1a1a2e] truncate">
                    {post.title || "Untitled"}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.status}
                  </span>
                  {post.translations?.he?.title && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      HE
                    </span>
                  )}
                  {post.translations?.en?.title && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      EN
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] truncate">
                  {post.category && <span className="font-medium">{post.category}</span>}
                  {post.category && post.published_at && " · "}
                  {post.published_at &&
                    new Date(post.published_at).toLocaleDateString()}
                  {!post.published_at && post.created_at &&
                    ` Created ${new Date(post.created_at).toLocaleDateString()}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    post.status === "published"
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {post.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEdit(post)}
                  className="p-2 rounded-lg hover:bg-[#F3F0FF] text-[#6B7280] hover:text-[#7C3AED] transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {post.status === "published" && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-[#F3F0FF] text-[#6B7280] hover:text-[#7C3AED] transition-colors"
                    title="View"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <BlogEditorModal
          post={editingPost}
          onClose={() => {
            setEditorOpen(false)
            setEditingPost(null)
          }}
          onSaved={() => {
            setEditorOpen(false)
            setEditingPost(null)
            loadPosts()
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Blog Editor Modal                                                  */
/* ------------------------------------------------------------------ */

function BlogEditorModal({
  post,
  onClose,
  onSaved,
}: {
  post: BlogPost | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!post

  // Language content (both optional; at least one required on save)
  const [heTitle, setHeTitle] = useState("")
  const [heExcerpt, setHeExcerpt] = useState("")
  const [heContent, setHeContent] = useState("")
  const [enTitle, setEnTitle] = useState("")
  const [enExcerpt, setEnExcerpt] = useState("")
  const [enContent, setEnContent] = useState("")

  // Shared meta
  const [featuredImage, setFeaturedImage] = useState("")
  const [featuredImageSource, setFeaturedImageSource] = useState("")
  const [category, setCategory] = useState("Fitness")
  const [author, setAuthor] = useState("ZUZU Team")
  const [readTime, setReadTime] = useState(5)
  const [tagsStr, setTagsStr] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")

  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"he" | "en">("he")

  // Initialize from existing post
  useEffect(() => {
    if (post) {
      setFeaturedImage(post.featured_image || "")
      setFeaturedImageSource(post.featured_image_source || "")
      setCategory(post.category || "Fitness")
      setAuthor(post.author || "ZUZU Team")
      setReadTime(post.read_time || 5)
      setTagsStr((post.tags || []).join(", "))
      setStatus(post.status || "draft")
      // Main fields + translations: main is in title/excerpt/content, other in translations
      if (post.original_language === "he") {
        setHeTitle(post.title || "")
        setHeExcerpt(post.excerpt || "")
        setHeContent(post.content || "")
        setEnTitle(post.translations?.en?.title || "")
        setEnExcerpt(post.translations?.en?.excerpt || "")
        setEnContent(post.translations?.en?.content || "")
      } else {
        setEnTitle(post.title || "")
        setEnExcerpt(post.excerpt || "")
        setEnContent(post.content || "")
        setHeTitle(post.translations?.he?.title || "")
        setHeExcerpt(post.translations?.he?.excerpt || "")
        setHeContent(post.translations?.he?.content || "")
      }
    }
  }, [post])

  async function handleSave() {
    // At least one language must have a title; prefer Hebrew when both filled
    const hasHe = !!(heTitle?.trim())
    const hasEn = !!(enTitle?.trim())
    if (!hasHe && !hasEn) {
      setError("Fill at least one language (Hebrew or English) with a title.")
      return
    }
    const primary = hasHe ? "he" : "en"
    const title = primary === "he" ? heTitle.trim() : enTitle.trim()
    const excerpt = primary === "he" ? heExcerpt.trim() : enExcerpt.trim()
    const content = primary === "he" ? heContent.trim() : enContent.trim()

    setSaving(true)
    setError("")

    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const translations: BlogPost["translations"] = {}
    if (hasHe && primary !== "he") {
      translations.he = { title: heTitle.trim(), excerpt: heExcerpt.trim(), content: heContent.trim() }
    }
    if (hasEn && primary !== "en") {
      translations.en = { title: enTitle.trim(), excerpt: enExcerpt.trim(), content: enContent.trim() }
    }

    const payload = {
      ...(isEdit ? { id: post!.id } : {}),
      title,
      excerpt,
      content,
      featured_image: featuredImage,
      featured_image_source: featuredImageSource || undefined,
      category,
      author,
      read_time: readTime,
      tags,
      status,
      translations,
      original_language: primary,
    }

    const res = await fetch("/api/blog", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Failed to save")
      setSaving(false)
      return
    }

    setSaving(false)
    onSaved()
  }

  async function handleGenerate() {
    setGenerating(true)
    setError("")

    // Generate in the language of the active tab (or primary)
    const genLang = activeTab

    const res = await fetch("/api/blog/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: generatePrompt.trim(), language: genLang }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Generation failed")
      setGenerating(false)
      return
    }

    if (genLang === "he") {
      setHeTitle(data.title || "")
      setHeExcerpt(data.excerpt || "")
      setHeContent(data.content || "")
    } else {
      setEnTitle(data.title || "")
      setEnExcerpt(data.excerpt || "")
      setEnContent(data.content || "")
    }

    setCategory(data.category || "Fitness")
    setTagsStr((data.tags || []).join(", "))
    setReadTime(data.read_time || 5)
    if (data.featured_image) setFeaturedImage(data.featured_image)
    if (data.featured_image_source) setFeaturedImageSource(data.featured_image_source)

    // Auto-translate to the other language (optional fill)
    const targetLang = genLang === "en" ? "he" : "en"
    const translateRes = await fetch("/api/blog/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        from: genLang,
        to: targetLang,
      }),
    })
    const translateData = await translateRes.json().catch(() => ({}))
    if (translateRes.ok) {
      if (targetLang === "he") {
        setHeTitle(translateData.title || "")
        setHeExcerpt(translateData.excerpt || "")
        setHeContent(translateData.content || "")
      } else {
        setEnTitle(translateData.title || "")
        setEnExcerpt(translateData.excerpt || "")
        setEnContent(translateData.content || "")
      }
    }

    setGenerating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
      <div
        className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col gap-3 p-6 border-b border-[#E8E5F0]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1a2e]">
              {isEdit ? "Edit Post" : "New Blog Post"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Generate: prompt + button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="e.g. benefits of morning runs, healthy meal prep, HIIT for beginners"
              className="flex-1 px-4 py-2 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Generating..." : "Auto Generate"}
            </button>
          </div>
        </div>

        {/* Tabs: Hebrew | English */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 pt-2">
          <p className="text-xs text-[#6B7280]">
            One article: fill Hebrew and/or English. Saving creates a single multilingual post (one URL).
          </p>
          <div className="flex border-b border-[#E8E5F0] sm:border-0">
          <button
            onClick={() => setActiveTab("he")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "he"
                ? "text-[#7C3AED] border-b-2 border-[#7C3AED]"
                : "text-[#6B7280] hover:text-[#1a1a2e]"
            }`}
          >
            🇮🇱 Hebrew
            {heTitle && (
              <span className="w-2 h-2 rounded-full bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("en")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "en"
                ? "text-[#7C3AED] border-b-2 border-[#7C3AED]"
                : "text-[#6B7280] hover:text-[#1a1a2e]"
            }`}
          >
            🇺🇸 English
            {enTitle && (
              <span className="w-2 h-2 rounded-full bg-green-400" />
            )}
          </button>
        </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Hebrew Tab */}
        {activeTab === "he" && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <p className="text-xs text-[#6B7280]">Optional. Fill at least Hebrew or English.</p>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Title</label>
              <input
                type="text"
                value={heTitle}
                onChange={(e) => setHeTitle(e.target.value)}
                placeholder="כותרת..."
                dir="rtl"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Excerpt</label>
              <textarea
                value={heExcerpt}
                onChange={(e) => setHeExcerpt(e.target.value)}
                placeholder="תקציר..."
                dir="rtl"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Content (HTML)</label>
              <textarea
                value={heContent}
                onChange={(e) => setHeContent(e.target.value)}
                placeholder="תוכן (HTML)..."
                dir="rtl"
                rows={10}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-y"
              />
            </div>
          </div>
        )}

        {/* English Tab */}
        {activeTab === "en" && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <p className="text-xs text-[#6B7280]">Optional. Fill at least Hebrew or English.</p>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Title</label>
              <input
                type="text"
                value={enTitle}
                onChange={(e) => setEnTitle(e.target.value)}
                placeholder="Post title..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Excerpt</label>
              <textarea
                value={enExcerpt}
                onChange={(e) => setEnExcerpt(e.target.value)}
                placeholder="Short summary for preview cards..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Content (HTML)</label>
              <textarea
                value={enContent}
                onChange={(e) => setEnContent(e.target.value)}
                placeholder="Write your post content in HTML..."
                rows={10}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-y"
              />
            </div>
          </div>
        )}

        {/* Shared meta (featured image, category, author, etc.) */}
        <div className="p-6 pt-0 space-y-4 border-t border-[#E8E5F0]">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Featured Image URL</label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            {featuredImageSource && (
              <p className="mt-1.5 text-xs text-[#6B7280]">
                Source:{" "}
                <a href={featuredImageSource} target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] hover:underline">Open source link</a>
              </p>
            )}
            {featuredImage && (
              <div className="mt-2 w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-[#E8E5F0]">
                <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Read Time (min)</label>
              <input
                type="number"
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="fitness, health, workout"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#E8E5F0]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#7C3AED] text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Update Post" : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  )
}

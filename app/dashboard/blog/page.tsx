"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Loader2,
  Globe,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Languages,
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

  // Form state
  const [lang, setLang] = useState<"en" | "he">(post?.original_language || "en")
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [featuredImage, setFeaturedImage] = useState("")
  const [category, setCategory] = useState("Fitness")
  const [author, setAuthor] = useState("ZUZU Team")
  const [readTime, setReadTime] = useState(5)
  const [tagsStr, setTagsStr] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")

  // Translation state
  const [heTitle, setHeTitle] = useState("")
  const [heExcerpt, setHeExcerpt] = useState("")
  const [heContent, setHeContent] = useState("")
  const [enTitle, setEnTitle] = useState("")
  const [enExcerpt, setEnExcerpt] = useState("")
  const [enContent, setEnContent] = useState("")

  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"content" | "translations">("content")

  // Initialize from existing post
  useEffect(() => {
    if (post) {
      setTitle(post.title || "")
      setExcerpt(post.excerpt || "")
      setContent(post.content || "")
      setFeaturedImage(post.featured_image || "")
      setCategory(post.category || "Fitness")
      setAuthor(post.author || "ZUZU Team")
      setReadTime(post.read_time || 5)
      setTagsStr((post.tags || []).join(", "))
      setStatus(post.status || "draft")
      setLang(post.original_language || "en")
      setHeTitle(post.translations?.he?.title || "")
      setHeExcerpt(post.translations?.he?.excerpt || "")
      setHeContent(post.translations?.he?.content || "")
      setEnTitle(post.translations?.en?.title || "")
      setEnExcerpt(post.translations?.en?.excerpt || "")
      setEnContent(post.translations?.en?.content || "")
    }
  }, [post])

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    setSaving(true)
    setError("")

    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const translations: BlogPost["translations"] = {}
    if (heTitle || heExcerpt || heContent) {
      translations.he = {
        title: heTitle,
        excerpt: heExcerpt,
        content: heContent,
      }
    }
    if (enTitle || enExcerpt || enContent) {
      translations.en = {
        title: enTitle,
        excerpt: enExcerpt,
        content: enContent,
      }
    }

    const payload = {
      ...(isEdit ? { id: post!.id } : {}),
      title,
      excerpt,
      content,
      featured_image: featuredImage,
      category,
      author,
      read_time: readTime,
      tags,
      status,
      translations,
      original_language: lang,
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

  async function handleTranslate() {
    if (!title.trim() && !content.trim()) {
      setError("Write some content first before translating")
      return
    }
    setTranslating(true)
    setError("")

    // If writing in English, translate to Hebrew. If Hebrew, translate to English.
    const targetLang = lang === "en" ? "he" : "en"

    const res = await fetch("/api/blog/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        excerpt,
        content,
        from: lang,
        to: targetLang,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Translation failed")
      setTranslating(false)
      return
    }

    if (targetLang === "he") {
      setHeTitle(data.title || "")
      setHeExcerpt(data.excerpt || "")
      setHeContent(data.content || "")
    } else {
      setEnTitle(data.title || "")
      setEnExcerpt(data.excerpt || "")
      setEnContent(data.content || "")
    }

    setTranslating(false)
    setActiveTab("translations")
  }

  async function handleGenerate() {
    setGenerating(true)
    setError("")

    const res = await fetch("/api/blog/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Generation failed")
      setGenerating(false)
      return
    }

    setTitle(data.title || "")
    setExcerpt(data.excerpt || "")
    setContent(data.content || "")
    setCategory(data.category || "Fitness")
    setTagsStr((data.tags || []).join(", "))
    setReadTime(data.read_time || 5)
    if (data.featured_image) {
      setFeaturedImage(data.featured_image)
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
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5F0]">
          <h2 className="text-xl font-bold text-[#1a1a2e]">
            {isEdit ? "Edit Post" : "New Blog Post"}
          </h2>
          <div className="flex items-center gap-2">
            {/* Auto-generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generating ? "Generating..." : "Auto Generate"}
            </button>
            {/* Translate button */}
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {translating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              {translating
                ? "Translating..."
                : lang === "en"
                ? "Translate → Hebrew"
                : "Translate → English"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8E5F0]">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "content"
                ? "text-[#7C3AED] border-b-2 border-[#7C3AED]"
                : "text-[#6B7280] hover:text-[#1a1a2e]"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab("translations")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "translations"
                ? "text-[#7C3AED] border-b-2 border-[#7C3AED]"
                : "text-[#6B7280] hover:text-[#1a1a2e]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Translations
            {(heTitle || enTitle) && (
              <span className="w-2 h-2 rounded-full bg-green-400" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Language selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-[#6B7280]">
                Writing in:
              </label>
              <div className="flex rounded-lg border border-[#E8E5F0] overflow-hidden">
                <button
                  onClick={() => setLang("en")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    lang === "en"
                      ? "bg-[#7C3AED] text-white"
                      : "bg-white text-[#6B7280] hover:bg-gray-50"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("he")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    lang === "he"
                      ? "bg-[#7C3AED] text-white"
                      : "bg-white text-[#6B7280] hover:bg-gray-50"
                  }`}
                >
                  עברית
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                dir={lang === "he" ? "rtl" : "ltr"}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary for preview cards..."
                dir={lang === "he" ? "rtl" : "ltr"}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
              />
            </div>

            {/* Content (HTML) */}
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content in HTML..."
                dir={lang === "he" ? "rtl" : "ltr"}
                rows={12}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-y"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Featured Image URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              {featuredImage && (
                <div className="mt-2 w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-[#E8E5F0]">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Row: Category + Author + Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Read Time (min)
                </label>
                <input
                  type="number"
                  value={readTime}
                  onChange={(e) => setReadTime(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="fitness, health, workout"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Status
              </label>
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
        )}

        {/* Translations Tab */}
        {activeTab === "translations" && (
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Hebrew Translation */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1a1a2e] flex items-center gap-2">
                🇮🇱 Hebrew Translation
                {heTitle && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Available
                  </span>
                )}
              </h3>
              <input
                type="text"
                value={heTitle}
                onChange={(e) => setHeTitle(e.target.value)}
                placeholder="כותרת..."
                dir="rtl"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              <textarea
                value={heExcerpt}
                onChange={(e) => setHeExcerpt(e.target.value)}
                placeholder="תקציר..."
                dir="rtl"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
              />
              <textarea
                value={heContent}
                onChange={(e) => setHeContent(e.target.value)}
                placeholder="תוכן (HTML)..."
                dir="rtl"
                rows={8}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-y"
              />
            </div>

            {/* English Translation */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1a1a2e] flex items-center gap-2">
                🇺🇸 English Translation
                {enTitle && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Available
                  </span>
                )}
              </h3>
              <input
                type="text"
                value={enTitle}
                onChange={(e) => setEnTitle(e.target.value)}
                placeholder="Title..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              <textarea
                value={enExcerpt}
                onChange={(e) => setEnExcerpt(e.target.value)}
                placeholder="Excerpt..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
              />
              <textarea
                value={enContent}
                onChange={(e) => setEnContent(e.target.value)}
                placeholder="Content (HTML)..."
                rows={8}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-y"
              />
            </div>
          </div>
        )}

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

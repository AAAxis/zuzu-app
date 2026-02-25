"use client"

import { useEffect, useState, useRef } from "react"
import { getSupabase } from "@/lib/supabase"
import {
  Upload,
  Search,
  X,
  Play,
  Trash2,
  Image as ImageIcon,
  Video,
  Filter,
  Grid3X3,
  LayoutList,
  Plus,
  FileVideo,
  FileImage,
} from "lucide-react"
import type { GalleryItem, GalleryCategory } from "@/lib/types"
import { GALLERY_CATEGORIES } from "@/lib/types"

const BUCKET = "training-media"

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showUpload, setShowUpload] = useState(false)
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadGallery()
  }, [])

  async function loadGallery() {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("training_gallery")
      .select("*")
      .order("created_at", { ascending: false })

    setItems((data as GalleryItem[]) || [])
    setLoading(false)
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setDeleting(item.id)
    const supabase = getSupabase()

    // Extract file path from URL
    const url = new URL(item.media_url)
    const pathParts = url.pathname.split(`/${BUCKET}/`)
    if (pathParts[1]) {
      await supabase.storage.from(BUCKET).remove([pathParts[1]])
    }

    await supabase.from("training_gallery").delete().eq("id", item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setDeleting(null)
  }

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const photoCount = items.filter((i) => i.media_type === "photo").length
  const videoCount = items.filter((i) => i.media_type === "video").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Training Gallery
          </h1>
          <p className="text-[#6B7280] mt-1">
            {photoCount} photo{photoCount !== 1 && "s"}, {videoCount} video
            {videoCount !== 1 && "s"}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6D28D9] transition-colors shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Upload Media
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl border transition-colors ${viewMode === "grid" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-[#6B7280] border-[#E8E5F0] hover:border-[#7C3AED]"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl border transition-colors ${viewMode === "list" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-[#6B7280] border-[#E8E5F0] hover:border-[#7C3AED]"}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-[#7C3AED] text-white"
                : "bg-white text-[#6B7280] border border-[#E8E5F0] hover:border-[#7C3AED] hover:text-[#7C3AED]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E5F0] text-center py-20">
          <ImageIcon className="w-14 h-14 text-[#E8E5F0] mx-auto mb-4" />
          <p className="text-[#6B7280] font-medium text-lg">
            {search || activeCategory !== "All"
              ? "No media matches your filters"
              : "No media uploaded yet"}
          </p>
          <p className="text-[#6B7280] text-sm mt-1">
            {search || activeCategory !== "All"
              ? "Try different filters"
              : "Upload photos and videos to build your training gallery"}
          </p>
          {!search && activeCategory === "All" && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6D28D9] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload First Media
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-[#E8E5F0] overflow-hidden hover:shadow-lg hover:shadow-purple-500/5 transition-all"
            >
              {/* Thumbnail */}
              <div
                className="aspect-square relative cursor-pointer overflow-hidden"
                onClick={() => setPreviewItem(item)}
              >
                {item.media_type === "photo" ? (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                )}
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${
                      item.media_type === "photo"
                        ? "bg-green-500/80 text-white"
                        : "bg-purple-500/80 text-white"
                    }`}
                  >
                    {item.media_type === "photo" ? (
                      <FileImage className="w-3 h-3" />
                    ) : (
                      <FileVideo className="w-3 h-3" />
                    )}
                    {item.media_type}
                  </span>
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item)
                  }}
                  disabled={deleting === item.id}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                  {item.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#6B7280]">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-2xl border border-[#E8E5F0] divide-y divide-[#E8E5F0]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 hover:bg-[#F8F7FF] transition-colors cursor-pointer"
              onClick={() => setPreviewItem(item)}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                {item.media_type === "photo" ? (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${item.media_type === "photo" ? "text-green-600" : "text-purple-600"}`}
                  >
                    {item.media_type === "photo" ? (
                      <FileImage className="w-3 h-3" />
                    ) : (
                      <FileVideo className="w-3 h-3" />
                    )}
                    {item.media_type}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[#6B7280] hidden sm:block">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item)
                  }}
                  disabled={deleting === item.id}
                  className="p-2 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false)
            loadGallery()
          }}
        />
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media */}
            <div className="relative bg-black">
              {previewItem.media_type === "photo" ? (
                <img
                  src={previewItem.media_url}
                  alt={previewItem.title}
                  className="w-full max-h-[60vh] object-contain"
                />
              ) : (
                <video
                  src={previewItem.media_url}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh]"
                />
              )}
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Info */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    {previewItem.title}
                  </h3>
                  {previewItem.description && (
                    <p className="text-sm text-[#6B7280] mt-1">
                      {previewItem.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                    previewItem.media_type === "photo"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {previewItem.media_type === "photo" ? (
                    <FileImage className="w-3 h-3" />
                  ) : (
                    <FileVideo className="w-3 h-3" />
                  )}
                  {previewItem.media_type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280]">
                <span className="bg-[#F3F0FF] px-2.5 py-1 rounded-full text-[#7C3AED] font-medium">
                  {previewItem.category}
                </span>
                <span>
                  {new Date(previewItem.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────── Upload Modal Component ───────── */

function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void
  onUploaded: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Strength")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  function handleFile(f: File) {
    const isPhoto = f.type.startsWith("image/")
    const isVideo = f.type.startsWith("video/")
    if (!isPhoto && !isVideo) {
      setError("Please select an image or video file")
      return
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("File must be under 100MB")
      return
    }
    setFile(f)
    setError("")
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "))
    }
    if (isPhoto) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file || !title.trim()) return
    setUploading(true)
    setError("")

    try {
      const supabase = getSupabase()
      const mediaType = file.type.startsWith("image/") ? "photo" : "video"
      const ext = file.name.split(".").pop()
      const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      // Upload file to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false })

      if (uploadErr) throw new Error(uploadErr.message)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

      // Insert gallery record
      const { error: insertErr } = await supabase
        .from("training_gallery")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          media_type: mediaType,
          media_url: publicUrl,
          thumbnail_url: mediaType === "photo" ? publicUrl : null,
          category,
        })

      if (insertErr) throw new Error(insertErr.message)

      onUploaded()
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.")
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#1a1a2e]">Upload Media</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#7C3AED] bg-[#F3F0FF]"
              : file
                ? "border-[#10B981] bg-green-50"
                : "border-[#E8E5F0] hover:border-[#7C3AED] hover:bg-[#F8F7FF]"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div>
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 mx-auto rounded-xl object-cover mb-3"
                />
              ) : (
                <div className="w-24 h-24 mx-auto rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              )}
              <p className="text-sm font-medium text-[#1a1a2e]">{file.name}</p>
              <p className="text-xs text-[#6B7280] mt-1">
                {(file.size / (1024 * 1024)).toFixed(1)} MB — Click to change
              </p>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-[#A78BFA] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1a1a2e]">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                Photos (JPG, PNG, WebP) or Videos (MP4, MOV) up to 100MB
              </p>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Squat Form Tutorial"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
              Description{" "}
              <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this training media..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] bg-white"
            >
              {GALLERY_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || uploading}
            className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

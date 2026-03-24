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
  Grid3X3,
  LayoutList,
  Plus,
  FileVideo,
  FileImage,
  Link2,
  Loader2,
} from "lucide-react"
import type { GalleryItem } from "@/lib/types"

const BUCKET = "training-media"

function parseVideoUrl(url: string): { provider: "youtube" | "vimeo" | null; videoId: string | null } {
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of ytPatterns) {
    const match = url.match(pattern)
    if (match) return { provider: "youtube", videoId: match[1] }
  }
  const vimeoPatterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/]
  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern)
    if (match) return { provider: "vimeo", videoId: match[1] }
  }
  return { provider: null, videoId: null }
}

function getEmbedUrl(provider: "youtube" | "vimeo", videoId: string): string {
  if (provider === "youtube") return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  return `https://player.vimeo.com/video/${videoId}?autoplay=1`
}

function getThumbnailUrl(provider: "youtube" | "vimeo", videoId: string): string {
  if (provider === "youtube") return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  return ""
}

function isExternalVideoUrl(url: string): boolean {
  const { provider } = parseVideoUrl(url)
  return provider !== null
}

/* ───────── Upload Modal ───────── */
function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  function handleFile(f: File) {
    const isPhoto = f.type.startsWith("image/")
    const isVideo = f.type.startsWith("video/")
    if (!isPhoto && !isVideo) { setError("Please select an image or video file"); return }
    if (f.size > 100 * 1024 * 1024) { setError("File must be under 100MB"); return }
    setFile(f)
    setError("")
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "))
    if (isPhoto) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function handleUpload() {
    if (!file || !title.trim()) return
    setUploading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("title", title.trim())
      formData.set("description", description.trim() || "")
      formData.set("file", file)
      const res = await fetch("/api/gallery/upload", { method: "POST", body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
      onUploaded()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed."
      setError(msg)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#1a1a2e]">Upload Media</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"><X className="w-5 h-5" /></button>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-[#7C3AED] bg-[#F3F0FF]" : file ? "border-[#10B981] bg-green-50" : "border-[#E8E5F0] hover:border-[#7C3AED] hover:bg-[#F8F7FF]"}`}
        >
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {file ? (
            <div>
              {preview ? <img src={preview} alt="Preview" className="w-24 h-24 mx-auto rounded-xl object-cover mb-3" /> : (
                <div className="w-24 h-24 mx-auto rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center mb-3"><Play className="w-8 h-8 text-white ml-1" /></div>
              )}
              <p className="text-sm font-medium text-[#1a1a2e]">{file.name}</p>
              <p className="text-xs text-[#6B7280] mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB — Click to change</p>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-[#A78BFA] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1a1a2e]">Drop a file here or click to browse</p>
              <p className="text-xs text-[#6B7280] mt-1">Photos or Videos up to 100MB</p>
            </div>
          )}
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Squat Form Tutorial" className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Description <span className="text-[#6B7280] font-normal">(optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this media..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 resize-none" />
          </div>
        </div>
        {error && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-medium text-[#6B7280] hover:bg-gray-50">Cancel</button>
          <button onClick={handleUpload} disabled={!file || !title.trim() || uploading} className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Upload</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───────── Video Link Modal ───────── */
function VideoLinkModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [detected, setDetected] = useState<{ provider: "youtube" | "vimeo"; videoId: string } | null>(null)

  function handleUrlChange(value: string) {
    setUrl(value)
    setError("")
    const { provider, videoId } = parseVideoUrl(value)
    if (provider && videoId) setDetected({ provider, videoId })
    else setDetected(null)
  }

  async function handleSave() {
    if (!url.trim() || !title.trim()) return
    const { provider, videoId } = parseVideoUrl(url.trim())
    if (!provider || !videoId) { setError("Please enter a valid YouTube or Vimeo URL"); return }
    setSaving(true)
    setError("")
    try {
      const supabase = getSupabase()
      const thumbnailUrl = getThumbnailUrl(provider, videoId)
      const { error: insertErr } = await supabase.from("training_gallery").insert({
        title: title.trim(),
        description: description.trim() || null,
        media_type: "video",
        media_url: url.trim(),
        thumbnail_url: thumbnailUrl || null,
        category: "Other",
      })
      if (insertErr) throw new Error(insertErr.message)
      onAdded()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#1a1a2e]">Add Video Link</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Video URL</label>
          <div className="relative">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input type="url" value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20" />
          </div>
          <p className="text-xs text-[#6B7280] mt-1.5">Supports YouTube and Vimeo links</p>
        </div>
        {detected && (
          <div className="mt-4 rounded-xl overflow-hidden border border-[#E8E5F0]">
            {detected.provider === "youtube" ? (
              <img src={getThumbnailUrl(detected.provider, detected.videoId)} alt="Thumbnail" className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center"><Play className="w-10 h-10 text-white ml-1" /></div>
            )}
            <div className="px-3 py-2 bg-[#F8F7FF] flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600 uppercase">{detected.provider}</span>
              <span className="text-xs text-[#6B7280] truncate">Video ID: {detected.videoId}</span>
            </div>
          </div>
        )}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Squat Form Tutorial" className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Description <span className="text-[#6B7280] font-normal">(optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this video..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 resize-none" />
          </div>
        </div>
        {error && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-medium text-[#6B7280] hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={!url.trim() || !title.trim() || !detected || saving} className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Link2 className="w-4 h-4" />Add Video</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───────── Main Gallery Modal ───────── */
export function GalleryModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showUpload, setShowUpload] = useState(false)
  const [showVideoLink, setShowVideoLink] = useState(false)
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    const { data } = await getSupabase()
      .from("training_gallery")
      .select("*")
      .order("created_at", { ascending: false })
    setItems((data as GalleryItem[]) || [])
    setLoading(false)
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm(`Delete "${item.title}"?`)) return
    setDeleting(item.id)
    const supabase = getSupabase()
    if (!isExternalVideoUrl(item.media_url)) {
      try {
        const url = new URL(item.media_url)
        const pathParts = url.pathname.split(`/${BUCKET}/`)
        if (pathParts[1]) await supabase.storage.from(BUCKET).remove([pathParts[1]])
      } catch { /* ignore */ }
    }
    await supabase.from("training_gallery").delete().eq("id", item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setDeleting(null)
  }

  const filtered = items.filter((item) =>
    !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase())
  )

  const photoCount = items.filter((i) => i.media_type === "photo").length
  const videoCount = items.filter((i) => i.media_type === "video").length

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-4 border-b border-[#E8E5F0] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-[#7C3AED]" />
                Training Gallery
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">{photoCount} photos, {videoCount} videos</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowVideoLink(true)} className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E5F0] bg-white text-[#1a1a2e] rounded-xl text-xs font-medium hover:border-[#7C3AED] hover:text-[#7C3AED]">
                <Link2 className="w-3.5 h-3.5" /> Video Link
              </button>
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-medium hover:bg-[#6D28D9]">
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
              <button onClick={onClose} className="p-2 rounded-xl border border-[#E8E5F0] text-[#6B7280] hover:bg-[#F8F7FF]">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search + view toggle */}
          <div className="px-4 py-3 border-b border-[#E8E5F0] flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20" />
            </div>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl border ${viewMode === "grid" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-[#6B7280] border-[#E8E5F0]"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl border ${viewMode === "list" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-[#6B7280] border-[#E8E5F0]"}`}>
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-14 h-14 text-[#E8E5F0] mx-auto mb-4" />
                <p className="text-[#6B7280] font-medium">{search ? "No media matches your search" : "No media uploaded yet"}</p>
                {!search && (
                  <button onClick={() => setShowUpload(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6D28D9]">
                    <Upload className="w-4 h-4" /> Upload First Media
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((item) => (
                  <div key={item.id} className="group bg-white rounded-xl border border-[#E8E5F0] overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-square relative cursor-pointer overflow-hidden" onClick={() => setPreviewItem(item)}>
                      {item.media_type === "photo" ? (
                        <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (() => {
                        const { provider, videoId } = parseVideoUrl(item.media_url)
                        const thumb = provider && videoId ? getThumbnailUrl(provider, videoId) : item.thumbnail_url
                        return thumb ? (
                          <div className="relative w-full h-full">
                            <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Play className="w-5 h-5 text-white ml-0.5" /></div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Play className="w-5 h-5 text-white ml-0.5" /></div>
                          </div>
                        )
                      })()}
                      <div className="absolute top-2 left-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium backdrop-blur-sm ${item.media_type === "photo" ? "bg-green-500/80 text-white" : "bg-purple-500/80 text-white"}`}>
                          {item.media_type === "photo" ? <FileImage className="w-3 h-3" /> : <FileVideo className="w-3 h-3" />}
                          {item.media_type}
                        </span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item) }} disabled={deleting === item.id} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-[#1a1a2e] truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E8E5F0] divide-y divide-[#E8E5F0]">
                {filtered.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#F8F7FF] cursor-pointer" onClick={() => setPreviewItem(item)}>
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      {item.media_type === "photo" ? (
                        <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center"><Play className="w-4 h-4 text-white ml-0.5" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a2e] truncate">{item.title}</p>
                      <span className="text-xs text-[#6B7280]">{item.media_type}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item) }} disabled={deleting === item.id} className="p-2 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); loadGallery() }} />}
      {showVideoLink && <VideoLinkModal onClose={() => setShowVideoLink(false)} onAdded={() => { setShowVideoLink(false); loadGallery() }} />}

      {/* Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-black">
              {previewItem.media_type === "photo" ? (
                <img src={previewItem.media_url} alt={previewItem.title} className="w-full max-h-[60vh] object-contain" />
              ) : (() => {
                const { provider, videoId } = parseVideoUrl(previewItem.media_url)
                if (provider && videoId) {
                  return (
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe src={getEmbedUrl(provider, videoId)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                    </div>
                  )
                }
                return <video src={previewItem.media_url} controls autoPlay className="w-full max-h-[60vh]" />
              })()}
              <button onClick={() => setPreviewItem(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-[#1a1a2e]">{previewItem.title}</h3>
              {previewItem.description && <p className="text-sm text-[#6B7280] mt-1">{previewItem.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

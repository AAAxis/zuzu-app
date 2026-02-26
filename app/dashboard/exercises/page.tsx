"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Loader2,
  Info,
  Database,
  Image as ImageIcon,
  Video,
  Save,
  CheckCircle,
  X,
  Dumbbell,
  Plus,
  ImagePlus,
  Play,
  Trash2,
  Pencil,
} from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import {
  searchExercises,
  getExercisesByBodyPart,
  getExercisesByEquipment,
  getBodyPartsEnglish,
  getEquipmentListEnglish,
  getExerciseMediaUrl,
  getExerciseVideoUrl,
  mapToExerciseDefinition,
  type ExerciseDBItem,
} from "@/lib/exercisedb-client"
import { ExerciseMedia } from "./ExerciseMedia"
import type { GalleryItem } from "@/lib/types"

type SearchType = "name" | "bodyPart" | "equipment"

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Full Body", "Other"]
const EQUIPMENT_OPTIONS = ["Bodyweight", "Dumbbell", "Barbell", "Kettlebell", "Machine", "Band", "Cable", "Other"]
const EXERCISE_CATEGORIES = ["Strength", "Cardio", "Yoga", "HIIT", "Stretching", "Functional", "Other"]

interface SavedExercise {
  id: string
  name: string
  muscle_group: string | null
  equipment: string | null
  description?: string | null
  video_url: string | null
  exercisedb_gif_url: string | null
  exercisedb_image_url: string | null
}

/* ───────── YouTube/Vimeo thumbnail helper ───────── */
function getVideoThumbnail(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ) || url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  return null
}

/* ───────── Create Exercise Modal ───────── */
function CreateExerciseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (ex: SavedExercise) => void
}) {
  const [name, setName] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("")
  const [category, setCategory] = useState("")
  const [equipment, setEquipment] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError("")
    try {
      let imageUrl: string | null = null
      let videoUrl: string | null = null
      if (selectedGalleryItem) {
        if (selectedGalleryItem.media_type === "photo") {
          imageUrl = selectedGalleryItem.media_url
        } else {
          videoUrl = selectedGalleryItem.media_url
          const thumb = getVideoThumbnail(selectedGalleryItem.media_url)
          if (thumb) imageUrl = thumb
          else if (selectedGalleryItem.thumbnail_url) imageUrl = selectedGalleryItem.thumbnail_url
        }
      }
      const res = await fetch("/api/exercises/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          muscle_group: muscleGroup || null,
          category: category || null,
          equipment: equipment || null,
          description: description.trim() || null,
          video_url: videoUrl,
          exercisedb_id: null,
          exercisedb_image_url: imageUrl,
          exercisedb_gif_url: null,
          exercisedb_target_muscles: [],
          exercisedb_secondary_muscles: [],
          exercisedb_variations: [],
          exercisedb_related_exercises: [],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
      onCreated({
        id: crypto.randomUUID(),
        name: name.trim(),
        muscle_group: muscleGroup || null,
        equipment: equipment || null,
        description: description.trim() || null,
        video_url: videoUrl,
        exercisedb_gif_url: null,
        exercisedb_image_url: imageUrl,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save exercise")
    } finally {
      setSaving(false)
    }
  }

  function getSelectedThumb(): string | null {
    if (!selectedGalleryItem) return null
    if (selectedGalleryItem.media_type === "photo") return selectedGalleryItem.media_url
    const ytThumb = getVideoThumbnail(selectedGalleryItem.media_url)
    if (ytThumb) return ytThumb
    return selectedGalleryItem.thumbnail_url ?? null
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#7C3AED]" />
              Create My Own Exercise
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#E8E5F0] text-[#1a1a2e] hover:bg-gray-100 hover:border-[#E8E5F0] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Exercise Name <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bulgarian Split Squat" className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Muscle Group</label>
                <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 bg-white">
                  <option value="">Select...</option>
                  {MUSCLE_GROUPS.map((mg) => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Equipment</label>
                <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 bg-white">
                  <option value="">Select...</option>
                  {EQUIPMENT_OPTIONS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 bg-white">
                <option value="">Select...</option>
                {EXERCISE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Description / Instructions <span className="text-[#6B7280] font-normal">(optional)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the exercise, form cues, tips..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Media from Gallery <span className="text-[#6B7280] font-normal">(optional)</span></label>
              {selectedGalleryItem ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E5F0] bg-[#F8F7FF]">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#E8E5F0]">
                    {getSelectedThumb() ? (
                      <img src={getSelectedThumb()!} alt={selectedGalleryItem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">{selectedGalleryItem.title}</p>
                    <p className="text-xs text-[#6B7280]">{selectedGalleryItem.media_type} · {selectedGalleryItem.category}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => setShowGalleryPicker(true)} className="p-2 rounded-lg text-[#7C3AED] hover:bg-[#F3F0FF]" title="Change">
                      <ImagePlus className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setSelectedGalleryItem(null)} className="p-2 rounded-lg text-red-400 hover:bg-red-50" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowGalleryPicker(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#E8E5F0] text-[#6B7280] text-sm font-medium hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-[#F8F7FF] transition-all">
                  <ImagePlus className="w-5 h-5" />
                  Attach from Gallery
                </button>
              )}
            </div>
          </div>
          {error && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-medium text-[#6B7280] hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={!name.trim() || saving} className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Create Exercise</>}
            </button>
          </div>
        </div>
      </div>
      {showGalleryPicker && (
        <GalleryPickerModal
          onClose={() => setShowGalleryPicker(false)}
          onSelect={(item) => { setSelectedGalleryItem(item); setShowGalleryPicker(false) }}
        />
      )}
    </>
  )
}

/* ───────── Gallery Picker Modal ───────── */
function GalleryPickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (item: GalleryItem) => void }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  useEffect(() => {
    getSupabase().from("training_gallery").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setItems((data as GalleryItem[]) ?? [])
      setLoading(false)
    })
  }, [])
  const filtered = items.filter((item) => !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#7C3AED]" />
            Select from Gallery
          </h3>
          <button type="button" onClick={onClose} className="p-2.5 rounded-xl border border-[#E8E5F0] text-[#1a1a2e] hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-[#E8E5F0] mx-auto mb-3" />
              <p className="text-[#6B7280] text-sm">{items.length === 0 ? "No gallery items yet. Upload media in the Gallery page first." : "No items match your search."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const thumb = item.media_type === "photo" ? item.media_url : getVideoThumbnail(item.media_url) || item.thumbnail_url || null
                return (
                  <button key={item.id} type="button" onClick={() => onSelect(item)} className="group rounded-xl border border-[#E8E5F0] overflow-hidden hover:border-[#7C3AED] hover:shadow-md text-left">
                    <div className="aspect-square bg-[#E8E5F0] relative overflow-hidden">
                      {thumb ? <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#7C3AED] flex items-center justify-center"><Play className="w-6 h-6 text-white ml-0.5" /></div>
                      )}
                      {item.media_type === "video" && (
                        <div className="absolute bottom-1 left-1">
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/80 text-white"><Video className="w-2.5 h-2.5" /> video</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-[#1a1a2e] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#6B7280] truncate">{item.category}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────── Exercise Detail + Edit Modal (for My Library) ───────── */
function ExerciseDetailEditModal({
  exercise,
  onClose,
  onUpdated,
  onDeleted,
}: {
  exercise: SavedExercise
  onClose: () => void
  onUpdated: (updated: SavedExercise) => void
  onDeleted?: () => void
}) {
  const [name, setName] = useState(exercise.name)
  const [muscleGroup, setMuscleGroup] = useState(exercise.muscle_group ?? "")
  const [equipment, setEquipment] = useState(exercise.equipment ?? "")
  const [description, setDescription] = useState(exercise.description ?? "")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null)
  const imageUrl = exercise.exercisedb_gif_url || exercise.exercisedb_image_url
  const videoUrl = exercise.video_url

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError("")
    try {
      let finalImageUrl: string | null = exercise.exercisedb_image_url || exercise.exercisedb_gif_url
      let finalVideoUrl: string | null = exercise.video_url
      if (selectedGalleryItem) {
        if (selectedGalleryItem.media_type === "photo") {
          finalImageUrl = selectedGalleryItem.media_url
        } else {
          finalVideoUrl = selectedGalleryItem.media_url
          const thumb = getVideoThumbnail(selectedGalleryItem.media_url)
          finalImageUrl = thumb || selectedGalleryItem.thumbnail_url || finalImageUrl
        }
      }
      const res = await fetch("/api/exercises/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exercise.id,
          name: name.trim(),
          muscle_group: muscleGroup || null,
          equipment: equipment || null,
          description: description.trim() || null,
          video_url: finalVideoUrl,
          exercisedb_image_url: finalImageUrl,
          exercisedb_gif_url: finalImageUrl,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
      onUpdated({
        ...exercise,
        name: name.trim(),
        muscle_group: muscleGroup || null,
        equipment: equipment || null,
        description: description.trim() || null,
        video_url: finalVideoUrl,
        exercisedb_image_url: finalImageUrl,
        exercisedb_gif_url: finalImageUrl,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${exercise.name}" from your library?`)) return
    setDeleting(true)
    setError("")
    try {
      const res = await fetch("/api/exercises/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: exercise.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || "Failed to delete")
      }
      onDeleted?.()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  const displayImageUrl = selectedGalleryItem
    ? selectedGalleryItem.media_type === "photo"
      ? selectedGalleryItem.media_url
      : getVideoThumbnail(selectedGalleryItem.media_url) || selectedGalleryItem.thumbnail_url
    : imageUrl

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-[#E8E5F0] flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#7C3AED]" />
              Details & Edit
            </h2>
            <button type="button" onClick={onClose} className="p-2.5 rounded-xl border border-[#E8E5F0] text-[#1a1a2e] hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Preview / media */}
            {(displayImageUrl || videoUrl) && (
              <div className="rounded-xl overflow-hidden border border-[#E8E5F0] bg-[#F8F7FF] aspect-video max-h-48">
                {displayImageUrl && (
                  <img src={displayImageUrl} alt={name} className="w-full h-full object-contain" />
                )}
                {videoUrl && !displayImageUrl && (
                  <video src={videoUrl} controls className="w-full h-full object-contain" />
                )}
              </div>
            )}

            {/* Edit form */}
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Muscle group</label>
                <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20">
                  <option value="">—</option>
                  {MUSCLE_GROUPS.map((mg) => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Equipment</label>
                <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20">
                  <option value="">—</option>
                  {EQUIPMENT_OPTIONS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Instructions, notes..." className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Media from Gallery (optional)</label>
              {selectedGalleryItem ? (
                <div className="flex items-center gap-2 p-2 rounded-xl border border-[#E8E5F0] bg-[#F8F7FF]">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E8E5F0] shrink-0">
                    {selectedGalleryItem.media_type === "photo" ? (
                      <img src={selectedGalleryItem.media_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Play className="w-5 h-5 text-[#7C3AED]" /></div>
                    )}
                  </div>
                  <span className="text-sm truncate flex-1">{selectedGalleryItem.title}</span>
                  <button type="button" onClick={() => setSelectedGalleryItem(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowGalleryPicker(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E8E5F0] text-[#6B7280] text-sm hover:border-[#7C3AED] hover:text-[#7C3AED] flex items-center justify-center gap-2">
                  <ImagePlus className="w-4 h-4" /> Change media from Gallery
                </button>
              )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
          <div className="p-4 border-t border-[#E8E5F0] flex flex-wrap gap-2 shrink-0">
            {onDeleted && (
              <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Trash2 className="w-4 h-4 inline mr-1" />}
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm font-medium text-[#6B7280] hover:bg-gray-50">
              Close
            </button>
            <button type="button" onClick={handleSave} disabled={!name.trim() || saving} className="px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
      {showGalleryPicker && (
        <GalleryPickerModal onClose={() => setShowGalleryPicker(false)} onSelect={(item) => { setSelectedGalleryItem(item); setShowGalleryPicker(false) }} />
      )}
    </>
  )
}

export default function ExercisesPage() {
  const [searchType, setSearchType] = useState<SearchType>("name")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBodyPart, setSelectedBodyPart] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState("")
  const [bodyParts, setBodyParts] = useState<string[]>([])
  const [equipmentList, setEquipmentList] = useState<string[]>([])
  const [results, setResults] = useState<ExerciseDBItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDBItem | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [myLibrary, setMyLibrary] = useState<SavedExercise[]>([])
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLibraryExercise, setSelectedLibraryExercise] = useState<SavedExercise | null>(null)

  useEffect(() => {
    Promise.all([getBodyPartsEnglish(), getEquipmentListEnglish()]).then(
      ([bp, eq]) => {
        setBodyParts(bp)
        setEquipmentList(eq)
      }
    )
  }, [])

  useEffect(() => {
    async function load() {
      setLibraryLoading(true)
      const { data } = await getSupabase()
        .from("exercise_definitions")
        .select("id, name, muscle_group, equipment, description, video_url, exercisedb_gif_url, exercisedb_image_url")
        .order("name")
      setMyLibrary((data as SavedExercise[]) ?? [])
      setLibraryLoading(false)
    }
    load()
  }, [])

  const canSearch =
    searchType === "name"
      ? searchTerm.trim().length > 0
      : searchType === "bodyPart"
        ? selectedBodyPart.length > 0
        : selectedEquipment.length > 0

  async function handleSearch() {
    if (!canSearch) return
    setLoading(true)
    try {
      let list: ExerciseDBItem[] = []
      if (searchType === "name") {
        list = await searchExercises(searchTerm.trim(), 50)
      } else if (searchType === "bodyPart") {
        list = await getExercisesByBodyPart(selectedBodyPart, 50)
      } else {
        list = await getExercisesByEquipment(selectedEquipment, 50)
      }
      setResults(list ?? [])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function saveToLibrary(exercise: ExerciseDBItem) {
    const id = exercise.exerciseId ?? exercise.id ?? ""
    const idStr = String(id)
    setSavingId(idStr)
    setSaveError(null)
    try {
      const row = mapToExerciseDefinition(exercise)
      const res = await fetch("/api/exercises/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          muscle_group: row.muscle_group,
          category: row.category,
          equipment: row.equipment,
          description: row.description,
          video_url: row.video_url || null,
          exercisedb_id: row.exercisedb_id || null,
          exercisedb_image_url: row.exercisedb_image_url || null,
          exercisedb_gif_url: row.exercisedb_gif_url || null,
          exercisedb_target_muscles: row.exercisedb_target_muscles ?? [],
          exercisedb_secondary_muscles: row.exercisedb_secondary_muscles ?? [],
          exercisedb_variations: row.exercisedb_variations ?? [],
          exercisedb_related_exercises: row.exercisedb_related_exercises ?? [],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
      setSavedId(idStr)
      setTimeout(() => setSavedId(null), 2000)
      setMyLibrary((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: row.name,
          muscle_group: row.muscle_group,
          equipment: row.equipment,
          description: row.description ?? null,
          video_url: row.video_url || null,
          exercisedb_gif_url: row.exercisedb_gif_url || null,
          exercisedb_image_url: row.exercisedb_image_url || null,
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save"
      setSaveError(msg)
      console.error(err)
    } finally {
      setSavingId(null)
    }
  }

  function getMediaUrl(ex: ExerciseDBItem) {
    return getExerciseMediaUrl(ex)
  }
  function getVidUrl(ex: ExerciseDBItem) {
    return getExerciseVideoUrl(ex)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-[#7C3AED]" />
            Exercise Library
          </h1>
          <p className="text-[#6B7280] mt-1">
            Search 11,000+ exercises or create your own custom exercises.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6D28D9] transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create My Own
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "name" as const, label: "Search by name" },
              { value: "bodyPart" as const, label: "By body part" },
              { value: "equipment" as const, label: "By equipment" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSearchType(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                searchType === value
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20"
                  : "bg-[#F8F7FF] text-[#6B7280] hover:bg-[#E8E5F0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {searchType === "name" && (
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="e.g. bench press, squat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-xl border border-[#E8E5F0] px-4 py-3 pr-10 text-[#1a1a2e] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>
        )}
        {searchType === "bodyPart" && (
          <select
            value={selectedBodyPart}
            onChange={(e) => setSelectedBodyPart(e.target.value)}
            className="w-full rounded-xl border border-[#E8E5F0] px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          >
            <option value="">Select body part</option>
            {bodyParts.map((bp) => (
              <option key={bp} value={bp}>
                {bp}
              </option>
            ))}
          </select>
        )}
        {searchType === "equipment" && (
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full rounded-xl border border-[#E8E5F0] px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          >
            <option value="">Select equipment</option>
            {equipmentList.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={handleSearch}
          disabled={!canSearch || loading}
          className="w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search ExerciseDB
            </>
          )}
        </button>
      </div>

      {saveError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm flex items-center justify-between gap-2">
          <span>{saveError}</span>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-red-600 hover:text-red-800 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results — Vitrix-style card grid: large GIF on top, name below */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
          <p className="text-sm text-[#6B7280] mb-4">
            Found {results.length} exercises
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
            <AnimatePresence>
              {results.map((exercise, index) => {
                const mediaUrl = getMediaUrl(exercise)
                const exerciseId = exercise.exerciseId ?? exercise.id ?? `ex-${index}`
                const name = exercise.name || "Unknown"
                return (
                  <motion.div
                    key={exerciseId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#E8E5F0] bg-[#F8F7FF] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedExercise(exercise)}
                      className="block w-full text-left flex-1 flex flex-col min-w-0"
                    >
                      <div className="aspect-square w-full min-h-[140px] bg-[#E8E5F0] overflow-hidden">
                        <ExerciseMedia
                          src={mediaUrl}
                          alt={name}
                          boxClassName="w-full aspect-square min-h-[140px]"
                          objectFit="cover"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col min-w-0">
                        <p className="font-semibold text-[#1a1a2e] line-clamp-2 text-sm">
                          {name}
                        </p>
                        {(exercise.bodyParts?.length ?? 0) > 0 && (
                          <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                            {exercise.bodyParts?.join(", ")}
                          </p>
                        )}
                      </div>
                    </button>
                    <div className="p-2 border-t border-[#E8E5F0] flex items-center justify-end gap-1 bg-white/80">
                      <button
                        type="button"
                        onClick={() => setSelectedExercise(exercise)}
                        className="p-2 rounded-lg text-[#7C3AED] hover:bg-[#F3F0FF] transition-colors"
                        title="Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveToLibrary(exercise)}
                        disabled={savingId === String(exerciseId)}
                        className="p-2 rounded-lg text-[#10B981] hover:bg-[#ECFDF5] transition-colors disabled:opacity-50"
                        title="Save to library"
                      >
                        {savingId === String(exerciseId) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : savedId === String(exerciseId) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* My Library (Supabase) */}
      <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
        <h2 className="text-lg font-bold text-[#1a1a2e] flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-[#7C3AED]" />
          My Library (Supabase)
        </h2>
        {libraryLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : myLibrary.length === 0 ? (
          <p className="text-[#6B7280] py-8 text-center">
            No exercises saved yet. Search above and click Save to add exercises to your library.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
            {myLibrary.map((ex) => {
              const mediaUrl =
                ex.exercisedb_gif_url || ex.exercisedb_image_url || (ex.video_url && !ex.video_url.includes("youtube") && !ex.video_url.includes("vimeo") ? ex.video_url : null)
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedLibraryExercise(ex)}
                  className="rounded-xl border border-[#E8E5F0] bg-[#F8F7FF] overflow-hidden flex flex-col shadow-sm text-left hover:border-[#7C3AED] hover:shadow-md transition-all"
                >
                  <div className="aspect-square w-full min-h-[120px] bg-[#E8E5F0] overflow-hidden">
                    <ExerciseMedia
                      src={mediaUrl}
                      alt={ex.name}
                      boxClassName="w-full aspect-square min-h-[120px]"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1a2e] line-clamp-2 text-sm">
                      {ex.name}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                      {[ex.muscle_group, ex.equipment].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Create My Own Modal */}
      {showCreateModal && (
        <CreateExerciseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newEx) => {
            setShowCreateModal(false)
            setMyLibrary((prev) => [...prev, newEx])
          }}
        />
      )}

      {/* Library exercise: Detail + Edit dialog */}
      {selectedLibraryExercise && (
        <ExerciseDetailEditModal
          exercise={selectedLibraryExercise}
          onClose={() => setSelectedLibraryExercise(null)}
          onUpdated={(updated) => {
            setMyLibrary((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
          }}
          onDeleted={() => {
            setMyLibrary((prev) => prev.filter((e) => e.id !== selectedLibraryExercise.id))
          }}
        />
      )}

      {/* Detail modal (search results) */}
      <AnimatePresence>
        {selectedExercise && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#E8E5F0] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[#E8E5F0] flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-[#1a1a2e]">
                  {selectedExercise.name || "Exercise"}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F0FF] hover:text-[#1a1a2e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                {(() => {
                  const mediaUrl = getMediaUrl(selectedExercise)
                  const videoUrl = getVidUrl(selectedExercise)
                  return (
                    <>
                      {(mediaUrl || videoUrl) && (
                        <div className="space-y-3">
                          {mediaUrl && (
                            <div>
                              <p className="text-sm font-semibold text-[#6B7280] mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Demo
                              </p>
                              <div className="rounded-xl overflow-hidden border border-[#E8E5F0] bg-[#F8F7FF] min-h-[200px]">
                                <ExerciseMedia
                                  src={mediaUrl}
                                  alt={selectedExercise.name ?? "Exercise"}
                                  boxClassName="w-full max-h-80"
                                  objectFit="contain"
                                />
                              </div>
                            </div>
                          )}
                          {videoUrl && (
                            <div>
                              <p className="text-sm font-semibold text-[#6B7280] mb-2 flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Video
                              </p>
                              <div className="rounded-xl overflow-hidden border border-[#E8E5F0] bg-[#F8F7FF]">
                                <video
                                  src={videoUrl}
                                  controls
                                  className="w-full max-h-80"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {(selectedExercise.bodyParts?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-[#6B7280] mb-1">
                            Body parts
                          </p>
                          <p className="text-[#1a1a2e]">
                            {selectedExercise.bodyParts?.join(", ")}
                          </p>
                        </div>
                      )}
                      {(selectedExercise.equipments?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-[#6B7280] mb-1">
                            Equipment
                          </p>
                          <p className="text-[#1a1a2e]">
                            {selectedExercise.equipments?.join(", ")}
                          </p>
                        </div>
                      )}
                      {(selectedExercise.instructions?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-[#6B7280] mb-1">
                            Instructions
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-[#1a1a2e]">
                            {selectedExercise.instructions?.map((inst, i) => (
                              <li key={i}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              <div className="p-6 border-t border-[#E8E5F0] flex gap-3">
                <button
                  type="button"
                  onClick={() => saveToLibrary(selectedExercise)}
                  disabled={savingId !== null}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {savingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedId ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savedId ? "Saved" : "Save to library"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExercise(null)}
                  className="px-6 py-3 rounded-xl border border-[#E8E5F0] text-[#1a1a2e] font-medium hover:bg-[#F8F7FF]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

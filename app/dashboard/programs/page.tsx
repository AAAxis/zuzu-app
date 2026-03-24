"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Edit,
  FilePlus,
  X,
  Calendar,
  ImagePlus,
  Users,
  MapPin,
  Moon,
  Dumbbell,
} from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { getTranslated, DEFAULT_LOCALE } from "@/lib/locale"

interface WorkoutTemplate {
  id: string
  template_name: string
  workout_title: string
  workout_description: string
  thumbnail_url?: string | null
  gender?: string
  location?: string
  translations?: { he?: { template_name?: string; workout_title?: string; workout_description?: string } } | null
}

interface ProgramDay {
  day_number: number
  type: "workout" | "rest"
  workout_template_id: string | null
  label: string
}

interface WorkoutProgram {
  id: string
  name: string
  name_he?: string
  description: string
  description_he?: string
  thumbnail_url: string | null
  gender: string
  location: string
  created_by: string
  is_system_program: boolean
  days: ProgramDay[]
  translations?: { he?: { name?: string; description?: string } } | null
  updated_at?: string
}

export default function ProgramsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [programs, setPrograms] = useState<WorkoutProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Program form state
  const [programName, setProgramName] = useState("")
  const [programDescription, setProgramDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [gender, setGender] = useState("unisex")
  const [location, setLocation] = useState("gym")
  const [isSystemProgram, setIsSystemProgram] = useState(false)
  const [days, setDays] = useState<ProgramDay[]>([
    { day_number: 1, type: "workout", workout_template_id: null, label: "Day 1" },
  ])
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null)
  const [programToDelete, setProgramToDelete] = useState<WorkoutProgram | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u ?? null)

      const [tplsRes, progsRes] = await Promise.all([
        supabase.from("workout_templates").select("id, template_name, workout_title, workout_description, thumbnail_url, gender, location, translations").order("template_name"),
        u ? supabase.from("workout_programs").select("*").eq("created_by", u.email!).order("name") : Promise.resolve({ data: [] }),
      ])

      setTemplates((tplsRes.data as WorkoutTemplate[]) ?? [])
      setPrograms((progsRes.data as WorkoutProgram[]) ?? [])
      setIsLoading(false)
    }
    load()
  }, [])

  function getTemplateName(t: WorkoutTemplate): string {
    return getTranslated(t, "template_name", DEFAULT_LOCALE) || t.template_name
  }

  function addDay() {
    const nextNum = days.length + 1
    setDays((prev) => [...prev, { day_number: nextNum, type: "workout", workout_template_id: null, label: `Day ${nextNum}` }])
  }

  function removeDay(index: number) {
    setDays((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.map((d, i) => ({ ...d, day_number: i + 1 }))
    })
  }

  function updateDay(index: number, patch: Partial<ProgramDay>) {
    setDays((prev) => prev.map((d, i) => i === index ? { ...d, ...patch } : d))
  }

  function toggleDayType(index: number) {
    setDays((prev) => prev.map((d, i) => {
      if (i !== index) return d
      const newType = d.type === "workout" ? "rest" : "workout"
      return {
        ...d,
        type: newType,
        workout_template_id: newType === "rest" ? null : d.workout_template_id,
        label: newType === "rest" ? "Rest" : d.label === "Rest" ? `Day ${d.day_number}` : d.label,
      }
    }))
  }

  async function saveProgram() {
    if (!programName.trim()) {
      alert("Enter a program name.")
      return
    }
    if (days.length === 0) {
      alert("Add at least one day.")
      return
    }
    if (!user?.email) {
      alert("You must be signed in.")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/programs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProgram?.id,
          name: programName.trim(),
          description: programDescription,
          thumbnail_url: thumbnailUrl,
          gender,
          location,
          is_system_program: isSystemProgram,
          days,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)

      if (editingProgram) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === editingProgram.id
              ? { ...p, name: programName.trim(), description: programDescription, thumbnail_url: thumbnailUrl, gender, location, is_system_program: isSystemProgram, days, updated_at: new Date().toISOString() }
              : p
          )
        )
        alert("Program updated.")
      } else {
        const id = (data as { id?: string }).id
        if (id) {
          setPrograms((prev) => [...prev, {
            id,
            name: programName.trim(),
            description: programDescription,
            thumbnail_url: thumbnailUrl,
            gender,
            location,
            created_by: user.email!,
            is_system_program: isSystemProgram,
            days,
            updated_at: new Date().toISOString(),
          }])
        }
        alert("Program saved.")
      }
      setEditingProgram(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save.")
    } finally {
      setIsSaving(false)
    }
  }

  function loadProgram(p: WorkoutProgram, forEdit = false) {
    setProgramName(p.name)
    setProgramDescription(p.description || "")
    setThumbnailUrl(p.thumbnail_url)
    setGender(p.gender || "unisex")
    setLocation(p.location || "gym")
    setIsSystemProgram(p.is_system_program)
    setDays(p.days?.length ? p.days : [{ day_number: 1, type: "workout", workout_template_id: null, label: "Day 1" }])
    if (forEdit) setEditingProgram(p)
    else setEditingProgram(null)
  }

  async function deleteProgram() {
    if (!programToDelete) return
    try {
      const res = await fetch("/api/programs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: programToDelete.id }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setPrograms((prev) => prev.filter((p) => p.id !== programToDelete.id))
      alert("Program deleted.")
    } catch {
      alert("Failed to delete.")
    }
    setProgramToDelete(null)
  }

  function resetNew() {
    setProgramName("")
    setProgramDescription("")
    setThumbnailUrl(null)
    setGender("unisex")
    setLocation("gym")
    setIsSystemProgram(false)
    setDays([{ day_number: 1, type: "workout", workout_template_id: null, label: "Day 1" }])
    setEditingProgram(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] flex items-center gap-2">
          <Calendar className="w-8 h-8 text-[#7C3AED]" />
          Workout Programs
        </h1>
        <p className="text-[#6B7280] mt-1">
          Build weekly programs from your workout templates. Each program is a repeating cycle of days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Program details */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-2">Program details</h2>
            <input
              type="text"
              placeholder="Program name (e.g. Push/Pull/Legs)"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full rounded-xl border border-[#E8E5F0] px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <textarea
              placeholder="Description (optional)"
              value={programDescription}
              onChange={(e) => setProgramDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[#E8E5F0] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none mb-3"
            />

            {/* Thumbnail */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Thumbnail image</label>
              {thumbnailUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#E8E5F0] bg-[#F8F7FF]">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setThumbnailUrl(null)} className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg hover:bg-white">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <label className="w-full py-3 rounded-xl border-2 border-dashed border-[#E8E5F0] text-[#6B7280] text-sm hover:border-[#7C3AED] hover:text-[#7C3AED] flex items-center justify-center gap-2 cursor-pointer">
                  {thumbnailUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {thumbnailUploading ? "Uploading..." : "Upload thumbnail"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setThumbnailUploading(true)
                      try {
                        const formData = new FormData()
                        formData.append("file", file)
                        formData.append("title", programName || "program-thumbnail")
                        formData.append("category", "Thumbnail")
                        const res = await fetch("/api/gallery/upload", { method: "POST", body: formData })
                        const data = await res.json()
                        if (data.url) setThumbnailUrl(data.url)
                      } catch { /* ignore */ }
                      setThumbnailUploading(false)
                    }}
                  />
                </label>
              )}
            </div>

            {/* Gender & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1"><Users className="w-3 h-3 inline mr-1" />Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-xl border border-[#E8E5F0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1"><MapPin className="w-3 h-3 inline mr-1" />Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-[#E8E5F0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                  <option value="gym">Gym</option>
                  <option value="home">Home</option>
                </select>
              </div>
            </div>
          </div>

          {/* My programs */}
          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-2">My programs</h2>
            <p className="text-sm text-[#6B7280] mb-3">Load, edit or delete saved programs.</p>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={resetNew} className="p-2.5 rounded-xl border border-[#E8E5F0] text-[#6B7280] hover:bg-[#F8F7FF]" title="New program">
                <FilePlus className="w-5 h-5" />
              </button>
            </div>
            {programs.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No programs yet. Build your first one above.</p>
            ) : (
              <div className="space-y-2">
                {programs.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7FF] border border-[#E8E5F0]">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.thumbnail_url && (
                        <img src={p.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[#1a1a2e] truncate">{p.translations?.he?.name || p.name}</p>
                        <p className="text-xs text-[#6B7280]">{p.days.length} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => loadProgram(p, true)} className="p-1.5 text-[#7C3AED] hover:bg-white rounded-lg" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setProgramToDelete(p)} className="p-1.5 text-red-500 hover:bg-white rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Program days */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a1a2e]">Program days</h2>
              <button
                type="button"
                onClick={addDay}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:opacity-90"
              >
                <Plus className="w-4 h-4" /> Add day
              </button>
            </div>

            {days.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-8">No days added yet. Click &quot;Add day&quot; to start.</p>
            ) : (
              <div className="space-y-3">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      day.type === "rest"
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-[#E8E5F0] bg-[#F8F7FF]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#6B7280] uppercase">Day {day.day_number}</span>
                        <button
                          type="button"
                          onClick={() => toggleDayType(index)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            day.type === "rest"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-[#F3F0FF] text-[#7C3AED]"
                          }`}
                        >
                          {day.type === "rest" ? (
                            <><Moon className="w-3 h-3 inline mr-1" />Rest</>
                          ) : (
                            <><Dumbbell className="w-3 h-3 inline mr-1" />Workout</>
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Day label (e.g. Push Day, Upper Body)"
                      value={day.label}
                      onChange={(e) => updateDay(index, { label: e.target.value })}
                      className="w-full rounded-lg border border-[#E8E5F0] px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />

                    {day.type === "workout" && (
                      <select
                        value={day.workout_template_id || ""}
                        onChange={(e) => updateDay(index, { workout_template_id: e.target.value || null })}
                        className="w-full rounded-lg border border-[#E8E5F0] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                      >
                        <option value="">Select workout template...</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{getTemplateName(t)}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save section */}
          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">Save program</h2>
            <button
              type="button"
              onClick={saveProgram}
              disabled={isSaving || !programName.trim() || days.length === 0}
              className="flex items-center gap-2 bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingProgram ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {programToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setProgramToDelete(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">Delete program?</h3>
            <p className="text-sm text-[#6B7280] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setProgramToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] font-medium">
                Cancel
              </button>
              <button type="button" onClick={deleteProgram} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

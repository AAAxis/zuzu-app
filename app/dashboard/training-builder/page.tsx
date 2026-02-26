"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Search,
  Save,
  FolderOpen,
  Loader2,
  Edit,
  FilePlus,
  Video,
  Info,
  ClipboardList,
  X,
  Sparkles,
} from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { getDisplayName, getTranslated, DEFAULT_LOCALE } from "@/lib/locale"

interface ExerciseDef {
  id: string
  name: string
  muscle_group: string | null
  equipment: string | null
  video_url: string | null
  exercisedb_gif_url: string | null
  exercisedb_image_url: string | null
  description: string | null
  translations?: { he?: { name?: string; description?: string; muscle_group?: string; equipment?: string } } | null
}

interface WorkoutExercise {
  key: string
  definitionId: string
  name: string
  category: string | null
  video_url: string | null
  part: "part_1_exercises" | "part_2_exercises" | "part_3_exercises"
  suggested_sets: number
  suggested_reps: number
  suggested_weight: number
  suggested_duration: number
  notes: string
}

interface WorkoutTemplateRow {
  id: string
  created_by: string
  template_name: string
  workout_title: string
  workout_description: string
  part_1_exercises: WorkoutExercise[]
  part_2_exercises: WorkoutExercise[]
  part_3_exercises: WorkoutExercise[]
  updated_at?: string
  translations?: { he?: { template_name?: string; workout_title?: string; workout_description?: string } } | null
}

const PART_LABELS: Record<string, string> = {
  part_1_exercises: "Part 1 — Main",
  part_2_exercises: "Part 2 — Secondary",
  part_3_exercises: "Part 3 — Finisher",
}

export default function TrainingBuilderPage() {
  const [user, setUser] = useState<User | null>(null)
  const [exerciseDefinitions, setExerciseDefinitions] = useState<ExerciseDef[]>([])
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [workoutTitle, setWorkoutTitle] = useState("Custom workout")
  const [workoutDescription, setWorkoutDescription] = useState("")
  const [templates, setTemplates] = useState<WorkoutTemplateRow[]>([])
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplateRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExerciseInfo, setSelectedExerciseInfo] = useState<ExerciseDef | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplateRow | null>(null)
  const [videoModal, setVideoModal] = useState({ open: false, url: "", title: "" })
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u ?? null)

      const [defsRes, tplsRes] = await Promise.all([
        supabase.from("exercise_definitions").select("id, name, muscle_group, equipment, video_url, exercisedb_gif_url, exercisedb_image_url, description, translations").order("name"),
        u ? supabase.from("workout_templates").select("*").eq("created_by", u.email!).order("template_name") : Promise.resolve({ data: [] }),
      ])

      const defs = (defsRes.data as ExerciseDef[]) ?? []
      setExerciseDefinitions(defs)

      const tpls = (tplsRes.data as WorkoutTemplateRow[]) ?? []
      setTemplates(tpls)
      setIsLoading(false)
    }
    load()
  }, [])

  const addExercise = (ex: ExerciseDef) => {
    const newEx: WorkoutExercise = {
      key: `${ex.id}-${Date.now()}`,
      definitionId: ex.id,
      name: ex.name,
      category: ex.muscle_group,
      video_url: ex.video_url,
      part: "part_1_exercises",
      suggested_sets: 3,
      suggested_reps: 10,
      suggested_weight: 0,
      suggested_duration: 0,
      notes: "",
    }
    setWorkoutExercises((prev) => [...prev, newEx])
  }

  const removeExercise = (key: string) => {
    setWorkoutExercises((prev) => prev.filter((e) => e.key !== key))
  }

  const setExerciseField = (key: string, field: keyof WorkoutExercise, value: string | number) => {
    setWorkoutExercises((prev) =>
      prev.map((e) =>
        e.key === key ? { ...e, [field]: value } : e
      )
    )
  }

  const filteredExercises = exerciseDefinitions.filter(
    (ex) => {
      const term = searchTerm.toLowerCase()
      const nameMatch = ex.name.toLowerCase().includes(term)
      const heName = ex.translations?.he?.name?.toLowerCase().includes(term)
      const muscleMatch = (ex.muscle_group?.toLowerCase().includes(term) ?? false)
      return nameMatch || heName || muscleMatch
    }
  )

  const saveTemplate = async () => {
    const name = workoutTitle.trim()
    if (!name) {
      alert("Enter a workout title.")
      return
    }
    if (workoutExercises.length === 0) {
      alert("Add at least one exercise.")
      return
    }
    if (!user?.email) {
      alert("You must be signed in to save templates.")
      return
    }
    setIsSaving(true)
    const payload = {
      id: editingTemplate?.id,
      created_by: user.email,
      template_name: name,
      workout_title: name,
      workout_description: workoutDescription || "",
      part_1_exercises: workoutExercises.filter((e) => e.part === "part_1_exercises"),
      part_2_exercises: workoutExercises.filter((e) => e.part === "part_2_exercises"),
      part_3_exercises: workoutExercises.filter((e) => e.part === "part_3_exercises"),
      updated_at: new Date().toISOString(),
    }
    try {
      const res = await fetch("/api/workout-templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
      if (editingTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === editingTemplate.id
              ? { ...t, ...payload, id: t.id }
              : t
          )
        )
        alert("Template updated.")
      } else {
        const id = (data as { id?: string }).id
        if (id) {
          const newRow: WorkoutTemplateRow = {
            id,
            created_by: payload.created_by,
            template_name: payload.template_name,
            workout_title: payload.workout_title,
            workout_description: payload.workout_description,
            part_1_exercises: payload.part_1_exercises,
            part_2_exercises: payload.part_2_exercises,
            part_3_exercises: payload.part_3_exercises,
            updated_at: payload.updated_at,
          }
          setTemplates((prev) => [...prev, newRow])
        }
        alert("Template saved.")
      }
      setEditingTemplate(null)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Failed to save template.")
    } finally {
      setIsSaving(false)
    }
  }

  const loadTemplate = (t: WorkoutTemplateRow, forEdit = false) => {
    setWorkoutTitle(t.workout_title || "Custom workout")
    setWorkoutDescription(t.workout_description || "")
    const p1 = (t.part_1_exercises ?? []).map((e, i) => ({
      ...e,
      key: e.key || `p1-${Date.now()}-${i}`,
      part: "part_1_exercises" as const,
    }))
    const p2 = (t.part_2_exercises ?? []).map((e, i) => ({
      ...e,
      key: e.key || `p2-${Date.now()}-${i}`,
      part: "part_2_exercises" as const,
    }))
    const p3 = (t.part_3_exercises ?? []).map((e, i) => ({
      ...e,
      key: e.key || `p3-${Date.now()}-${i}`,
      part: "part_3_exercises" as const,
    }))
    setWorkoutExercises([...p1, ...p2, ...p3])
    if (forEdit) {
      setEditingTemplate(t)
    } else {
      setEditingTemplate(null)
    }
  }

  const deleteTemplate = async () => {
    if (!templateToDelete) return
    try {
      await getSupabase().from("workout_templates").delete().eq("id", templateToDelete.id)
      setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id))
      alert("Template deleted.")
    } catch (e) {
      console.error(e)
      alert("Failed to delete.")
    }
    setTemplateToDelete(null)
  }

  const resetNew = () => {
    setWorkoutTitle("Custom workout")
    setWorkoutDescription("")
    setWorkoutExercises([])
    setEditingTemplate(null)
  }

  const generateWithAi = async () => {
    const prompt = aiPrompt.trim()
    if (!prompt) {
      setAiError("Describe your workout first.")
      return
    }
    if (exerciseDefinitions.length === 0) {
      setAiError("Add at least one exercise to your library (Exercises tab) first.")
      return
    }
    setAiError(null)
    setAiLoading(true)
    try {
      const res = await fetch("/api/training-builder/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          exercises: exerciseDefinitions.map((e) => ({ id: e.id, name: e.name })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || res.statusText)
      }
      const result = data as {
        template_name: string
        workout_title: string
        workout_description: string
        exercises: Array<{
          exerciseId: string
          part: "part_1_exercises" | "part_2_exercises" | "part_3_exercises"
          suggested_sets: number
          suggested_reps: number
          suggested_weight: number
          suggested_duration: number
          notes: string
        }>
      }
      setWorkoutTitle(result.workout_title)
      setWorkoutDescription(result.workout_description)
      const defsById = new Map(exerciseDefinitions.map((e) => [e.id, e]))
      const newExercises: WorkoutExercise[] = result.exercises.map((item, i) => {
        const def = defsById.get(item.exerciseId)
        if (!def) return null
        return {
          key: `${def.id}-ai-${Date.now()}-${i}`,
          definitionId: def.id,
          name: def.name,
          category: def.muscle_group,
          video_url: def.video_url,
          part: item.part,
          suggested_sets: item.suggested_sets,
          suggested_reps: item.suggested_reps,
          suggested_weight: item.suggested_weight,
          suggested_duration: item.suggested_duration,
          notes: item.notes,
        }
      }).filter((x): x is WorkoutExercise => x !== null)
      setWorkoutExercises(newExercises)
      setEditingTemplate(null)
      setAiModalOpen(false)
      setAiPrompt("")
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Failed to generate workout.")
    } finally {
      setAiLoading(false)
    }
  }

  const byPart = {
    part_1_exercises: workoutExercises.filter((e) => e.part === "part_1_exercises"),
    part_2_exercises: workoutExercises.filter((e) => e.part === "part_2_exercises"),
    part_3_exercises: workoutExercises.filter((e) => e.part === "part_3_exercises"),
  }

  function getWorkoutExerciseDisplayName(we: WorkoutExercise): string {
    const def = exerciseDefinitions.find((d) => d.id === we.definitionId)
    return def ? getDisplayName(def, DEFAULT_LOCALE) : we.name
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
          <ClipboardList className="w-8 h-8 text-[#7C3AED]" />
          Training Builder
        </h1>
        <p className="text-[#6B7280] mt-1">
          Build workouts from your exercise library. Save templates and reuse them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Exercise library */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-2">Workout details</h2>
            <input
              type="text"
              placeholder="Workout title (e.g. Leg day A)"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E8E5F0] px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <textarea
              placeholder="Short description (optional)"
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[#E8E5F0] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
            />
            <button
              type="button"
              onClick={() => { setAiError(null); setAiPrompt(""); setAiModalOpen(true) }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#7C3AED] text-[#7C3AED] font-medium hover:bg-[#F8F7FF] transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Create with AI
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">Add exercises</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search exercise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <p className="text-xs text-[#6B7280] mb-2">
              {exerciseDefinitions.length} exercises available
              {searchTerm && ` (${filteredExercises.length} matching)`}
            </p>
            <div className="h-[360px] overflow-y-auto border border-[#E8E5F0] rounded-xl bg-[#F8F7FF]">
              <div className="p-2 space-y-1">
                {filteredExercises.length === 0 ? (
                  <p className="text-center text-[#6B7280] py-8">
                    {searchTerm ? "No exercises match." : "No exercises in library. Add some from the Exercises tab."}
                  </p>
                ) : (
                  filteredExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer group"
                      onClick={() => addExercise(ex)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#1a1a2e] truncate">{getDisplayName(ex, DEFAULT_LOCALE)}</p>
                        <p className="text-xs text-[#6B7280] truncate">{getTranslated(ex, "muscle_group", DEFAULT_LOCALE) || getTranslated(ex, "equipment", DEFAULT_LOCALE) || ""}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        {ex.video_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setVideoModal({ open: true, url: ex.video_url!, title: getDisplayName(ex, DEFAULT_LOCALE) })
                            }}
                            className="p-1.5 rounded-lg text-[#7C3AED] hover:bg-[#F3F0FF]"
                            title="Video"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedExerciseInfo(ex)
                          }}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:bg-white"
                          title="Info"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <Plus className="w-4 h-4 text-[#10B981]" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Templates & workout list */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-2">My templates</h2>
            <p className="text-sm text-[#6B7280] mb-4">Load, edit or delete saved templates.</p>
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <select
                  className="w-full rounded-xl border border-[#E8E5F0] px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] appearance-none pr-10"
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (!id) return
                    const t = templates.find((x) => x.id === id)
                    if (t) loadTemplate(t)
                  }}
                >
                  <option value="">Load template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {getTranslated(t, "template_name", DEFAULT_LOCALE) || t.template_name}
                    </option>
                  ))}
                </select>
                <FolderOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={resetNew}
                className="p-2.5 rounded-xl border border-[#E8E5F0] text-[#6B7280] hover:bg-[#F8F7FF]"
                title="New template"
              >
                <FilePlus className="w-5 h-5" />
              </button>
            </div>
            {templates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="inline-flex items-center gap-1 bg-[#F8F7FF] rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium text-[#1a1a2e]">{getTranslated(t, "template_name", DEFAULT_LOCALE) || t.template_name}</span>
                    <button
                      type="button"
                      onClick={() => loadTemplate(t, true)}
                      className="p-1 text-[#7C3AED] hover:bg-white rounded"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateToDelete(t)}
                      className="p-1 text-red-500 hover:bg-white rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workout list by part */}
          {workoutExercises.length > 0 && (
            <div className="space-y-6">
              {(["part_1_exercises", "part_2_exercises", "part_3_exercises"] as const).map(
                (partKey) =>
                  byPart[partKey].length > 0 && (
                    <div key={partKey} className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
                      <h3 className="text-base font-bold text-[#1a1a2e] mb-3">{PART_LABELS[partKey]}</h3>
                      <div className="space-y-4">
                        {byPart[partKey].map((ex) => (
                          <div
                            key={ex.key}
                            className="p-4 rounded-xl border border-[#E8E5F0] bg-[#F8F7FF] space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-[#1a1a2e]">{getWorkoutExerciseDisplayName(ex)}</p>
                                {ex.video_url && (
                                  <button
                                    type="button"
                                    onClick={() => setVideoModal({ open: true, url: ex.video_url!, title: getWorkoutExerciseDisplayName(ex) })}
                                    className="p-1 text-[#7C3AED] rounded hover:bg-white"
                                  >
                                    <Video className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExercise(ex.key)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-[#6B7280] mb-1">Part</label>
                                <select
                                  value={ex.part}
                                  onChange={(e) => setExerciseField(ex.key, "part", e.target.value)}
                                  className="w-full rounded-lg border border-[#E8E5F0] px-2 py-1.5 text-sm"
                                >
                                  <option value="part_1_exercises">Part 1</option>
                                  <option value="part_2_exercises">Part 2</option>
                                  <option value="part_3_exercises">Part 3</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#6B7280] mb-1">Sets</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={ex.suggested_sets}
                                  onChange={(e) => setExerciseField(ex.key, "suggested_sets", parseInt(e.target.value, 10) || 1)}
                                  className="w-full rounded-lg border border-[#E8E5F0] px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#6B7280] mb-1">Reps</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={ex.suggested_reps}
                                  onChange={(e) => setExerciseField(ex.key, "suggested_reps", parseInt(e.target.value, 10) || 0)}
                                  className="w-full rounded-lg border border-[#E8E5F0] px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#6B7280] mb-1">Weight (kg)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  value={ex.suggested_weight}
                                  onChange={(e) => setExerciseField(ex.key, "suggested_weight", parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-[#E8E5F0] px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#6B7280] mb-1">Duration (s)</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={ex.suggested_duration}
                                  onChange={(e) => setExerciseField(ex.key, "suggested_duration", parseInt(e.target.value, 10) || 0)}
                                  className="w-full rounded-lg border border-[#E8E5F0] px-2 py-1.5 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">Save template</h2>
            <p className="text-sm text-[#6B7280] mb-4">The workout title above is used as the template name.</p>
            <button
              type="button"
              onClick={saveTemplate}
              disabled={isSaving || !workoutTitle.trim() || workoutExercises.length === 0}
              className="flex items-center gap-2 bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingTemplate ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Exercise info modal */}
      {selectedExerciseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedExerciseInfo(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-1">{selectedExerciseInfo ? getDisplayName(selectedExerciseInfo, DEFAULT_LOCALE) : ""}</h3>
            <p className="text-sm text-[#6B7280] mb-4">{selectedExerciseInfo ? (getTranslated(selectedExerciseInfo, "muscle_group", DEFAULT_LOCALE) || getTranslated(selectedExerciseInfo, "equipment", DEFAULT_LOCALE) || "") : ""}</p>
            {selectedExerciseInfo?.description && (
              <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap mb-4">{getTranslated(selectedExerciseInfo, "description", DEFAULT_LOCALE) || selectedExerciseInfo.description}</p>
            )}
            <button
              type="button"
              onClick={() => setSelectedExerciseInfo(null)}
              className="w-full py-2.5 rounded-xl border border-[#E8E5F0] font-medium hover:bg-[#F8F7FF]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setTemplateToDelete(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">Delete template?</h3>
            <p className="text-sm text-[#6B7280] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setTemplateToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] font-medium">
                Cancel
              </button>
              <button type="button" onClick={deleteTemplate} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video modal */}
      {videoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setVideoModal((v) => ({ ...v, open: false }))}>
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[#E8E5F0] flex justify-between items-center">
              <span className="font-semibold text-[#1a1a2e]">{videoModal.title}</span>
              <button type="button" onClick={() => setVideoModal((v) => ({ ...v, open: false }))} className="p-2 rounded-lg hover:bg-[#F8F7FF]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video src={videoModal.url} controls className="w-full h-full" />
            </div>
          </div>
        </div>
      )}

      {/* Create with AI modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !aiLoading && setAiModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Create with AI
            </h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Describe the workout you want (e.g. &quot;30 min leg day with squats and lunges&quot;, &quot;Upper body push: bench, shoulder press, triceps&quot;). AI will pick exercises from your library and fill sets, reps, and parts.
            </p>
            <textarea
              placeholder="E.g. Leg day: squats 3x10, lunges 3x12 each leg, calf raises 3x15. Focus on form."
              value={aiPrompt}
              onChange={(e) => { setAiPrompt(e.target.value); setAiError(null) }}
              rows={4}
              className="w-full rounded-xl border border-[#E8E5F0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none mb-3"
              disabled={aiLoading}
            />
            {aiError && <p className="text-sm text-red-600 mb-3">{aiError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !aiLoading && setAiModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E5F0] font-medium hover:bg-[#F8F7FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={generateWithAi}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7C3AED] text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {aiLoading ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

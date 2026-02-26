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

type SearchType = "name" | "bodyPart" | "equipment"

interface SavedExercise {
  id: string
  name: string
  muscle_group: string | null
  equipment: string | null
  exercisedb_gif_url: string | null
  exercisedb_image_url: string | null
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
        .select("id, name, muscle_group, equipment, exercisedb_gif_url, exercisedb_image_url")
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
    try {
      const row = mapToExerciseDefinition(exercise)
      const { error } = await getSupabase().from("exercise_definitions").insert({
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
      })
      if (error) throw new Error(error.message ?? "Failed to save exercise")
      setSavedId(idStr)
      setTimeout(() => setSavedId(null), 2000)
      setMyLibrary((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: row.name,
          muscle_group: row.muscle_group,
          equipment: row.equipment,
          exercisedb_gif_url: row.exercisedb_gif_url || null,
          exercisedb_image_url: row.exercisedb_image_url || null,
        },
      ])
    } catch (err) {
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] flex items-center gap-2">
          <Dumbbell className="w-8 h-8 text-[#7C3AED]" />
          Exercise Library
        </h1>
        <p className="text-[#6B7280] mt-1">
          Search 11,000+ exercises from ExerciseDB. Save favorites to your library (Supabase).
        </p>
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
                ex.exercisedb_gif_url || ex.exercisedb_image_url || null
              return (
                <div
                  key={ex.id}
                  className="rounded-xl border border-[#E8E5F0] bg-[#F8F7FF] overflow-hidden flex flex-col shadow-sm"
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
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
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

/**
 * ExerciseDB API Client (English only)
 * In the browser we proxy via Next.js API to avoid CORS; on the server we call APIs directly.
 */

const RAPIDAPI_BASE_URL = "https://exercisedb.p.rapidapi.com"
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com"
const FALLBACK_BASE_URL = "https://v2.exercisedb.dev"

const IS_BROWSER = typeof window !== "undefined"

function getApiKey(): string | undefined {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_EXERCISEDB_RAPIDAPI_KEY) {
    return process.env.NEXT_PUBLIC_EXERCISEDB_RAPIDAPI_KEY
  }
  return undefined
}

/** Call our Next.js API proxy (no CORS). Used in the browser. */
async function proxyRequest<T>(payload: {
  action: string
  query?: string
  bodyPart?: string
  equipment?: string
  target?: string
  id?: string
  limit?: number
}): Promise<T> {
  const res = await fetch("/api/exercisedb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
  return res.json()
}

async function makeRapidAPIRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error("RapidAPI key not configured (NEXT_PUBLIC_EXERCISEDB_RAPIDAPI_KEY)")

  const url = `${RAPIDAPI_BASE_URL}${endpoint}`
  const headers: HeadersInit = {
    "x-rapidapi-host": RAPIDAPI_HOST,
    "x-rapidapi-key": apiKey,
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) throw new Error(`RapidAPI error: ${res.status} ${res.statusText}`)
  return res.json()
}

async function makeFallbackRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${FALLBACK_BASE_URL}${endpoint}`
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`Fallback API error: ${res.status} ${res.statusText}`)
  return res.json()
}

async function makeRequest<T>(
  rapidAPIEndpoint: string,
  fallbackEndpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    return await makeRapidAPIRequest<T>(rapidAPIEndpoint, options)
  } catch (err) {
    console.warn("RapidAPI request failed, trying fallback:", (err as Error).message)
    try {
      return await makeFallbackRequest<T>(fallbackEndpoint, options)
    } catch (fallbackErr) {
      throw new Error(
        `ExerciseDB API error: Both RapidAPI and fallback failed. ${(fallbackErr as Error).message}`
      )
    }
  }
}

function normalizeArray<T>(response: unknown): T[] {
  let arr: unknown[] = []
  if (response && typeof response === "object" && "success" in response && "data" in response) {
    const data = (response as { data: unknown }).data
    arr = Array.isArray(data) ? data : []
  } else if (Array.isArray(response)) {
    arr = response
  }
  return arr.map((item) => normalizeExerciseItem(item) as T)
}

/** Map API response item to ExerciseDBItem; supports snake_case (gif_url, image_url, body_part, etc.) */
function normalizeExerciseItem(raw: unknown): ExerciseDBItem {
  if (!raw || typeof raw !== "object") {
    return { name: "Unknown" }
  }
  const o = raw as Record<string, unknown>
  const name = (o.name ?? o.exerciseName ?? "Unknown") as string
  const id = o.id ?? o.exerciseId ?? o.exercise_id
  const gifUrl = o.gifUrl ?? o.gif_url ?? o.gif
  const imageUrl = o.imageUrl ?? o.image_url ?? o.image
  const bodyPart = o.bodyPart ?? o.body_part
  const bodyParts = o.bodyParts ?? o.body_parts
  const equipment = o.equipment
  const equipments = o.equipments ?? o.equipment_list
  return {
    ...(o as ExerciseDBItem),
    name: String(name),
    id: id != null ? String(id) : undefined,
    exerciseId: id != null ? String(id) : undefined,
    gifUrl: gifUrl != null ? String(gifUrl) : undefined,
    gif: gifUrl != null ? String(gifUrl) : (o.gif as string | undefined),
    imageUrl: imageUrl != null ? String(imageUrl) : undefined,
    image: imageUrl != null ? String(imageUrl) : (o.image as string | undefined),
    bodyPart: bodyPart != null ? String(bodyPart) : undefined,
    bodyParts: Array.isArray(bodyParts) ? bodyParts.map(String) : undefined,
    equipments: Array.isArray(equipments) ? equipments.map(String) : undefined,
  }
}

export interface ExerciseDBItem {
  id?: string
  exerciseId?: string
  name: string
  bodyPart?: string
  bodyParts?: string[]
  equipment?: string
  equipments?: string[]
  target?: string
  targetMuscles?: string[]
  secondaryMuscles?: string[]
  secondary?: string[]
  gifUrl?: string
  gif?: string
  imageUrl?: string
  image?: string
  videoUrl?: string
  video?: string
  instructions?: string[]
  exerciseType?: string
  type?: string
  overview?: string
  description?: string
  exerciseTips?: string[]
  variations?: string[]
  relatedExerciseIds?: string[]
  related?: string[]
}

export async function searchExercises(query: string, limit = 20): Promise<ExerciseDBItem[]> {
  if (IS_BROWSER) {
    const response = await proxyRequest<unknown>({ action: "search", query, limit })
    return normalizeArray<ExerciseDBItem>(response)
  }
  const rapidAPIEndpoint = `/exercises/name/${encodeURIComponent(query)}?limit=${limit}`
  const fallbackEndpoint = `/exercises?name=${encodeURIComponent(query)}&limit=${limit}`
  const response = await makeRequest<unknown>(rapidAPIEndpoint, fallbackEndpoint)
  return normalizeArray<ExerciseDBItem>(response)
}

export async function getExerciseById(exerciseId: string): Promise<ExerciseDBItem> {
  if (IS_BROWSER) {
    return proxyRequest<ExerciseDBItem>({ action: "byId", id: exerciseId })
  }
  const rapidAPIEndpoint = `/exercises/${exerciseId}`
  const fallbackEndpoint = `/exercises/${exerciseId}`
  return makeRequest<ExerciseDBItem>(rapidAPIEndpoint, fallbackEndpoint)
}

export async function getExercisesByBodyPart(bodyPart: string, limit = 20): Promise<ExerciseDBItem[]> {
  if (IS_BROWSER) {
    const response = await proxyRequest<unknown>({ action: "bodyPart", bodyPart, limit })
    return normalizeArray<ExerciseDBItem>(response)
  }
  const normalized = bodyPart.toUpperCase()
  const rapidAPIEndpoint = `/exercises/bodyPart/${encodeURIComponent(normalized)}?limit=${limit}`
  const fallbackEndpoint = `/exercises/bodyPart/${encodeURIComponent(normalized)}?limit=${limit}`
  const response = await makeRequest<unknown>(rapidAPIEndpoint, fallbackEndpoint)
  return normalizeArray<ExerciseDBItem>(response)
}

export async function getExercisesByEquipment(
  equipment: string,
  limit = 20
): Promise<ExerciseDBItem[]> {
  if (IS_BROWSER) {
    const response = await proxyRequest<unknown>({ action: "equipment", equipment, limit })
    return normalizeArray<ExerciseDBItem>(response)
  }
  const normalized = equipment.toUpperCase()
  const rapidAPIEndpoint = `/exercises/equipment/${encodeURIComponent(normalized)}?limit=${limit}`
  const fallbackEndpoint = `/exercises/equipment/${encodeURIComponent(normalized)}?limit=${limit}`
  const response = await makeRequest<unknown>(rapidAPIEndpoint, fallbackEndpoint)
  return normalizeArray<ExerciseDBItem>(response)
}

export async function getExercisesByTarget(target: string, limit = 20): Promise<ExerciseDBItem[]> {
  if (IS_BROWSER) {
    const response = await proxyRequest<unknown>({ action: "target", target, limit })
    return normalizeArray<ExerciseDBItem>(response)
  }
  const rapidAPIEndpoint = `/exercises/target/${encodeURIComponent(target)}?limit=${limit}`
  const fallbackEndpoint = `/exercises/target/${encodeURIComponent(target)}?limit=${limit}`
  const response = await makeRequest<unknown>(rapidAPIEndpoint, fallbackEndpoint)
  return normalizeArray<ExerciseDBItem>(response)
}

const BODY_PARTS_ENGLISH = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "BICEPS",
  "TRICEPS",
  "FOREARMS",
  "CORE",
  "ABS",
  "GLUTES",
  "CALVES",
  "QUADRICEPS",
  "HAMSTRINGS",
  "LATS",
  "TRAPS",
  "CARDIO",
  "FULL BODY",
  "NECK",
  "ADDUCTORS",
  "ABDUCTORS",
]

const EQUIPMENT_ENGLISH = [
  "BODYWEIGHT",
  "DUMBBELL",
  "BARBELL",
  "KETTLEBELL",
  "MACHINE",
  "CABLE",
  "RESISTANCE BAND",
  "MEDICINE BALL",
  "TRX",
  "BOX",
  "PULL-UP BAR",
  "ROWER",
  "BIKE",
  "TREADMILL",
  "SLED",
  "RINGS",
  "E-Z BAR",
  "SMITH MACHINE",
  "LEVERAGE MACHINE",
  "OLYMPIC BARBELL",
  "BAND",
  "ASSISTED",
  "BOSU BALL",
  "STABILITY BALL",
]

export async function getBodyPartsEnglish(): Promise<string[]> {
  return [...BODY_PARTS_ENGLISH]
}

export async function getEquipmentListEnglish(): Promise<string[]> {
  return [...EQUIPMENT_ENGLISH]
}

/** Resolve media URL for display (GIF preferred for animation, then image) */
export function getExerciseMediaUrl(exercise: ExerciseDBItem): string | null {
  if (exercise.gifUrl) {
    return exercise.gifUrl.startsWith("http")
      ? exercise.gifUrl
      : `https://v2.exercisedb.dev/gifs/${exercise.gifUrl}`
  }
  if (exercise.gif) {
    return exercise.gif.startsWith("http") ? exercise.gif : `https://v2.exercisedb.dev/gifs/${exercise.gif}`
  }
  if (exercise.imageUrl) {
    return exercise.imageUrl.startsWith("http")
      ? exercise.imageUrl
      : `https://cdn.exercisedb.dev/images/${exercise.imageUrl}`
  }
  if (exercise.image) {
    return exercise.image.startsWith("http")
      ? exercise.image
      : `https://cdn.exercisedb.dev/images/${exercise.image}`
  }
  // Fallback: some list APIs omit media; try by exercise id (v2 and cdn patterns)
  const id = exercise.exerciseId ?? exercise.id
  if (id) {
    const idStr = String(id)
    return `https://v2.exercisedb.dev/gifs/${idStr}`
  }
  return null
}

/** Resolve video URL */
export function getExerciseVideoUrl(exercise: ExerciseDBItem): string | null {
  if (exercise.videoUrl) {
    return exercise.videoUrl.startsWith("http")
      ? exercise.videoUrl
      : `https://cdn.exercisedb.dev/videos/${exercise.videoUrl}`
  }
  if (exercise.video) {
    return exercise.video.startsWith("http")
      ? exercise.video
      : `https://cdn.exercisedb.dev/videos/${exercise.video}`
  }
  return null
}

/** Map ExerciseDB item to shape suitable for Supabase exercise_definitions (English only) */
export function mapToExerciseDefinition(exercise: ExerciseDBItem) {
  const id = exercise.exerciseId ?? exercise.id ?? ""
  const idStr = id !== "" && id != null ? String(id) : ""

  let imageUrl = ""
  if (exercise.imageUrl) {
    imageUrl = exercise.imageUrl.startsWith("http")
      ? exercise.imageUrl
      : `https://cdn.exercisedb.dev/images/${exercise.imageUrl}`
  } else if (exercise.image) {
    imageUrl = exercise.image.startsWith("http")
      ? exercise.image
      : `https://v2.exercisedb.dev/images/${exercise.image}`
  }

  let gifUrl = getExerciseMediaUrl(exercise) || ""
  let videoUrl = getExerciseVideoUrl(exercise) || ""

  const primaryBodyPart = (
    exercise.bodyParts?.[0] ?? exercise.bodyPart ?? ""
  ).toUpperCase()
  const primaryEquipment = (
    exercise.equipments?.[0] ?? exercise.equipment ?? "BODYWEIGHT"
  ).toUpperCase()

  const categoryMap: Record<string, string> = {
    STRENGTH: "Strength",
    CARDIO: "Cardio",
    STRETCHING: "Mobility",
    POWERLIFTING: "Strength",
    OLYMPIC_WEIGHTLIFTING: "Olympic Weightlifting",
    STRONGMAN: "Strength",
    PLYOMETRICS: "Functional",
  }
  const exerciseType = (exercise.exerciseType ?? exercise.type ?? "STRENGTH").toUpperCase()
  const category = categoryMap[exerciseType] ?? "Strength"

  const descriptionParts: string[] = []
  if (exercise.overview) descriptionParts.push(exercise.overview)
  if (exercise.description) descriptionParts.push(exercise.description)
  if (
    Array.isArray(exercise.instructions) &&
    exercise.instructions.length > 0
  ) {
    descriptionParts.push(
      "\n\nInstructions:\n" +
        exercise.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")
    )
  }
  if (
    Array.isArray(exercise.exerciseTips) &&
    exercise.exerciseTips.length > 0
  ) {
    descriptionParts.push(
      "\n\nTips:\n" + exercise.exerciseTips.map((t) => `• ${t}`).join("\n")
    )
  }

  const targetMuscles = exercise.targetMuscles ?? exercise.target ?? []
  const secondaryMuscles = exercise.secondaryMuscles ?? exercise.secondary ?? []

  return {
    name: exercise.name || "Unknown",
    muscle_group: primaryBodyPart || "FULL BODY",
    category,
    equipment: primaryEquipment,
    description: descriptionParts.join("") || exercise.name || "",
    video_url: videoUrl,
    exercisedb_id: idStr || id,
    exercisedb_image_url: imageUrl,
    exercisedb_gif_url: gifUrl,
    exercisedb_target_muscles: Array.isArray(targetMuscles) ? targetMuscles : [],
    exercisedb_secondary_muscles: Array.isArray(secondaryMuscles) ? secondaryMuscles : [],
    exercisedb_variations: exercise.variations ?? [],
    exercisedb_related_exercises: exercise.relatedExerciseIds ?? exercise.related ?? [],
  }
}

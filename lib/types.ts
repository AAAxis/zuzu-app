export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  weight_kg: number
  height_cm: number
  bmr: number
  daily_steps: number
  goal: string | null
  created_at: string
  updated_at: string
}

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  media_type: "photo" | "video"
  media_url: string
  thumbnail_url: string | null
  category: string
  created_at: string
}

export const GALLERY_CATEGORIES = [
  "All",
  "Strength",
  "Cardio",
  "Yoga",
  "HIIT",
  "Stretching",
  "Functional",
  "Other",
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]

"use client"

import { useState } from "react"
import { Dumbbell } from "lucide-react"

interface ExerciseMediaProps {
  src: string | null
  alt: string
  className?: string
  /** Box size for thumbnail (e.g. "w-20 h-20"). When provided, placeholder/skeleton match this. */
  boxClassName?: string
  /** Use object-contain for modal demo, object-cover for list thumbnails */
  objectFit?: "cover" | "contain"
}

export function ExerciseMedia({
  src,
  alt,
  className = "",
  boxClassName = "w-full h-full",
  objectFit = "cover",
}: ExerciseMediaProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src) {
    return (
      <div
        className={`${boxClassName} flex items-center justify-center bg-[#E8E5F0] text-[#6B7280] ${className}`}
      >
        <Dumbbell className="w-6 h-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`${boxClassName} flex items-center justify-center bg-[#E8E5F0] text-[#6B7280] text-xs ${className}`}
      >
        <Dumbbell className="w-6 h-6" />
      </div>
    )
  }

  return (
    <div className={`${boxClassName} relative bg-[#E8E5F0] ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-[#E8E5F0]"
          aria-hidden
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => {
          setLoaded(true)
          setError(false)
        }}
        onError={() => setError(true)}
        className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
      />
    </div>
  )
}

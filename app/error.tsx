"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  // Avoid displaying [object Event] or [object Object]
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message
  }
  return "Something went wrong. Please try again."
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message = getErrorMessage(error)

  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--light)] to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Something went wrong</h1>
        <p className="text-[#6B7280] mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full font-semibold border border-[var(--border)] text-[#1a1a2e] hover:bg-[var(--card)] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}

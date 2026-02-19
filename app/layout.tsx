import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ZUZU — Your Personal Fitness Coach",
  description: "AI-powered fitness training app. Personalized workouts, progress tracking, and real-time coaching. Train smarter, get stronger.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">{children}</body>
    </html>
  )
}

"use client"

import { useEffect } from "react"

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl")
    document.documentElement.setAttribute("lang", "he")
    return () => {
      document.documentElement.setAttribute("dir", "ltr")
      document.documentElement.setAttribute("lang", "en")
    }
  }, [])

  return <div dir="rtl" className="min-h-screen">{children}</div>
}

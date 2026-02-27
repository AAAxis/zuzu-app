"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? ""
  const isEn = pathname.startsWith("/en")

  useEffect(() => {
    if (isEn) {
      document.documentElement.setAttribute("dir", "ltr")
      document.documentElement.setAttribute("lang", "en")
    } else {
      document.documentElement.setAttribute("dir", "rtl")
      document.documentElement.setAttribute("lang", "he")
    }
    return () => {
      document.documentElement.setAttribute("dir", "ltr")
      document.documentElement.setAttribute("lang", "en")
    }
  }, [isEn])

  return (
    <div dir={isEn ? "ltr" : "rtl"} className="min-h-screen">
      {children}
    </div>
  )
}

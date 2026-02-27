"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Renders a link to switch between Hebrew (/) and English (/en).
 * Use in nav or footer. Default locale = Hebrew at /.
 */
export function LanguageSwitcher() {
  const pathname = usePathname() ?? ""
  const isEn = pathname.startsWith("/en")

  if (isEn) {
    const hePath = pathname.replace(/^\/en/, "") || "/"
    return (
      <Link
        href={hePath}
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        עברית
      </Link>
    )
  }

  const enPath = pathname === "/" ? "/en" : `/en${pathname}`
  return (
    <Link
      href={enPath}
      className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      English
    </Link>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

const LOCALES = [
  { code: "he", label: "עברית", flag: "🇮🇱", getHref: (pathname: string) => (pathname.replace(/^\/en/, "") || "/") },
  { code: "en", label: "English", flag: "🇺🇸", getHref: (pathname: string) => (pathname === "/" ? "/en" : `/en${pathname}`) },
] as const

/**
 * Dropdown language switcher with flags. Use only in top nav.
 */
export function LanguageSwitcher() {
  const pathname = usePathname() ?? ""
  const isEn = pathname.startsWith("/en")
  const current = isEn ? LOCALES[1] : LOCALES[0]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors border border-transparent hover:border-[var(--border)]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span className="text-lg leading-none" aria-hidden>{current.flag}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full end-0 mt-1 min-w-[10rem] py-1 bg-white border border-[var(--border)] rounded-xl shadow-lg z-[100]"
          aria-label="Language options"
        >
          {LOCALES.map((loc) => {
            const href = loc.getHref(pathname)
            const isCurrent = (loc.code === "en" && isEn) || (loc.code === "he" && !isEn)
            return (
              <li key={loc.code} role="option" aria-selected={isCurrent}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isCurrent ? "bg-[var(--light)] text-[var(--primary)] font-medium" : "text-[var(--foreground)] hover:bg-[var(--light)]"}`}
                >
                  <span className="text-lg leading-none">{loc.flag}</span>
                  {loc.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

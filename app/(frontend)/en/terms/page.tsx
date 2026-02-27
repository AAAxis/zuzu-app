import Link from "next/link"
import { en } from "@/lib/messages-en"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function EnTermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <Link href="/en" className="text-sm text-[var(--primary)] hover:underline">{en.backToZuzu}</Link>
          <LanguageSwitcher />
        </div>
        <h1 className="text-4xl font-bold mb-8">{en.termsTitle}</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-[var(--muted)]">
          <p><strong>{en.lastUpdated}</strong> February 2026</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.terms1Title}</h2>
          <p>{en.terms1Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.terms2Title}</h2>
          <p>{en.terms2Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.terms3Title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{en.terms3Li1}</li>
            <li>{en.terms3Li2}</li>
            <li>{en.terms3Li3}</li>
          </ul>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.terms4Title}</h2>
          <p>{en.terms4Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.terms5Title}</h2>
          <p>{en.terms5Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.terms6Title}</h2>
          <p>{en.terms6Text}<a href="mailto:dima@holylabs.net" className="text-[var(--primary)] hover:underline">dima@holylabs.net</a></p>
        </div>
      </div>
    </main>
  )
}

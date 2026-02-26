import Link from "next/link"
import { he } from "@/lib/messages-he"

export default function Terms() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">{he.backToZuzu}</Link>
        <h1 className="text-4xl font-bold mb-8">{he.termsTitle}</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-[var(--muted)]">
          <p><strong>{he.lastUpdated}</strong> פברואר 2026</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.terms1Title}</h2>
          <p>{he.terms1Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.terms2Title}</h2>
          <p>{he.terms2Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.terms3Title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{he.terms3Li1}</li>
            <li>{he.terms3Li2}</li>
            <li>{he.terms3Li3}</li>
          </ul>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.terms4Title}</h2>
          <p>{he.terms4Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.terms5Title}</h2>
          <p>{he.terms5Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.terms6Title}</h2>
          <p>{he.terms6Text}<a href="mailto:dima@holylabs.net" className="text-[var(--primary)] hover:underline">dima@holylabs.net</a></p>
        </div>
      </div>
    </main>
  )
}

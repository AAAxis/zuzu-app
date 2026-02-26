import Link from "next/link"
import { he } from "@/lib/messages-he"

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">{he.backToZuzu}</Link>
        <h1 className="text-4xl font-bold mb-8">{he.privacyTitle}</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-[var(--muted)]">
          <p><strong>{he.lastUpdated}</strong> פברואר 2026</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.privacy1Title}</h2>
          <p>{he.privacy1Text}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{he.privacy1Li1}</li>
            <li>{he.privacy1Li2}</li>
            <li>{he.privacy1Li3}</li>
            <li>{he.privacy1Li4}</li>
          </ul>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.privacy2Title}</h2>
          <p>{he.privacy2Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.privacy3Title}</h2>
          <p>{he.privacy3Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.privacy4Title}</h2>
          <p>{he.privacy4Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.privacy5Title}</h2>
          <p>{he.privacy5Text}<Link href="/delete-data" className="text-[var(--primary)] hover:underline">{he.privacy5Link}</Link>{he.privacy5Text2}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{he.privacy6Title}</h2>
          <p>{he.privacy6Text}<a href="mailto:dima@holylabs.net" className="text-[var(--primary)] hover:underline">dima@holylabs.net</a></p>
        </div>
      </div>
    </main>
  )
}

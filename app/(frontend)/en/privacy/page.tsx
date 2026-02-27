import Link from "next/link"
import { en } from "@/lib/messages-en"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function EnPrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <Link href="/en" className="text-sm text-[var(--primary)] hover:underline">{en.backToZuzu}</Link>
          <LanguageSwitcher />
        </div>
        <h1 className="text-4xl font-bold mb-8">{en.privacyTitle}</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-[var(--muted)]">
          <p><strong>{en.lastUpdated}</strong> February 2026</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.privacy1Title}</h2>
          <p>{en.privacy1Text}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{en.privacy1Li1}</li>
            <li>{en.privacy1Li2}</li>
            <li>{en.privacy1Li3}</li>
            <li>{en.privacy1Li4}</li>
          </ul>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.privacy2Title}</h2>
          <p>{en.privacy2Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.privacy3Title}</h2>
          <p>{en.privacy3Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.privacy4Title}</h2>
          <p>{en.privacy4Text}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.privacy5Title}</h2>
          <p>{en.privacy5Text}<Link href="/en/delete-data" className="text-[var(--primary)] hover:underline">{en.privacy5Link}</Link>{en.privacy5Text2}</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{en.privacy6Title}</h2>
          <p>{en.privacy6Text}<a href="mailto:dima@holylabs.net" className="text-[var(--primary)] hover:underline">dima@holylabs.net</a></p>
        </div>
      </div>
    </main>
  )
}

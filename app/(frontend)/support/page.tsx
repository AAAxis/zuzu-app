import Link from "next/link"
import { he } from "@/lib/messages-he"

export default function Support() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">{he.backToZuzu}</Link>
        <h1 className="text-4xl font-bold mb-4">{he.supportTitle}</h1>
        <p className="text-[var(--muted)] mb-10">{he.supportSubtitle}</p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">📧 {he.emailSupport}</h3>
            <p className="text-sm text-[var(--muted)] mb-3">{he.emailSupportDesc}</p>
            <a href="mailto:dima@holylabs.net" className="text-[var(--primary)] font-medium hover:underline">dima@holylabs.net</a>
          </div>
          <div className="border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">💬 {he.telegram}</h3>
            <p className="text-sm text-[var(--muted)] mb-3">{he.telegramDesc}</p>
            <a href="https://t.me/polskoydm" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium hover:underline">@polskoydm</a>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">{he.faqTitle}</h2>
        <div className="space-y-4">
          {[
            { q: he.faq1Q, a: he.faq1A },
            { q: he.faq2Q, a: he.faq2A },
            { q: he.faq3Q, a: he.faq3A },
            { q: he.faq4Q, a: he.faq4A },
            { q: he.faq5Q, a: he.faq5A },
          ].map((faq, i) => (
            <div key={i} className="border border-[var(--border)] rounded-2xl p-5">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-[var(--muted)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

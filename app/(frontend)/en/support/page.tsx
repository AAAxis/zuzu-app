"use client"

import { useState } from "react"
import Link from "next/link"
import { en } from "@/lib/messages-en"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Loader2, CheckCircle } from "lucide-react"

export default function EnSupportPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("contact")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError("Please enter your email address"); return }
    if (!message.trim()) { setError("Please enter a message"); return }
    setSubmitting(true)
    setError("")
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name: "", email: email.trim(), subject: "", message: message.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Failed to submit. Please try again.")
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <Link href="/en" className="text-sm text-[var(--primary)] hover:underline">{en.backToZuzu}</Link>
          <LanguageSwitcher />
        </div>
        <h1 className="text-4xl font-bold mb-4">{en.supportTitle}</h1>
        <p className="text-[var(--muted)] mb-10">{en.supportSubtitle}</p>

        <h2 className="text-2xl font-bold mb-6">{en.faqTitle}</h2>
        <div className="space-y-4 mb-12">
          {[
            { q: en.faq1Q, a: en.faq1A },
            { q: en.faq2Q, a: en.faq2A },
            { q: en.faq3Q, a: en.faq3A },
          ].map((faq, i) => (
            <div key={i} className="border border-[var(--border)] rounded-2xl p-5">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-[var(--muted)]">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">{en.emailSupport}</h3>
            <p className="text-sm text-[var(--muted)] mb-3">{en.emailSupportDesc}</p>
            <a href="mailto:dima@holylabs.net" className="text-[var(--primary)] font-medium hover:underline">dima@holylabs.net</a>
          </div>
          <div className="border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">{en.telegram}</h3>
            <p className="text-sm text-[var(--muted)] mb-3">{en.telegramDesc}</p>
            <a href="https://t.me/polskoydm" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium hover:underline">@polskoydm</a>
          </div>
        </div>

        <div className="border border-[var(--border)] rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">{en.supportContactTitle}</h2>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{en.supportSuccessTitle}</h3>
              <p className="text-[var(--muted)] text-sm">{en.supportSuccessText}</p>
              <button onClick={() => { setSubmitted(false); setEmail(""); setMessage(""); setType("contact") }} className="mt-4 text-[var(--primary)] font-medium hover:underline text-sm">{en.supportSendAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{en.supportTypeLabel}</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-sm">
                  <option value="contact">{en.supportTypeGeneral}</option>
                  <option value="bug_report">{en.supportTypeBug}</option>
                  <option value="feature_request">{en.supportTypeFeature}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{en.email} <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={en.emailPlaceholder} required className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{en.supportMessageLabel} <span className="text-red-500">*</span></label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={en.supportMessagePlaceholder} required rows={5} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-y" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={submitting} className="w-full bg-[var(--primary)] text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? en.supportSending : en.supportSend}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { en } from "@/lib/messages-en"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Loader2 } from "lucide-react"

export default function EnDeleteDataPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }
    setSubmitting(true)
    setError("")
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "delete_request",
        email: email.trim(),
        subject: "Account & Data Deletion Request",
        message: `User requests complete deletion of account and all associated data for email: ${email.trim()}`,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Submission failed. Please try again.")
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <Link href="/en" className="text-sm text-[var(--primary)] hover:underline">{en.backToZuzu}</Link>
          <LanguageSwitcher />
        </div>
        <h1 className="text-4xl font-bold mb-4">{en.deleteTitle}</h1>
        <p className="text-[var(--muted)] mb-8">{en.deleteSubtitle}</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg mb-2">{en.requestReceived}</p>
            <p className="text-green-600 text-sm">{en.deleteConfirm}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{en.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={en.emailPlaceholderShort}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Sending..." : en.requestDeletion}
            </button>
            <p className="text-xs text-[var(--muted)] text-center">{en.deleteWarning}</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-[var(--card)] rounded-2xl">
          <h3 className="font-semibold mb-3">{en.whatGetsDeleted}</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>{en.deleteLi1}</li>
            <li>{en.deleteLi2}</li>
            <li>{en.deleteLi3}</li>
            <li>{en.deleteLi4}</li>
            <li>{en.deleteLi5}</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

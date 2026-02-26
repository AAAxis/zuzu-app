"use client"

import { useState } from "react"
import Link from "next/link"
import { he } from "@/lib/messages-he"

export default function DeleteData() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">{he.backToZuzu}</Link>
        <h1 className="text-4xl font-bold mb-4">{he.deleteTitle}</h1>
        <p className="text-[var(--muted)] mb-8">{he.deleteSubtitle}</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg mb-2">{he.requestReceived}</p>
            <p className="text-green-600 text-sm">{he.deleteConfirm}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{he.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={he.emailPlaceholderShort}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => { if (email) setSubmitted(true) }}
              className="w-full bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
            >
              {he.requestDeletion}
            </button>
            <p className="text-xs text-[var(--muted)] text-center">{he.deleteWarning}</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-[var(--card)] rounded-2xl">
          <h3 className="font-semibold mb-3">{he.whatGetsDeleted}</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>• {he.deleteLi1}</li>
            <li>• {he.deleteLi2}</li>
            <li>• {he.deleteLi3}</li>
            <li>• {he.deleteLi4}</li>
            <li>• {he.deleteLi5}</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

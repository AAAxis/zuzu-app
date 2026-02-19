"use client"

import { useState } from "react"
import Link from "next/link"

export default function DeleteData() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">← Back to ZUZU</Link>
        <h1 className="text-4xl font-bold mb-4">Delete Your Data</h1>
        <p className="text-[var(--muted)] mb-8">We respect your privacy. Submit your email below and we will permanently delete all your data within 30 days.</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg mb-2">Request Received ✓</p>
            <p className="text-green-600 text-sm">We will process your deletion request and confirm via email within 30 days.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email address associated with your account</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => { if (email) setSubmitted(true) }}
              className="w-full bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
            >
              Request Data Deletion
            </button>
            <p className="text-xs text-[var(--muted)] text-center">This action is irreversible. All workout history, progress, and account data will be permanently removed.</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-[var(--card)] rounded-2xl">
          <h3 className="font-semibold mb-3">What gets deleted:</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>• Account profile and email</li>
            <li>• All workout history and progress data</li>
            <li>• Health metrics and goals</li>
            <li>• Achievement badges and streaks</li>
            <li>• Subscription data (billing handled by App Store/Google Play)</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

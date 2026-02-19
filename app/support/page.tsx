import Link from "next/link"

export default function Support() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">← Back to ZUZU</Link>
        <h1 className="text-4xl font-bold mb-4">Support</h1>
        <p className="text-[var(--muted)] mb-10">Need help? We're here for you.</p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">📧 Email Support</h3>
            <p className="text-sm text-[var(--muted)] mb-3">Get a response within 24 hours.</p>
            <a href="mailto:dima@holylabs.net" className="text-[var(--primary)] font-medium hover:underline">dima@holylabs.net</a>
          </div>
          <div className="border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">💬 Telegram</h3>
            <p className="text-sm text-[var(--muted)] mb-3">Quick questions? Chat with us.</p>
            <a href="https://t.me/polskoydm" target="_blank" className="text-[var(--primary)] font-medium hover:underline">@polskoydm</a>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "How do I cancel my subscription?", a: "Go to Settings in the app → Manage Subscription. Or manage through your App Store / Google Play subscriptions." },
            { q: "Can I use ZUZU without a subscription?", a: "Yes! The free plan includes basic workouts and progress tracking. Upgrade to Pro for AI coaching and unlimited access." },
            { q: "How do I delete my account?", a: "Visit our Delete Data page to submit a deletion request. All data will be removed within 30 days." },
            { q: "Is ZUZU suitable for beginners?", a: "Absolutely! ZUZU adapts to your fitness level. Whether you're just starting out or an experienced athlete, workouts are personalized for you." },
            { q: "Does ZUZU work offline?", a: "Yes, downloaded workout plans work offline. Progress syncs when you're back online." },
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

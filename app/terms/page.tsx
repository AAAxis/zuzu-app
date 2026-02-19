import Link from "next/link"

export default function Terms() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">← Back to ZUZU</Link>
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-[var(--muted)]">
          <p><strong>Last updated:</strong> February 2026</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">1. Acceptance of Terms</h2>
          <p>By using ZUZU, you agree to these Terms of Service. If you do not agree, please do not use the app.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">2. Service Description</h2>
          <p>ZUZU provides AI-powered fitness training, workout plans, progress tracking, and health insights. The app is not a substitute for professional medical advice.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 16 years old to use ZUZU</li>
            <li>Consult a physician before starting any exercise program</li>
            <li>You are responsible for maintaining your account security</li>
          </ul>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">4. Subscriptions & Payments</h2>
          <p>Pro subscriptions are billed through the App Store or Google Play. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">5. Limitation of Liability</h2>
          <p>ZUZU is provided "as is." We are not liable for any injuries or health issues resulting from workouts performed using the app.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">6. Contact</h2>
          <p>Questions? Email <a href="mailto:dima@holylabs.net" className="text-[var(--primary)] hover:underline">dima@holylabs.net</a></p>
        </div>
      </div>
    </main>
  )
}

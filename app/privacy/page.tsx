import Link from "next/link"

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">← Back to ZUZU</Link>
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-[var(--muted)]">
          <p><strong>Last updated:</strong> February 2026</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">1. Information We Collect</h2>
          <p>ZUZU collects the following information to provide our fitness training service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, name)</li>
            <li>Fitness data (workouts, progress, goals)</li>
            <li>Health metrics (if voluntarily provided)</li>
            <li>Device information and usage analytics</li>
          </ul>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">2. How We Use Your Data</h2>
          <p>We use your data to personalize workouts, track progress, improve the app experience, and provide customer support. We do not sell your personal data to third parties.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">3. Data Storage & Security</h2>
          <p>Your data is securely stored using industry-standard encryption. We use trusted cloud providers with SOC 2 compliance.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">4. Third-Party Services</h2>
          <p>We may use analytics tools (e.g., Firebase Analytics) to improve app performance. These services have their own privacy policies.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">5. Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data at any time. See our <Link href="/delete-data" className="text-[var(--primary)] hover:underline">Delete Data</Link> page.</p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">6. Contact</h2>
          <p>For privacy questions, contact us at <a href="mailto:dima@holylabs.net" className="text-[var(--primary)] hover:underline">dima@holylabs.net</a></p>
        </div>
      </div>
    </main>
  )
}

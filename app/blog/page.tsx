import Link from "next/link"

export default function Blog() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline mb-8 inline-block">← Back to ZUZU</Link>
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-[var(--muted)]">Coming soon — fitness tips, workout guides, and nutrition advice.</p>
      </div>
    </main>
  )
}

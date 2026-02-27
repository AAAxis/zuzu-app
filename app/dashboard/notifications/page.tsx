"use client"

import { useEffect, useState } from "react"
import { Bell, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function NotificationsDashboardPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    sent: number
    failed: number
    total: number
    message: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json().catch(() => ({}))
        if (res.ok && typeof data.count === "number") setTokenCount(data.count)
        else setTokenCount(0)
      } catch {
        setTokenCount(0)
      } finally {
        setLoadingCount(false)
      }
    }
    loadCount()
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() && !body.trim()) {
      setError("Enter a title and/or message body.")
      return
    }
    setError(null)
    setResult(null)
    setSending(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || undefined, body: body.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || res.statusText || "Failed to send")
        return
      }
      setResult({
        sent: data.sent ?? 0,
        failed: data.failed ?? 0,
        total: data.total ?? 0,
        message: data.message || "Sent.",
      })
      if (typeof data.count === "number") setTokenCount(data.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Push Notifications
        </h1>
        <p className="text-[#6B7280] mt-1">
          Send push notifications to all users who have the ZUZU app installed and have allowed notifications.
        </p>
      </div>

      {/* Token count */}
      <div className="bg-white rounded-2xl border border-[#E8E5F0] p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F3F0FF] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a2e]">
              {loadingCount ? "—" : tokenCount ?? 0}
            </p>
            <p className="text-sm text-[#6B7280]">
              Registered device{tokenCount === 1 ? "" : "s"} (app must be opened with notifications enabled)
            </p>
          </div>
        </div>
      </div>

      {/* Send form */}
      <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
        <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">Send notification</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New workout available"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E5F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#1a1a2e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Check out the new strength training plan."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E5F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#1a1a2e] resize-y"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {result && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {result.message}
            </div>
          )}
          <button
            type="submit"
            disabled={sending || (loadingCount ? false : (tokenCount ?? 0) === 0)}
            className="inline-flex items-center gap-2 bg-[#7C3AED] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to all devices
              </>
            )}
          </button>
        </form>
      </div>

      {/* App setup note */}
      <div className="bg-[#F8F7FF] border border-[#E8E5F0] rounded-2xl p-5 text-sm text-[#6B7280]">
        <p className="font-medium text-[#1a1a2e] mb-2">Expo app setup</p>
        <p className="mb-2">
          In your Expo app, request notification permissions and get the Expo push token, then register it with:
        </p>
        <code className="block bg-white rounded-lg p-3 text-xs text-[#1a1a2e] border border-[#E8E5F0] overflow-x-auto">
          POST /api/push-tokens<br />
          Body: &#123; &quot;expo_push_token&quot;: &quot;ExponentPushToken[xxx]&quot;, &quot;platform&quot;: &quot;ios&quot; | &quot;android&quot; &#125;
        </code>
        <p className="mt-2">
          Use the same auth session (e.g. Supabase user) so the token is tied to the logged-in user.
        </p>
      </div>
    </div>
  )
}

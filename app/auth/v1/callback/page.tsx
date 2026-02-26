"use client"

import { useEffect, useState, useRef } from "react"
import { getSupabase } from "@/lib/supabase"
import { Dumbbell, CheckCircle, XCircle, Loader2, Lock } from "lucide-react"
import Link from "next/link"

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "reset-password">("loading")
  const [message, setMessage] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updating, setUpdating] = useState(false)
  const [isInvite, setIsInvite] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function handleCallback() {
      try {
        // Supabase redirects with tokens in the hash fragment
        const hash = window.location.hash.substring(1)
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        const type = hashParams.get("type")

        if (accessToken && refreshToken) {
          const { error } = await getSupabase().auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            setStatus("error")
            setMessage(error.message)
            return
          }

          if (type === "invite") {
            setIsInvite(true)
            setStatus("reset-password")
            return
          }

          if (type === "recovery") {
            setStatus("reset-password")
            return
          }

          if (type === "signup" || type === "email") {
            setStatus("success")
            setMessage("Your email has been confirmed! You can now use the app.")
            return
          }

          setStatus("success")
          setMessage("Authentication successful!")
          return
        }

        // If no hash tokens, try to exchange via URL (Supabase might handle it)
        const { data, error } = await getSupabase().auth.getSession()

        if (data?.session) {
          const url = new URL(window.location.href)
          const urlType = url.searchParams.get("type")

          if (urlType === "invite") {
            setIsInvite(true)
            setStatus("reset-password")
            return
          }

          if (urlType === "recovery") {
            setStatus("reset-password")
            return
          }

          setStatus("success")
          setMessage("Your email has been confirmed! You can now use the app.")
          return
        }

        // No session yet — give Supabase a moment to process
        await new Promise(r => setTimeout(r, 2000))

        const { data: retryData } = await getSupabase().auth.getSession()
        if (retryData?.session) {
          setStatus("success")
          setMessage("Authentication successful!")
          return
        }

        setStatus("error")
        setMessage("This link has expired or is invalid. Please request a new one.")
      } catch (err) {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    handleCallback()
  }, [])

  async function handlePasswordReset() {
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match")
      return
    }

    setUpdating(true)
    setMessage("")

    const { error } = await getSupabase().auth.updateUser({ password: newPassword })

    if (error) {
      setMessage(error.message)
      setUpdating(false)
      return
    }

    setStatus("success")
    setMessage(
      isInvite
        ? "Your account is ready! You can now log in."
        : "Password updated successfully! You can now log in with your new password."
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--light)] to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">ZUZU</span>
          </Link>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-3xl p-10 shadow-lg">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-[var(--primary)] mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold mb-3">Verifying...</h1>
              <p className="text-[var(--muted)]">Please wait while we process your request.</p>
            </>
          )}

          {status === "reset-password" && (
            <>
              <Lock className="w-16 h-16 text-[var(--primary)] mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">
                {isInvite ? "Welcome to ZUZU!" : "Set New Password"}
              </h1>
              <p className="text-[var(--muted)] mb-6">
                {isInvite
                  ? "Set a password to complete your account setup."
                  : "Enter your new password below."}
              </p>

              {message && <p className="text-red-500 text-sm mb-4">{message}</p>}

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <button
                  onClick={handlePasswordReset}
                  disabled={updating}
                  className="w-full bg-[var(--primary)] text-white py-3.5 rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {updating ? "Setting up..." : isInvite ? "Create Account" : "Update Password"}
                </button>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">All Set!</h1>
              <p className="text-[var(--muted)] mb-8">{message}</p>
              <Link href="/login" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all">
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">Oops!</h1>
              <p className="text-[var(--muted)] mb-8">{message}</p>
              <Link href="/login" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

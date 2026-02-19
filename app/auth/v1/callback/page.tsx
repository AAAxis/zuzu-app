"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Dumbbell, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")
        const type = params.get("type")

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

          if (type === "signup") {
            setStatus("success")
            setMessage("Your email has been confirmed! You can now use the app.")
          } else if (type === "recovery") {
            setStatus("success")
            setMessage("Password recovery successful. You can now set a new password in the app.")
          } else {
            setStatus("success")
            setMessage("Authentication successful! You can now use the app.")
          }
        } else {
          // Check for query params (some flows use ? instead of #)
          const query = new URLSearchParams(window.location.search)
          const errorDesc = query.get("error_description")
          if (errorDesc) {
            setStatus("error")
            setMessage(errorDesc)
          } else {
            setStatus("error")
            setMessage("Invalid authentication link. Please try again.")
          }
        }
      } catch (err) {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    handleCallback()
  }, [])

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
              <p className="text-[var(--muted)]">Please wait while we confirm your account.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">All Set! 🎉</h1>
              <p className="text-[var(--muted)] mb-8">{message}</p>
              <Link href="/" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all">
                Open ZUZU
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">Oops!</h1>
              <p className="text-[var(--muted)] mb-8">{message}</p>
              <Link href="/" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all">
                Back to ZUZU
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

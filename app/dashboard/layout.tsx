"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"
import {
  LayoutDashboard,
  Users,
  Image,
  ArrowLeft,
  Dumbbell,
  Menu,
  X,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/gallery", label: "Gallery", icon: Image },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await getSupabase().auth.signOut()
    setSession(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3FF]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 h-full w-64 bg-[#1a1a2e] text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-[#A78BFA]" />
            <span className="text-xl font-bold tracking-tight">ZUZU</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="px-6 pt-3 pb-1 text-[11px] uppercase tracking-widest text-white/30 font-semibold">
          Dashboard
        </p>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="px-4 py-2 text-xs text-white/30 truncate">
            {session.user.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E8E5F0] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Dumbbell className="w-5 h-5 text-[#7C3AED]" />
          <span className="font-bold text-sm">ZUZU Dashboard</span>
        </div>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

/* ───────── Login Screen ───────── */

function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError("")

    const { error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#7C3AED] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">ZUZU Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-[#E8E5F0] p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1a1a2e]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full mt-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          <Link href="/" className="hover:text-[#7C3AED]">
            &larr; Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}

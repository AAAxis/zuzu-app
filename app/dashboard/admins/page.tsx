"use client"

import { useEffect, useState } from "react"
import {
  ShieldCheck,
  ShieldX,
  Clock,
  Mail,
  UserCircle,
} from "lucide-react"

interface Admin {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  provider: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    loadAdmins()
  }, [])

  async function loadAdmins() {
    try {
      const res = await fetch("/api/admins")
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to load admins")
        setLoading(false)
        return
      }

      setAdmins(data.admins || [])
    } catch {
      setError("Failed to load admins")
    }
    setLoading(false)
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm">Loading admins...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <ShieldX className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-[#1a1a2e] font-medium">{error}</p>
          <p className="text-[#6B7280] text-sm mt-1">Check your service role key configuration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Admins
        </h1>
        <p className="text-[#6B7280] mt-1">
          {admins.length} admin{admins.length !== 1 && "s"} with dashboard access
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Total Admins",
            value: admins.length,
            icon: ShieldCheck,
            color: "#7C3AED",
            bg: "#F3F0FF",
          },
          {
            label: "Active (signed in)",
            value: admins.filter((a) => a.last_sign_in_at).length,
            icon: UserCircle,
            color: "#10B981",
            bg: "#ECFDF5",
          },
          {
            label: "Never Signed In",
            value: admins.filter((a) => !a.last_sign_in_at).length,
            icon: Clock,
            color: "#F59E0B",
            bg: "#FFFBEB",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border border-[#E8E5F0]"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-lg font-bold text-[#1a1a2e]">{s.value}</p>
            <p className="text-xs text-[#6B7280]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-[#F3F0FF] border border-[#E8E5F0] rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">Admin Management</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            To add or remove admins, go to your Supabase dashboard and set <code className="bg-white px-1.5 py-0.5 rounded text-[#7C3AED] text-[11px]">app_metadata.role = &quot;admin&quot;</code> on the user. Only users with this role can access the dashboard.
          </p>
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-2xl border border-[#E8E5F0] overflow-hidden">
        {admins.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck className="w-12 h-12 text-[#E8E5F0] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No admins found</p>
            <p className="text-[#6B7280] text-sm mt-1">
              Set <code>app_metadata.role = &quot;admin&quot;</code> on users in Supabase.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5F0]">
            {admins.map((admin) => (
              <div
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                className="flex items-center gap-4 p-5 hover:bg-[#F8F7FF] cursor-pointer transition-colors"
              >
                {admin.avatar_url ? (
                  <img src={admin.avatar_url} alt="" className="w-11 h-11 rounded-full shrink-0 object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(admin.full_name?.[0] || admin.email[0])?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1a1a2e] truncate">
                      {admin.full_name || admin.email}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F0FF] text-[#7C3AED] uppercase shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      {admin.role}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F8F7FF] text-[#6B7280] capitalize shrink-0">
                      {admin.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-[#6B7280] truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {admin.email}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-[#6B7280]">Last sign in</p>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    {formatDate(admin.last_sign_in_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Detail Modal */}
      {selectedAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedAdmin(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              {selectedAdmin.avatar_url ? (
                <img src={selectedAdmin.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-xl font-bold">
                  {(selectedAdmin.full_name?.[0] || selectedAdmin.email[0])?.toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1a1a2e] truncate">
                    {selectedAdmin.full_name || "No name"}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F0FF] text-[#7C3AED] uppercase shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    {selectedAdmin.role}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] truncate">{selectedAdmin.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Email Status</span>
                {selectedAdmin.email_confirmed_at ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                    <ShieldCheck className="w-4 h-4" />
                    Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Role</span>
                <span className="text-sm font-medium text-[#7C3AED] capitalize">{selectedAdmin.role}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Provider</span>
                <span className="text-sm font-medium text-[#1a1a2e] capitalize">{selectedAdmin.provider}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Added</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{formatDateTime(selectedAdmin.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Last Sign In</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{formatDateTime(selectedAdmin.last_sign_in_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Email Confirmed</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{formatDateTime(selectedAdmin.email_confirmed_at)}</span>
              </div>
            </div>

            <p className="text-[10px] text-[#6B7280] mt-4 text-center font-mono">
              {selectedAdmin.id}
            </p>

            <button
              onClick={() => setSelectedAdmin(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

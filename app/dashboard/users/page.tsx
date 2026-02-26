"use client"

import { useEffect, useState } from "react"
import {
  Search,
  ChevronUp,
  ChevronDown,
  Flame,
  Footprints,
  Weight,
  UserCircle,
  Mail,
  ShieldCheck,
  ShieldX,
  Clock,
} from "lucide-react"

interface AuthUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  weight_kg: number | null
  height_cm: number | null
  bmr: number | null
  daily_steps: number | null
  goal: string | null
  has_profile: boolean
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  provider: string
}

type SortField = "email" | "created_at" | "last_sign_in_at"
type SortDir = "asc" | "desc"

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to load users")
        setLoading(false)
        return
      }

      setUsers(data.users || [])
    } catch {
      setError("Failed to load users")
    }
    setLoading(false)
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const filtered = users
    .filter(
      (u) =>
        (u.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField] ?? ""
      const bVal = b[sortField] ?? ""
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })

  const confirmedCount = users.filter((u) => u.email_confirmed_at).length
  const withProfileCount = users.filter((u) => u.has_profile).length

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronUp className="w-3 h-3 text-gray-300" />
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-[#7C3AED]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#7C3AED]" />
    )
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
          <p className="text-[#6B7280] text-sm">Loading users...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Users
          </h1>
          <p className="text-[#6B7280] mt-1">
            {users.length} registered user{users.length !== 1 && "s"}
          </p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: UserCircle,
            color: "#7C3AED",
            bg: "#F3F0FF",
          },
          {
            label: "Email Confirmed",
            value: confirmedCount,
            icon: ShieldCheck,
            color: "#10B981",
            bg: "#ECFDF5",
          },
          {
            label: "With Profile",
            value: withProfileCount,
            icon: UserCircle,
            color: "#3B82F6",
            bg: "#EFF6FF",
          },
          {
            label: "No Profile Yet",
            value: users.length - withProfileCount,
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E5F0] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <UserCircle className="w-12 h-12 text-[#E8E5F0] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">
              {search ? "No users match your search" : "No users yet"}
            </p>
            <p className="text-[#6B7280] text-sm mt-1">
              {search
                ? "Try a different search term"
                : "Users will appear here once they register"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E5F0] bg-[#FAFAFA]">
                  <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center gap-1 hover:text-[#1a1a2e]"
                    >
                      User <SortIcon field="email" />
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6B7280] hidden md:table-cell">
                    Provider
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6B7280] hidden md:table-cell">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center gap-1 hover:text-[#1a1a2e]"
                    >
                      Registered <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6B7280] hidden lg:table-cell">
                    <button
                      onClick={() => handleSort("last_sign_in_at")}
                      className="flex items-center gap-1 hover:text-[#1a1a2e]"
                    >
                      Last Sign In <SortIcon field="last_sign_in_at" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="border-b border-[#E8E5F0] last:border-b-0 hover:bg-[#F8F7FF] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(user.full_name?.[0] || user.email[0])?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1a1a2e] truncate">
                            {user.full_name || "No name"}
                          </p>
                          <p className="text-xs text-[#6B7280] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {user.email_confirmed_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 w-fit">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {user.has_profile && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3F0FF] text-[#7C3AED] w-fit">
                            Profile
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F7FF] text-[#6B7280] capitalize">
                        {user.provider}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280] hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-5 py-4 text-[#6B7280] hidden lg:table-cell">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-xl font-bold">
                {(selectedUser.full_name?.[0] || selectedUser.email[0])?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-[#1a1a2e] truncate">
                  {selectedUser.full_name || "No name"}
                </h3>
                <p className="text-sm text-[#6B7280] truncate">{selectedUser.email}</p>
              </div>
            </div>

            {/* Auth Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Status</span>
                {selectedUser.email_confirmed_at ? (
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
                <span className="text-sm text-[#6B7280]">Provider</span>
                <span className="text-sm font-medium text-[#1a1a2e] capitalize">{selectedUser.provider}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Registered</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{formatDateTime(selectedUser.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">Last Sign In</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{formatDateTime(selectedUser.last_sign_in_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E8E5F0]">
                <span className="text-sm text-[#6B7280]">App Profile</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{selectedUser.has_profile ? "Yes" : "No"}</span>
              </div>
            </div>

            {/* Profile data if available */}
            {selectedUser.has_profile && (
              <>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Profile Data</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Weight",
                      value: selectedUser.weight_kg ? `${selectedUser.weight_kg} kg` : "—",
                      icon: Weight,
                      color: "#10B981",
                    },
                    {
                      label: "Height",
                      value: selectedUser.height_cm ? `${selectedUser.height_cm} cm` : "—",
                      icon: UserCircle,
                      color: "#3B82F6",
                    },
                    {
                      label: "BMR",
                      value: selectedUser.bmr ? `${selectedUser.bmr} kcal` : "—",
                      icon: Flame,
                      color: "#F59E0B",
                    },
                    {
                      label: "Daily Steps",
                      value: selectedUser.daily_steps?.toLocaleString() || "—",
                      icon: Footprints,
                      color: "#7C3AED",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-[#F8F7FF] rounded-xl p-4 text-center"
                    >
                      <item.icon
                        className="w-5 h-5 mx-auto mb-2"
                        style={{ color: item.color }}
                      />
                      <p className="text-lg font-bold text-[#1a1a2e]">
                        {item.value}
                      </p>
                      <p className="text-xs text-[#6B7280]">{item.label}</p>
                    </div>
                  ))}
                </div>

                {selectedUser.goal && (
                  <div className="mt-3 bg-[#F3F0FF] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#6B7280] mb-1">Fitness Goal</p>
                    <p className="font-semibold text-[#7C3AED]">
                      {selectedUser.goal}
                    </p>
                  </div>
                )}
              </>
            )}

            <p className="text-[10px] text-[#6B7280] mt-4 text-center font-mono">
              {selectedUser.id}
            </p>

            <button
              onClick={() => setSelectedUser(null)}
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

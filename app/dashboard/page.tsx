"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import {
  Users,
  Footprints,
  Flame,
  Image,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"
import type { UserProfile, GalleryItem } from "@/lib/types"

interface DashboardStats {
  totalUsers: number
  avgWeight: number
  avgBmr: number
  totalSteps: number
  galleryItems: number
  activeUsers: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    avgWeight: 0,
    avgBmr: 0,
    totalSteps: 0,
    galleryItems: 0,
    activeUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [recentGallery, setRecentGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const supabase = getSupabase()

    const [usersRes, galleryRes] = await Promise.all([
      supabase.from("user_profiles").select("*"),
      supabase
        .from("training_gallery")
        .select("*")
        .order("created_at", { ascending: false }),
    ])

    const users = (usersRes.data as UserProfile[]) || []
    const gallery = (galleryRes.data as GalleryItem[]) || []

    const totalSteps = users.reduce((sum, u) => sum + (u.daily_steps || 0), 0)
    const avgWeight =
      users.length > 0
        ? users.reduce((sum, u) => sum + (u.weight_kg || 0), 0) / users.length
        : 0
    const avgBmr =
      users.length > 0
        ? users.reduce((sum, u) => sum + (u.bmr || 0), 0) / users.length
        : 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const activeUsers = users.filter(
      (u) => new Date(u.updated_at) >= sevenDaysAgo
    ).length

    setStats({
      totalUsers: users.length,
      avgWeight: Math.round(avgWeight * 10) / 10,
      avgBmr: Math.round(avgBmr),
      totalSteps,
      galleryItems: gallery.length,
      activeUsers,
    })

    setRecentUsers(users.slice(0, 5))
    setRecentGallery(gallery.slice(0, 6))
    setLoading(false)
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "#7C3AED",
      bg: "#F3F0FF",
      change: `${stats.activeUsers} active`,
      up: true,
    },
    {
      label: "Avg Weight",
      value: `${stats.avgWeight} kg`,
      icon: TrendingUp,
      color: "#10B981",
      bg: "#ECFDF5",
      change: "across users",
      up: true,
    },
    {
      label: "Avg BMR",
      value: `${stats.avgBmr} kcal`,
      icon: Flame,
      color: "#F59E0B",
      bg: "#FFFBEB",
      change: "daily average",
      up: true,
    },
    {
      label: "Total Steps",
      value: stats.totalSteps.toLocaleString(),
      icon: Footprints,
      color: "#3B82F6",
      bg: "#EFF6FF",
      change: "all users",
      up: true,
    },
    {
      label: "Gallery Items",
      value: stats.galleryItems,
      icon: Image,
      color: "#EC4899",
      bg: "#FDF2F8",
      change: "photos & videos",
      up: true,
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: Activity,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      change: "last 7 days",
      up: true,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Dashboard
        </h1>
        <p className="text-[#6B7280] mt-1">
          Overview of your fitness app metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 border border-[#E8E5F0] hover:shadow-lg hover:shadow-purple-500/5 transition-all"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                {card.up ? (
                  <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                )}
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold mt-3 text-[#1a1a2e]">
              {card.value}
            </p>
            <p className="text-sm text-[#6B7280] mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a1a2e]">Recent Users</h2>
            <Link
              href="/dashboard/users"
              className="text-sm text-[#7C3AED] font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-[#6B7280] text-sm py-8 text-center">
              No users yet. Data will appear here when users register in the
              app.
            </p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F7FF] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-[#6B7280] truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#1a1a2e]">
                      {user.weight_kg} kg
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {user.daily_steps.toLocaleString()} steps
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Gallery */}
        <div className="bg-white rounded-2xl border border-[#E8E5F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a1a2e]">
              Recent Gallery
            </h2>
            <Link
              href="/dashboard/gallery"
              className="text-sm text-[#7C3AED] font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {recentGallery.length === 0 ? (
            <p className="text-[#6B7280] text-sm py-8 text-center">
              No media yet. Upload photos and videos in the Gallery section.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {recentGallery.map((item) => (
                <Link
                  href="/dashboard/gallery"
                  key={item.id}
                  className="aspect-square rounded-xl overflow-hidden bg-[#F3F0FF] relative group"
                >
                  {item.media_type === "photo" ? (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

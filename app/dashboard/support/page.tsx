"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search,
  Loader2,
  Mail,
  Trash2,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  UserX,
  X,
  ChevronDown,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SupportTicket {
  id: string
  type: "contact" | "delete_request" | "bug_report" | "feature_request"
  email: string
  name: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  admin_notes: string
  created_at: string
  updated_at: string
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof Mail; color: string; bg: string }
> = {
  contact: {
    label: "Contact",
    icon: MessageSquare,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  delete_request: {
    label: "Delete Request",
    icon: UserX,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  bug_report: {
    label: "Bug Report",
    icon: AlertTriangle,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  feature_request: {
    label: "Feature",
    icon: Lightbulb,
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-blue-700", bg: "bg-blue-100" },
  in_progress: { label: "In Progress", color: "text-yellow-700", bg: "bg-yellow-100" },
  resolved: { label: "Resolved", color: "text-green-700", bg: "bg-green-100" },
  closed: { label: "Closed", color: "text-gray-700", bg: "bg-gray-100" },
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function SupportDashboardPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  const loadTickets = useCallback(async () => {
    const res = await fetch("/api/support")
    const data = await res.json().catch(() => ({}))
    if (res.ok && Array.isArray(data.tickets)) setTickets(data.tickets)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === "all" || t.type === filterType
    const matchStatus = filterStatus === "all" || t.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const openCount = tickets.filter((t) => t.status === "open").length
  const deleteCount = tickets.filter((t) => t.type === "delete_request" && t.status === "open").length

  async function handleDelete(id: string) {
    if (!confirm("Delete this ticket permanently?")) return
    await fetch("/api/support", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setSelectedTicket(null)
    loadTickets()
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    loadTickets()
    if (selectedTicket?.id === id) {
      setSelectedTicket((prev) => prev ? { ...prev, status: status as SupportTicket["status"] } : null)
    }
  }

  async function saveNotes(id: string, notes: string) {
    await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_notes: notes }),
    })
    loadTickets()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Support Tickets
        </h1>
        <p className="text-[#6B7280] mt-1">
          Manage contact forms, bug reports, and deletion requests
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white rounded-xl border border-[#E8E5F0] px-4 py-2.5 text-sm">
          <span className="text-[#6B7280]">Total: </span>
          <span className="font-bold text-[#1a1a2e]">{tickets.length}</span>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 px-4 py-2.5 text-sm">
          <span className="text-blue-600">Open: </span>
          <span className="font-bold text-blue-700">{openCount}</span>
        </div>
        {deleteCount > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 px-4 py-2.5 text-sm">
            <span className="text-red-600">Delete Requests: </span>
            <span className="font-bold text-red-700">{deleteCount}</span>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search by email, name, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
        >
          <option value="all">All Types</option>
          <option value="contact">Contact</option>
          <option value="delete_request">Delete Requests</option>
          <option value="bug_report">Bug Reports</option>
          <option value="feature_request">Feature Requests</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E5F0] p-12 text-center">
          <p className="text-[#6B7280]">
            {tickets.length === 0
              ? "No support tickets yet."
              : "No tickets match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => {
            const typeConf = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.contact
            const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
            const TypeIcon = typeConf.icon
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full bg-white rounded-2xl border border-[#E8E5F0] p-4 flex items-center gap-4 hover:shadow-md hover:shadow-purple-500/5 transition-all text-left"
              >
                {/* Type icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeConf.bg}`}
                >
                  <TypeIcon className={`w-5 h-5 ${typeConf.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1a1a2e] truncate">
                      {ticket.subject || ticket.type.replace("_", " ")}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeConf.bg} ${typeConf.color}`}
                    >
                      {typeConf.label}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusConf.bg} ${statusConf.color}`}
                    >
                      {statusConf.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] truncate">
                    {ticket.email}
                    {ticket.name && ` · ${ticket.name}`}
                    {" · "}
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Quick status */}
                <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
              </button>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={updateStatus}
          onSaveNotes={saveNotes}
          onDelete={handleDelete}
          onRefresh={loadTickets}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Ticket Detail Modal                                                */
/* ------------------------------------------------------------------ */

function TicketDetailModal({
  ticket,
  onClose,
  onUpdateStatus,
  onSaveNotes,
  onDelete,
}: {
  ticket: SupportTicket
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => void
  onSaveNotes: (id: string, notes: string) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [notes, setNotes] = useState(ticket.admin_notes || "")
  const [savingNotes, setSavingNotes] = useState(false)
  const typeConf = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.contact
  const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open

  async function handleSaveNotes() {
    setSavingNotes(true)
    await onSaveNotes(ticket.id, notes)
    setSavingNotes(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5F0]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConf.bg}`}
            >
              <typeConf.icon className={`w-5 h-5 ${typeConf.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">
                {ticket.subject || typeConf.label}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status & Type badges */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${typeConf.bg} ${typeConf.color}`}
            >
              {typeConf.label}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConf.bg} ${statusConf.color}`}
            >
              {statusConf.label}
            </span>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Email
              </label>
              <p className="text-sm font-medium text-[#1a1a2e] mt-0.5">
                <a
                  href={`mailto:${ticket.email}`}
                  className="text-[#7C3AED] hover:underline"
                >
                  {ticket.email}
                </a>
              </p>
            </div>
            {ticket.name && (
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Name
                </label>
                <p className="text-sm font-medium text-[#1a1a2e] mt-0.5">
                  {ticket.name}
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Message
            </label>
            <div className="mt-1.5 p-4 bg-[#F8F7FF] rounded-xl text-sm text-[#1a1a2e] whitespace-pre-wrap">
              {ticket.message || "No message provided."}
            </div>
          </div>

          {/* Status update */}
          <div>
            <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5 block">
              Update Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["open", "in_progress", "resolved", "closed"].map((s) => {
                const conf = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(ticket.id, s)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      ticket.status === s
                        ? `${conf.bg} ${conf.color} ring-2 ring-offset-1 ring-current`
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {conf.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5 block">
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this ticket..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-y"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-[#7C3AED] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingNotes && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Notes
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#E8E5F0]">
          <button
            onClick={() => onDelete(ticket.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Ticket
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

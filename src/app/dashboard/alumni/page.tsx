"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Heart,
  Handshake,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  MapPin,
  DollarSign,
  Star,
  MessageCircle,
  Calendar,
  Loader2,
  X,
  School,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrency, formatCurrencyCompact } from "@/lib/school-config";

interface AlumniRecord {
  id: string;
  graduationYear: number;
  university: string | null;
  degree: string | null;
  currentEmployer: string | null;
  currentPosition: string | null;
  industry: string | null;
  biography: string | null;
  user: { id: string; name: string; email: string } | null;
  donations: { id: string; amount: number; donatedAt: string; purpose: string | null }[];
  mentorships: { id: string; status: string }[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string | null;
  type: string;
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    graduationYear: "",
    university: "",
    degree: "",
    industry: "",
    currentEmployer: "",
    currentPosition: "",
    biography: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [messageModal, setMessageModal] = useState<{ alumni: AlumniRecord; subject: string; body: string } | null>(null);

  const fetchAlumni = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/alumni?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAlumni(data.alumni ?? []);
    } catch {
      toast.error("Failed to load alumni");
    }
    setLoading(false);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar");
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.schoolEvents ?? []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchAlumni();
    fetchEvents();
  }, [fetchAlumni, fetchEvents]);

  const totalDonations = alumni.reduce(
    (sum, a) => sum + a.donations.reduce((s, d) => s + d.amount, 0),
    0
  );
  const totalMentorships = alumni.reduce(
    (sum, a) => sum + a.mentorships.length,
    0
  );

  const stats = [
    { label: "Total Alumni", value: alumni.length.toLocaleString(), icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Active Members", value: alumni.length.toLocaleString(), icon: Star, color: "from-emerald-500 to-emerald-600" },
    { label: "Total Donations", value: formatCurrencyCompact(totalDonations), icon: DollarSign, color: "from-purple-500 to-purple-600" },
    { label: "Mentorship Pairs", value: totalMentorships.toString(), icon: Handshake, color: "from-[var(--accent)] to-emerald-400" },
  ];

  const handleAddAlumni = async () => {
    if (!form.graduationYear) {
      toast.error("Graduation year is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "",
          graduationYear: form.graduationYear,
          university: form.university || undefined,
          degree: form.degree || undefined,
          industry: form.industry || undefined,
          currentEmployer: form.currentEmployer || undefined,
          currentPosition: form.currentPosition || undefined,
          biography: form.biography || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add alumni");
      }
      toast.success("Alumni record created");
      setShowAddModal(false);
      setForm({ graduationYear: "", university: "", degree: "", industry: "", currentEmployer: "", currentPosition: "", biography: "" });
      fetchAlumni();
    } catch (err: any) {
      toast.error(err.message || "Failed to add alumni");
    }
    setSubmitting(false);
  };

  const handleExport = () => {
    const data = alumni.map((a) => ({
      Name: a.user?.name || "—",
      "Graduation Year": a.graduationYear,
      University: a.university || "—",
      Degree: a.degree || "—",
      Industry: a.industry || "—",
      "Current Employer": a.currentEmployer || "—",
      "Current Position": a.currentPosition || "—",
      Donations: a.donations.reduce((s, d) => s + d.amount, 0),
    }));
    downloadCSV(data, "alumni_directory");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mx-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 p-8 shadow-sm"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Alumni Portal</h1>
            <p className="text-[#475569] text-[13px]">
              Connect with alumni, manage networking, donations, and mentorship
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="btn btn-secondary"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Alumni
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[12px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1a1a2e] font-semibold text-lg">Alumni Directory</h3>
          <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search alumni..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 z-40 w-48 rounded-xl bg-white border border-[#e2e8f0] shadow-2xl p-1">
                    {["all", "mentoring", "donating", "recent"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setFilterCategory(opt); setShowFilter(false); }}
                        className={`w-full text-left px-5 py-2.5 rounded-lg text-[13px] capitalize transition-all ${filterCategory === opt ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "text-[#475569] hover:bg-[#f1f5f9]"}`}
                      >
                        {opt === "all" ? "All" : opt === "recent" ? "Recent Graduates" : opt === "mentoring" ? "Mentoring" : "Donating"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#64748b] animate-spin" />
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
              <p className="text-[#94a3b8] text-[13px]">No alumni records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alumni.filter((person) => {
                if (filterCategory === "all") return true;
                if (filterCategory === "mentoring") return person.mentorships.length > 0;
                if (filterCategory === "donating") return person.donations.length > 0;
                if (filterCategory === "recent") return person.graduationYear >= new Date().getFullYear() - 5;
                return true;
              }).map((person) => {
                const name = person.user?.name || "Unknown";
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                const totalDonation = person.donations.reduce((s, d) => s + d.amount, 0);
                return (
                  <div key={person.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all border border-[#e2e8f0]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1a1a2e] text-[13px] font-medium truncate">{name}</p>
                      <p className="text-[#64748b] text-[12px] truncate">
                        {person.currentPosition || person.industry || "—"} • Class of {person.graduationYear}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#64748b]" />
                        <span className="text-[#64748b] text-[12px] truncate max-w-[80px]">{person.university || "—"}</span>
                      </div>
                      {totalDonation > 0 && (
                        <p className="text-[var(--accent)] text-[12px] font-medium">{formatCurrency(totalDonation)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setMessageModal({ alumni: person, subject: "", body: "" })}
                      className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] flex-shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-[#94a3b8] text-[13px] text-center py-4">No upcoming events</p>
              ) : (
                events.slice(0, 5).map((event, i) => (
                  <div key={event.id || i} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#1a1a2e] text-[13px] font-medium truncate">{event.title}</span>
                      <span className="px-2 py-1 rounded-lg bg-[#dbeafe] text-[#2563eb] text-[11px] flex-shrink-0">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px]">
                      <Calendar className="w-3 h-3 text-[#94a3b8]" />
                      <span className="text-[#64748b]">
                        {new Date(event.start).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Donation Summary</h3>
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-[var(--accent)]">{formatCurrency(totalDonations)}</p>
                <p className="text-[#64748b] text-[12px]">Total Raised</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Building Fund", amount: Math.round(totalDonations * 0.53), percent: 53 },
                  { label: "Scholarship", amount: Math.round(totalDonations * 0.27), percent: 27 },
                  { label: "Equipment", amount: Math.round(totalDonations * 0.20), percent: 20 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[13px] mb-1">
                      <span className="text-[#475569]">{item.label}</span>
                      <span className="text-[#64748b] text-[12px]">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                      <div className="bg-[var(--accent)] h-1.5 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-[#e2e8f0] rounded-3xl p-8 max-h-[85vh] overflow-y-auto shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1a1a2e] font-bold text-lg">Add Alumni Record</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Graduation Year *</label>
                <input
                  type="number"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                  placeholder="e.g. 2015"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">University</label>
                <input
                  type="text"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  placeholder="University name"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Degree</label>
                <input
                  type="text"
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  placeholder="e.g. B.Sc Computer Science"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Industry</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="e.g. Technology"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Current Employer</label>
                  <input
                    type="text"
                    value={form.currentEmployer}
                    onChange={(e) => setForm({ ...form, currentEmployer: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Current Position</label>
                  <input
                    type="text"
                    value={form.currentPosition}
                    onChange={(e) => setForm({ ...form, currentPosition: e.target.value })}
                    placeholder="Job title"
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Biography</label>
                <textarea
                  value={form.biography}
                  onChange={(e) => setForm({ ...form, biography: e.target.value })}
                  placeholder="Brief bio..."
                  rows={3}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddAlumni}
                  disabled={submitting}
                  className="flex-1 btn btn-primary"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? "Creating..." : "Add Alumni"}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#f8fafc] text-[#64748b] text-[13px] font-medium hover:bg-[#f1f5f9] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {messageModal && (
        <div className="modal-overlay" onClick={() => setMessageModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1a1a2e] font-bold text-lg">Send Message</h3>
              <button onClick={() => setMessageModal(null)} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">To</label>
                <input type="text" readOnly value={messageModal.alumni.user?.name || "Unknown"}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[13px] outline-none" />
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Subject</label>
                <input type="text" value={messageModal.subject}
                  onChange={(e) => setMessageModal({ ...messageModal, subject: e.target.value })}
                  placeholder="e.g. Mentorship Inquiry"
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] uppercase tracking-wider font-medium mb-1 block">Message</label>
                <textarea rows={4} value={messageModal.body}
                  onChange={(e) => setMessageModal({ ...messageModal, body: e.target.value })}
                  placeholder="Type your message..."
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => {
                  toast.success(`Message sent to ${messageModal.alumni.user?.name || "alumni"}`);
                  setMessageModal(null);
                }} disabled={!messageModal.subject || !messageModal.body}
                  className="flex-1 btn btn-primary disabled:opacity-50">
                  Send Message
                </button>
                <button onClick={() => setMessageModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#f8fafc] text-[#64748b] text-[13px] font-medium hover:bg-[#f1f5f9] transition">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  Pin,
  Calendar,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  published: boolean;
  createdAt: string;
  authorId?: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0 });
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", type: "general", priority: "normal" });
  const [classes, setClasses] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "general",
    priority: "normal",
    audience: "all",
    audienceClassId: "",
    audienceStudentId: "",
    audienceParentId: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(d => setClasses(d.classes || [])).catch(() => {});
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch announcements");
      setAnnouncements(data.announcements || []);
      setStats(data.stats || { total: 0, published: 0 });
    } catch (err: any) {
      toast.error(err.message || "Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create announcement");
      toast.success("Announcement created successfully");
      setShowModal(false);
      setForm({ title: "", content: "", type: "general", priority: "normal", audience: "all", audienceClassId: "", audienceStudentId: "", audienceParentId: "" });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || "Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (announcements.length === 0) {
      toast.info("No announcements to export");
      return;
    }
    downloadCSV(
      announcements.map((a) => ({
        Title: a.title,
        Content: a.content,
        Type: a.type,
        Priority: a.priority,
        Published: a.published ? "Yes" : "No",
        "Created At": new Date(a.createdAt).toLocaleDateString(),
      })),
      "announcements"
    );
    toast.success("Announcements exported successfully");
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      (a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus === "all" ||
        (filterStatus === "published" && a.published) ||
        (filterStatus === "draft" && !a.published) ||
        (filterStatus === "pinned" && !a.published))
  );

  const draftCount = stats.total - stats.published;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Announcements</h1>
            <p className="text-white/60">
              Create and manage school-wide announcements and notifications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Announcements", value: stats.total, icon: Megaphone, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.published, icon: Eye, color: "from-emerald-500 to-emerald-600" },
          { label: "Drafts", value: draftCount, icon: Edit, color: "from-orange-500 to-orange-600" },
          { label: "Total Types", value: new Set(announcements.map((a) => a.type)).size, icon: Users, color: "from-purple-500 to-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[13px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">All Announcements</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]"
              >
                <Filter className="w-4 h-4" />
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 z-40 w-44 rounded-xl bg-[#0f1b33] border border-white/[0.12] shadow-2xl p-1">
                  {["all", "published", "draft", "pinned"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilterStatus(opt); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] capitalize transition-all ${filterStatus === opt ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "text-white/60 hover:bg-white/[0.08]"}`}
                    >
                      {opt === "all" ? "All" : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-[13px]">No announcements found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {!announcement.published && (
                      <Pin className="w-4 h-4 text-white/30" />
                    )}
                    <h4 className="text-white font-medium text-[13px]">{announcement.title}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                    announcement.priority === "high" ? "bg-red-500/20 text-red-400" :
                    announcement.priority === "medium" ? "bg-orange-500/20 text-orange-400" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-white/60 text-[13px] mb-3 line-clamp-2">{announcement.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[12px]">
                    <span className="text-white/40">Type: {announcement.type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                      announcement.published ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                    }`}>
                      {announcement.published ? "Published" : "Draft"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <span className="text-white/30">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditAnnouncement(announcement);
                        setEditForm({ title: announcement.title, content: announcement.content || "", type: announcement.type || "general", priority: announcement.priority || "normal" });
                      }}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this announcement?")) return;
                        try {
                          const res = await fetch(`/api/announcements?id=${announcement.id}`, { method: "DELETE" });
                          if (!res.ok) throw new Error("Failed");
                          setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
                          toast.success("Announcement deleted");
                        } catch { toast.error("Failed to delete"); }
                      }}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">New Announcement</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. Mid-Term Examination Schedule"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Write your announcement here..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="general">General</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="academic">Academic</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="event">Event</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="urgent">Urgent</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="administrative">Administrative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="low">Low</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="normal">Normal</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="medium">Medium</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Audience</label>
                  <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "dark" }}>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="all">Everyone</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="teachers">All Teachers</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="parents">All Parents</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="class">Specific Class</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="student">Specific Student</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="parent">Specific Parent</option>
                  </select>
                </div>
                {form.audience === "class" && (
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Select Class</label>
                    <select value={form.audienceClassId} onChange={(e) => setForm({ ...form, audienceClassId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="">Select class...</option>
                      {classes.map((c: any) => <option key={c.id} style={{ background: "#0f1b33", color: "#fff" }} value={c.id}>{c.displayName || c.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Announcement Modal */}
      <AnimatePresence>
        {editAnnouncement && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditAnnouncement(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#0a0f1e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Edit Announcement</h3>
                <button onClick={() => setEditAnnouncement(null)} className="p-1 rounded-lg hover:bg-white/10 text-white/40"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/announcements", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editAnnouncement.id, ...editForm }),
                  });
                  if (!res.ok) throw new Error("Failed");
                  setAnnouncements(prev => prev.map(a => a.id === editAnnouncement.id ? { ...a, ...editForm } : a));
                  toast.success("Announcement updated");
                  setEditAnnouncement(null);
                } catch { toast.error("Failed to update"); }
              }} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                  <input type="text" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Content *</label>
                  <textarea required rows={4} value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Type</label>
                    <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="general">General</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="academic">Academic</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="event">Event</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Priority</label>
                    <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="low">Low</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="normal">Normal</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditAnnouncement(null)} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/25">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
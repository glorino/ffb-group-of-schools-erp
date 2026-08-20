"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
} from "lucide-react";
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
  target?: any;
}

function AnnouncementsPageInner() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;
  const canManage = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [targetAudience, setTargetAudience] = useState<string[]>(["all"]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      const items = (data.announcements || data || []).filter((a: any) => a.type !== "news" && a.type !== "event");
      setAnnouncements(items);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const filtered = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "published") return matchesSearch && a.published;
    if (filterStatus === "draft") return matchesSearch && !a.published;
    if (filterStatus === "pinned") return matchesSearch && a.target?.pinned;
    return matchesSearch;
  });

  const draftCount = announcements.filter(a => !a.published).length;
  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.published).length,
    draft: draftCount,
    types: new Set(announcements.map(a => a.type)).size,
  };

  const openCreate = () => {
    setEditAnnouncement(null);
    setTitle("");
    setContent("");
    setType("general");
    setPriority("medium");
    setTargetAudience(["all"]);
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditAnnouncement(a);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setPriority(a.priority);
    setTargetAudience(a.target?.audience || ["all"]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        published: true,
        target: { audience: targetAudience },
      };

      if (editAnnouncement) {
        const res = await fetch(`/api/announcements?id=${editAnnouncement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Announcement updated");
      } else {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Announcement created");
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch {
      toast.error("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1a1a2e] text-2xl font-bold">Announcements</h1>
          <p className="text-[#64748b] text-sm mt-1">View and manage school announcements</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Announcements", value: stats.total, icon: Megaphone, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.published, icon: Eye, color: "from-emerald-500 to-emerald-600" },
          { label: "Drafts", value: stats.draft, icon: Edit, color: "from-orange-500 to-orange-600" },
          { label: "Types", value: stats.types, icon: Users, color: "from-purple-500 to-purple-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[13px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-[#1a1a2e]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1a1a2e] font-semibold text-lg">All Announcements</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search announcements..."
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
                <div className="absolute right-0 top-full mt-2 z-40 w-44 rounded-xl bg-white border border-[#e2e8f0] shadow-2xl p-1">
                  {["all", "published", "draft", "pinned"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilterStatus(opt); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] capitalize transition-all ${filterStatus === opt ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "text-[#475569] hover:bg-[#f1f5f9]"}`}
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
            <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#64748b]">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-[13px]">No announcements found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {!announcement.published && <Pin className="w-4 h-4 text-[#94a3b8]" />}
                    <h4 className="text-[#1a1a2e] font-medium text-[13px]">{announcement.title}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                    announcement.priority === "high" ? "bg-[#fee2e2] text-[#dc2626]" :
                    announcement.priority === "medium" ? "bg-orange-500/20 text-orange-400" :
                    "bg-[#f1f5f9] text-[#64748b]"
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-[#475569] text-[13px] mb-3 line-clamp-2">{announcement.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[12px]">
                    <span className="text-[#64748b]">Type: {announcement.type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                      announcement.published ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f1f5f9] text-[#64748b]"
                    }`}>
                      {announcement.published ? "Published" : "Draft"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#94a3b8]" />
                      <span className="text-[#94a3b8]">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(announcement)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1a1a2e] transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(announcement.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#64748b] hover:text-[#dc2626] transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1a1a2e] font-semibold text-lg">{editAnnouncement ? "Edit Announcement" : "New Announcement"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#64748b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" placeholder="Enter title" />
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Content *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none" placeholder="Write content..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1.5">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" style={{ colorScheme: "light" }}>
                    <option value="general" style={{ background: "#ffffff", color: "#1a1a2e" }}>General</option>
                    <option value="academic" style={{ background: "#ffffff", color: "#1a1a2e" }}>Academic</option>
                    <option value="sports" style={{ background: "#ffffff", color: "#1a1a2e" }}>Sports</option>
                    <option value="admin" style={{ background: "#ffffff", color: "#1a1a2e" }}>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1.5">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" style={{ colorScheme: "light" }}>
                    <option value="low" style={{ background: "#ffffff", color: "#1a1a2e" }}>Low</option>
                    <option value="medium" style={{ background: "#ffffff", color: "#1a1a2e" }}>Medium</option>
                    <option value="high" style={{ background: "#ffffff", color: "#1a1a2e" }}>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  {["all", "students", "parents", "teachers", "staff"].map((aud) => (
                    <button
                      key={aud}
                      onClick={() => {
                        if (aud === "all") {
                          setTargetAudience(["all"]);
                        } else {
                          const next = targetAudience.filter(a => a !== "all");
                          if (next.includes(aud)) {
                            setTargetAudience(next.filter(a => a !== aud));
                          } else {
                            setTargetAudience([...next, aud]);
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                        targetAudience.includes(aud)
                          ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30"
                          : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]"
                      }`}
                    >
                      {aud.charAt(0).toUpperCase() + aud.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-sm hover:bg-[#f1f5f9]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editAnnouncement ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#64748b] animate-spin" /></div>}>
      <AnnouncementsPageInner />
    </Suspense>
  );
}

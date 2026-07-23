"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  Newspaper,
  Star,
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
  target?: any;
}

function AnnouncementsPageInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;
  const canCreateNews = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [activeTab, setActiveTab] = useState<"announcements" | "news">(
    (searchParams?.get("tab") as "announcements" | "news") || "announcements"
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0 });
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", type: "general", priority: "normal" });
  const [classes, setClasses] = useState<any[]>([]);
  const [targetClasses, setTargetClasses] = useState<{id: string; name: string; displayName: string}[]>([]);
  const [targetStudents, setTargetStudents] = useState<{id: string; firstName: string; lastName: string}[]>([]);
  const [targetTeachers, setTargetTeachers] = useState<{id: string; firstName: string; lastName: string}[]>([]);
  const [targetParents, setTargetParents] = useState<{id: string; name: string; email: string}[]>([]);
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
    audienceTeacherId: "",
  });
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    category: "news" as "news" | "event",
    featured: false,
    eventDate: "",
  });
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editNews, setEditNews] = useState<Announcement | null>(null);
  const [editNewsForm, setEditNewsForm] = useState({ title: "", content: "", imageUrl: "", category: "news" as "news" | "event", featured: false, eventDate: "" });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(d => setClasses(d.classes || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.audience === "class") {
      fetch("/api/classes").then(r => r.json()).then(d => setTargetClasses(d.classes || d || [])).catch(() => {});
    } else if (form.audience === "student") {
      fetch("/api/students?limit=200").then(r => r.json()).then(d => setTargetStudents(d.students || [])).catch(() => {});
    } else if (form.audience === "teacher") {
      fetch("/api/teachers?limit=200").then(r => r.json()).then(d => setTargetTeachers(d.teachers || [])).catch(() => {});
    } else if (form.audience === "parent") {
      fetch("/api/children?allParents=true").then(r => r.json()).then(d => setTargetParents(d.parents || [])).catch(() => {});
    }
  }, [form.audience]);

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
        body: JSON.stringify({
          ...form,
          published: true,
          targetUserId: form.audience === "student" ? form.audienceStudentId
            : form.audience === "teacher" ? form.audienceTeacherId
            : form.audience === "parent" ? form.audienceParentId
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create announcement");
      toast.success("Announcement created successfully");
      setShowModal(false);
      setForm({ title: "", content: "", type: "general", priority: "normal", audience: "all", audienceClassId: "", audienceStudentId: "", audienceParentId: "", audienceTeacherId: "" });
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

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsForm.title,
          content: newsForm.content,
          type: newsForm.category,
          priority: "normal",
          published: true,
          imageUrl: newsForm.imageUrl || undefined,
          featured: newsForm.featured,
          eventDate: newsForm.eventDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast.success(`${newsForm.category === "news" ? "News" : "Event"} created successfully`);
      setShowNewsModal(false);
      setNewsForm({ title: "", content: "", imageUrl: "", category: "news", featured: false, eventDate: "" });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNews) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editNews.id,
          title: editNewsForm.title,
          content: editNewsForm.content,
          type: editNewsForm.category,
          imageUrl: editNewsForm.imageUrl,
          featured: editNewsForm.featured,
          eventDate: editNewsForm.eventDate,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const target = editNews.target || {};
      setAnnouncements(prev => prev.map(a => a.id === editNews.id ? { ...a, title: editNewsForm.title, content: editNewsForm.content, type: editNewsForm.category, target: { ...target, imageUrl: editNewsForm.imageUrl, featured: editNewsForm.featured, eventDate: editNewsForm.eventDate } } : a));
      toast.success("Updated successfully");
      setEditNews(null);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSubmitting(false);
    }
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

  const newsItems = filteredAnnouncements.filter(a => a.type === "news" || a.type === "event");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Announcements & News</h1>
            <p className="text-white/60">
              Create and manage school-wide announcements, news and events
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
            {!isReadOnly && (
              <button
                onClick={() => activeTab === "news" ? setShowNewsModal(true) : setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
              >
                <Plus className="w-4 h-4" />
                {activeTab === "news" ? "New News/Event" : "New Announcement"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] w-fit">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "announcements"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements
        </button>
        {canCreateNews && (
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "news"
                ? "bg-[var(--primary)] text-white shadow-lg"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <Newspaper className="w-4 h-4" />
            News & Events
          </button>
        )}
      </div>

      {/* Stats */}
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

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
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
      )}

      {/* News & Events Tab */}
      {activeTab === "news" && canCreateNews && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">News & Events</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search news & events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">No news or events yet. Click "New News/Event" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsItems.map((item) => {
                const target = item.target || {};
                return (
                  <div key={item.id} className="rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all overflow-hidden">
                    {target.imageUrl && (
                      <img
                        src={target.imageUrl}
                        alt={item.title}
                        className="w-full h-[160px] object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"; }}
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.type === "news" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {item.type === "news" ? "News" : "Event"}
                        </span>
                        {target.featured && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-500/20 text-yellow-400">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-medium text-[13px] mb-1">{item.title}</h4>
                      <p className="text-white/50 text-[12px] line-clamp-2 mb-3">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/30 text-[11px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditNews(item);
                              setEditNewsForm({
                                title: item.title,
                                content: item.content,
                                imageUrl: target.imageUrl || "",
                                category: item.type as "news" | "event",
                                featured: target.featured || false,
                                eventDate: target.eventDate || "",
                              });
                            }}
                            className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this item?")) return;
                              try {
                                const res = await fetch(`/api/announcements?id=${item.id}`, { method: "DELETE" });
                                if (!res.ok) throw new Error("Failed");
                                setAnnouncements(prev => prev.filter(a => a.id !== item.id));
                                toast.success("Deleted");
                              } catch { toast.error("Failed to delete"); }
                            }}
                            className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

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
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="teacher">Specific Teacher</option>
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
                {form.audience === "student" && (
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Select Student</label>
                    <select value={form.audienceStudentId} onChange={(e) => setForm({ ...form, audienceStudentId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="">Select student...</option>
                      {targetStudents.map((s) => <option key={s.id} style={{ background: "#0f1b33", color: "#fff" }} value={s.id}>{s.firstName} {s.lastName}</option>)}
                    </select>
                  </div>
                )}
                {form.audience === "teacher" && (
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Select Teacher</label>
                    <select value={form.audienceTeacherId} onChange={(e) => setForm({ ...form, audienceTeacherId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="">Select teacher...</option>
                      {targetTeachers.map((t) => <option key={t.id} style={{ background: "#0f1b33", color: "#fff" }} value={t.id}>{t.firstName} {t.lastName}</option>)}
                    </select>
                  </div>
                )}
                {form.audience === "parent" && (
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Select Parent</label>
                    <select value={form.audienceParentId} onChange={(e) => setForm({ ...form, audienceParentId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="">Select parent...</option>
                      {targetParents.map((p) => <option key={p.id} style={{ background: "#0f1b33", color: "#fff" }} value={p.id}>{p.name || p.email}</option>)}
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

      {/* News & Events Creation Modal */}
      <AnimatePresence>
        {showNewsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowNewsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">New News / Event</h3>
                <button onClick={() => setShowNewsModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. Academic Excellence Award"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Write about this news or event..."
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Featured Image</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.15] text-white/50 text-[13px] cursor-pointer hover:bg-white/[0.08] hover:border-[var(--primary)]/50 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
                          const reader = new FileReader();
                          reader.onload = () => setNewsForm({ ...newsForm, imageUrl: reader.result as string });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={newsForm.imageUrl.startsWith("data:") ? "" : newsForm.imageUrl}
                      onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Or paste image URL"
                    />
                  </div>
                  {newsForm.imageUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={newsForm.imageUrl}
                        alt="Preview"
                        className="w-full h-[120px] object-cover rounded-xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewsForm({ ...newsForm, imageUrl: "" })}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white/60 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Category *</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as "news" | "event" })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="news">News</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="event">Event</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] w-full">
                      <input
                        type="checkbox"
                        checked={newsForm.featured}
                        onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-white/60 text-[13px] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> Featured
                      </span>
                    </label>
                  </div>
                </div>
                {newsForm.category === "event" && (
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Event Date</label>
                    <input
                      type="date"
                      value={newsForm.eventDate}
                      onChange={(e) => setNewsForm({ ...newsForm, eventDate: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewsModal(false)}
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

      {/* Edit News Modal */}
      <AnimatePresence>
        {editNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditNews(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Edit News / Event</h3>
                <button onClick={() => setEditNews(null)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditNews} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={editNewsForm.title}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={editNewsForm.content}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Featured Image</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.15] text-white/50 text-[13px] cursor-pointer hover:bg-white/[0.08] hover:border-[var(--primary)]/50 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
                          const reader = new FileReader();
                          reader.onload = () => setEditNewsForm({ ...editNewsForm, imageUrl: reader.result as string });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={editNewsForm.imageUrl.startsWith("data:") ? "" : editNewsForm.imageUrl}
                      onChange={(e) => setEditNewsForm({ ...editNewsForm, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Or paste image URL"
                    />
                  </div>
                  {editNewsForm.imageUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={editNewsForm.imageUrl}
                        alt="Preview"
                        className="w-full h-[120px] object-cover rounded-xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditNewsForm({ ...editNewsForm, imageUrl: "" })}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white/60 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Category</label>
                    <select
                      value={editNewsForm.category}
                      onChange={(e) => setEditNewsForm({ ...editNewsForm, category: e.target.value as "news" | "event" })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="news">News</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="event">Event</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] w-full">
                      <input
                        type="checkbox"
                        checked={editNewsForm.featured}
                        onChange={(e) => setEditNewsForm({ ...editNewsForm, featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-white/60 text-[13px] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> Featured
                      </span>
                    </label>
                  </div>
                </div>
                {editNewsForm.category === "event" && (
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Event Date</label>
                    <input
                      type="date"
                      value={editNewsForm.eventDate}
                      onChange={(e) => setEditNewsForm({ ...editNewsForm, eventDate: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditNews(null)}
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
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    }>
      <AnnouncementsPageInner />
    </Suspense>
  );
}
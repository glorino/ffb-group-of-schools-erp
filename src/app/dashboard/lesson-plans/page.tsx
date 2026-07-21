"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Plus, Eye, Edit3, Calendar, Clock, X, Loader2, Trash2 } from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface LessonPlan {
  id: string;
  teacherId: string;
  subject: string;
  className: string;
  topic: string;
  objectives: string | null;
  content: string;
  resources: string | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  teacher: { id: string; firstName: string; lastName: string };
}

export default function LessonPlansPage() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<LessonPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    teacherId: "",
    subject: "",
    className: "",
    topic: "",
    objectives: "",
    content: "",
    resources: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/lesson-plans?${params}`)
      .then(r => r.json())
      .then(d => setPlans(d.plans || []))
      .catch(() => { setPlans([]); toast.error("Failed to load lesson plans"); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = plans.filter(lp =>
    !search || lp.subject.toLowerCase().includes(search.toLowerCase()) || lp.topic.toLowerCase().includes(search.toLowerCase()) || lp.className.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.subject || !form.className || !form.topic || !form.content || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/lesson-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setPlans(prev => [data.plan, ...prev]);
      setShowModal(false);
      setForm({ teacherId: "", subject: "", className: "", topic: "", objectives: "", content: "", resources: "", startDate: "", endDate: "" });
      toast.success("Lesson plan created");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/lesson-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setPlans(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success(`Lesson plan ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/lesson-plans?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success("Lesson plan deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white/95 font-display tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <BookOpen className="w-[18px] h-[18px] text-white" />
            </div>
            Lesson Plans
          </h1>
          <p className="text-white/30 text-[12px] mt-1 ml-[46px]">Create and manage lesson plans for your classes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(filtered.map(lp => ({
              Subject: lp.subject, Class: lp.className, Topic: lp.topic, Teacher: `${lp.teacher.firstName} ${lp.teacher.lastName}`,
              Status: lp.status, Start: lp.startDate, End: lp.endDate,
            })), "lesson_plans")}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition flex items-center gap-2"
          >
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search by subject, topic, or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
          style={{ colorScheme: "dark" }}
        >
          <option value="" style={{ background: "#0f1b33", color: "#fff" }}>All Status</option>
          <option value="draft" style={{ background: "#0f1b33", color: "#fff" }}>Draft</option>
          <option value="pending" style={{ background: "#0f1b33", color: "#fff" }}>Pending Review</option>
          <option value="approved" style={{ background: "#0f1b33", color: "#fff" }}>Approved</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.07] p-16 text-center">
              <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No lesson plans found</p>
            </div>
          ) : filtered.map((lp) => (
            <motion.div
              key={lp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.07] p-4 flex items-center gap-4 hover:bg-white/[0.05] transition"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-[13px] font-medium">{lp.topic}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-white/40 text-[11px]">{lp.subject}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40 text-[11px]">{lp.className}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40 text-[11px]">{lp.teacher.firstName} {lp.teacher.lastName}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{new Date(lp.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                lp.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                lp.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                "bg-white/[0.06] text-white/40"
              }`}>{lp.status}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowDetail(lp)} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition"><Eye className="w-4 h-4" /></button>
                {lp.status === "draft" && (
                  <button onClick={() => handleStatusUpdate(lp.id, "pending")} className="p-2 rounded-lg hover:bg-amber-500/10 text-white/30 hover:text-amber-400 transition text-[10px]">Submit</button>
                )}
                {lp.status === "pending" && (
                  <button onClick={() => handleStatusUpdate(lp.id, "approved")} className="p-2 rounded-lg hover:bg-emerald-500/10 text-white/30 hover:text-emerald-400 transition text-[10px]">Approve</button>
                )}
                <button onClick={() => handleDelete(lp.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--sidebar)]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 bg-[var(--sidebar)]/95 backdrop-blur-2xl z-10">
                <h3 className="text-white font-semibold">New Lesson Plan</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/70 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Subject *</label>
                    <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Mathematics" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Class *</label>
                    <input type="text" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}
                      placeholder="e.g. JSS3A" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Topic *</label>
                  <input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="e.g. Quadratic Equations" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Learning Objectives</label>
                  <input type="text" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                    placeholder="e.g. Students will be able to solve..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Content *</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Detailed lesson content..." rows={4}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 resize-none" />
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Resources</label>
                  <input type="text" value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })}
                    placeholder="Textbooks, links, materials..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Start Date *</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50" style={{ colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">End Date *</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50" style={{ colorScheme: "dark" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] sticky bottom-0 bg-[var(--sidebar)]/95 backdrop-blur-2xl">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/[0.05] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--sidebar)]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-white font-semibold">{showDetail.topic}</h3>
                  <p className="text-white/40 text-[12px] mt-0.5">{showDetail.subject} · {showDetail.className}</p>
                </div>
                <button onClick={() => setShowDetail(null)} className="text-white/40 hover:text-white/70 transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-4 text-[12px] text-white/40">
                  <span>By {showDetail.teacher.firstName} {showDetail.teacher.lastName}</span>
                  <span>·</span>
                  <span>{new Date(showDetail.startDate).toLocaleDateString()} — {new Date(showDetail.endDate).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    showDetail.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                    showDetail.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                    "bg-white/[0.06] text-white/40"
                  }`}>{showDetail.status}</span>
                </div>
                {showDetail.objectives && (
                  <div>
                    <p className="text-white/50 text-[11px] uppercase tracking-wider font-medium mb-1">Objectives</p>
                    <p className="text-white/70 text-[13px]">{showDetail.objectives}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/50 text-[11px] uppercase tracking-wider font-medium mb-1">Content</p>
                  <p className="text-white/70 text-[13px] whitespace-pre-wrap">{showDetail.content}</p>
                </div>
                {showDetail.resources && (
                  <div>
                    <p className="text-white/50 text-[11px] uppercase tracking-wider font-medium mb-1">Resources</p>
                    <p className="text-white/70 text-[13px]">{showDetail.resources}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

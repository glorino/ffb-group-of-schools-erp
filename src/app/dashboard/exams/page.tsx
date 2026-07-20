"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Play,
  Settings,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

interface Exam {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: string;
  _count: { questions: number; sittings: number };
}

interface QuestionBankItem {
  subject: string;
  questions: number;
  difficulty: string;
  lastUpdated: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, questionCount: 0 });
  const [form, setForm] = useState({
    name: "",
    type: "terminal",
    startDate: "",
    endDate: "",
  });

  const questionBank: QuestionBankItem[] = [
    { subject: "Mathematics", questions: 450, difficulty: "Mixed", lastUpdated: "2 days ago" },
    { subject: "English Language", questions: 380, difficulty: "Mixed", lastUpdated: "1 week ago" },
    { subject: "Physics", questions: 320, difficulty: "Advanced", lastUpdated: "3 days ago" },
    { subject: "Chemistry", questions: 290, difficulty: "Intermediate", lastUpdated: "5 days ago" },
    { subject: "Biology", questions: 310, difficulty: "Mixed", lastUpdated: "1 week ago" },
  ];

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch exams");
      setExams(data.exams || []);
      setStats(data.stats || { total: 0, questionCount: 0 });
    } catch (err: any) {
      toast.error(err.message || "Failed to load exams");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create exam");
      toast.success("Exam created successfully");
      setShowModal(false);
      setForm({ name: "", type: "terminal", startDate: "", endDate: "" });
      fetchExams();
    } catch (err: any) {
      toast.error(err.message || "Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (exams.length === 0) {
      toast.info("No exams to export");
      return;
    }
    downloadCSV(
      exams.map((e) => ({
        Name: e.name,
        Type: e.type,
        Status: e.status,
        "Start Date": new Date(e.startDate).toLocaleDateString(),
        "End Date": e.endDate ? new Date(e.endDate).toLocaleDateString() : "",
        Questions: e._count.questions,
        Sittings: e._count.sittings,
      })),
      "exams"
    );
    toast.success("Exams exported successfully");
  };

  const filteredExams = exams.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase())
  );

  const activeExamCount = exams.filter((e) => e.status === "active").length;
  const completedExamCount = exams.filter((e) => e.status === "completed").length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Examinations</h1>
            <p className="text-white/60">
              CBT setup, question bank management, and exam scheduling
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
              Create Exam
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: stats.total, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Question Bank", value: stats.questionCount, icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
          { label: "Active Exams", value: activeExamCount, icon: Play, color: "from-purple-500 to-purple-600" },
          { label: "Completed", value: completedExamCount, icon: CheckCircle, color: "from-[var(--accent)] to-emerald-400" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[13px] mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
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
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Examination Schedule</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search exams..."
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
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">No exams found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    exam.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                    exam.status === "completed" ? "bg-white/10 text-white/40" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {exam.status === "active" ? <Play className="w-5 h-5" /> :
                     exam.status === "completed" ? <CheckCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-medium truncate">{exam.name}</p>
                    <p className="text-white/40 text-[12px]">
                      {exam.type} • {exam._count.questions} questions • {exam._count.sittings} sittings
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                      exam.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                      exam.status === "completed" ? "bg-white/10 text-white/40" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>
                      {exam.status}
                    </span>
                    <p className="text-white/40 text-[12px] mt-1">
                      {new Date(exam.startDate).toLocaleDateString()}
                      {exam.endDate ? ` - ${new Date(exam.endDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Question Bank</h3>
          <div className="space-y-3">
            {questionBank.map((subject, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-[13px] font-medium">{subject.subject}</span>
                  <span className="text-white/40 text-[12px]">{subject.questions} Qs</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-white/40">{subject.difficulty}</span>
                  <span className="text-white/30">Updated {subject.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => toast.info("Full subject list coming soon")}
            className="w-full mt-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
          >
            View All Subjects
          </button>
        </motion.div>
      </div>

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
              className="w-full max-w-md rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Create Exam</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Exam Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. First Term Examination"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ colorScheme: "dark" }}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="terminal">Terminal</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="continuous">Continuous</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="mock">Mock</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }} value="practice">Practice</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
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
                    Create Exam
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
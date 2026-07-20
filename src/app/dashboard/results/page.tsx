"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  Loader2,
  X,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

interface GradeRecord {
  id: string;
  score: number;
  maxScore: number;
  grade: string;
  type: string;
  subject?: { id: string; name: string };
  student?: { id: string; firstName: string; lastName: string; admissionNumber: string };
}

interface SubjectResult {
  subject: string;
  avgScore: number;
  highest: number;
  lowest: number;
  count: number;
}

interface GradingScale {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
  points: number;
}

export default function ResultsPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [scales, setScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalGrades: 0, subjects: 0 });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    subjectId: "",
    type: "ca1",
    score: "",
    maxScore: "100",
    term: "",
    session: "",
    comments: "",
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grades");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch grades");
      setGrades(data.grades || []);
      setResults(data.results || []);
      setScales(data.scales || []);
      setStats(data.stats || { totalGrades: 0, subjects: 0 });
    } catch (err: any) {
      toast.error(err.message || "Failed to load results");
      setGrades([]);
      setResults([]);
      setScales([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(
    (r) => r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.avgScore, 0) / results.length);
  }, [results]);

  const topScore = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.max(...results.map((r) => r.highest));
  }, [results]);

  const passRate = useMemo(() => {
    if (grades.length === 0) return 0;
    const passing = grades.filter((g) => (g.score / g.maxScore) * 100 >= 50).length;
    return Math.round((passing / grades.length) * 100);
  }, [grades]);

  const handleExport = () => {
    if (filteredResults.length === 0 && grades.length > 0) {
      downloadCSV(
        grades.map((g) => ({
          Student: g.student ? `${g.student.firstName} ${g.student.lastName}` : "—",
          Subject: g.subject?.name || "—",
          Score: g.score,
          Type: g.type,
          Grade: g.grade,
        })),
        "grades"
      );
      return;
    }
    downloadCSV(
      filteredResults.map((r) => ({
        Subject: r.subject,
        "Avg Score": r.avgScore,
        Highest: r.highest,
        Lowest: r.lowest,
        "Total Records": r.count,
      })),
      "results"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.subjectId || !form.score) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          subjectId: form.subjectId,
          type: form.type,
          score: Number(form.score),
          maxScore: Number(form.maxScore) || 100,
          term: form.term || undefined,
          session: form.session || undefined,
          comments: form.comments || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit grade");
      toast.success("Grade submitted successfully");
      setShowModal(false);
      setForm({ studentId: "", subjectId: "", type: "ca1", score: "", maxScore: "100", term: "", session: "", comments: "" });
      fetchGrades();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit grade");
    } finally {
      setSubmitting(false);
    }
  };

  const scaleColors: Record<string, string> = {
    A: "text-emerald-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Results Management</h1>
            <p className="text-white/60">
              Grading, ranking, CA marks, and result analysis
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/[0.08] transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Enter Results
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Grades", value: stats.totalGrades, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Average Score", value: `${avgScore}%`, icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
          { label: "Pass Rate", value: `${passRate}%`, icon: Award, color: "from-purple-500 to-purple-600" },
          { label: "Top Score", value: `${topScore}%`, icon: Users, color: "from-[var(--accent)] to-emerald-400" },
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
            <h3 className="text-white font-semibold text-lg">Recent Results</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search results..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button
                onClick={handleExport}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Subject</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Avg Score</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Highest</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Lowest</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Pass Rate</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const subjectGrades = grades.filter(
                      (g) => g.subject?.name === result.subject
                    );
                    const passing = subjectGrades.filter(
                      (g) => (g.score / g.maxScore) * 100 >= 50
                    ).length;
                    const subjectPassRate = result.count > 0 ? Math.round((passing / result.count) * 100) : 0;
                    return (
                      <tr key={idx} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-all">
                        <td className="py-3 text-white font-medium text-[13px]">{result.subject}</td>
                        <td className="py-3 text-white/70 text-[13px]">{result.avgScore}%</td>
                        <td className="py-3 text-white/70 text-[13px]">{result.highest}%</td>
                        <td className="py-3 text-white/70 text-[13px]">{result.lowest}%</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-white/10 rounded-full h-2 max-w-[60px]">
                              <div
                                className="bg-[var(--accent)] h-2 rounded-full"
                                style={{ width: `${subjectPassRate}%` }}
                              />
                            </div>
                            <span className="text-white/70 text-[13px]">{subjectPassRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-white/70 text-[13px]">{result.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Grading Scale</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              </div>
            ) : scales.length === 0 ? (
              <p className="text-white/40 text-[13px] text-center py-10">No grading scales configured</p>
            ) : (
              <div className="space-y-2">
                {scales.map((scale) => (
                  <div key={scale.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                    <span className={`text-lg font-bold ${scaleColors[scale.grade] || "text-white/60"}`}>
                      {scale.grade}
                    </span>
                    <span className="text-white/70 text-[13px]">
                      {scale.minScore}-{scale.maxScore}
                    </span>
                    <span className="text-white/40 text-[13px]">{scale.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">CA Marks Distribution</h3>
            <div className="space-y-3">
              {[
                { label: "1st CA (20%)", count: stats.totalGrades, color: "bg-blue-500" },
                { label: "2nd CA (20%)", count: stats.totalGrades, color: "bg-emerald-500" },
                { label: "Exam (60%)", count: stats.totalGrades, color: "bg-purple-500" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px]">{item.label}</span>
                    <span className="text-white/40 text-[13px]">{item.count} records</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0f1e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Enter Results</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Subject ID *</label>
                  <input
                    type="text"
                    required
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Enter subject ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Type *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="ca1">1st CA</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="ca2">2nd CA</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="exam">Exam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Score *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.score}
                      onChange={(e) => setForm({ ...form, score: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxScore}
                      onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Term</label>
                    <input
                      type="text"
                      value={form.term}
                      onChange={(e) => setForm({ ...form, term: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g. 2nd Term"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Session</label>
                  <input
                    type="text"
                    value={form.session}
                    onChange={(e) => setForm({ ...form, session: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. 2024/2025"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Comments</label>
                  <textarea
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Optional comments..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Grade
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

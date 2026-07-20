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
  Download,
  BarChart3,
  Loader2,
  X,
  ChevronDown,
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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId: string | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
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

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

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

  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (showModal) {
      fetch("/api/students?limit=100")
        .then((r) => r.json())
        .then((d) => setStudents(d.students || []))
        .catch(() => {});
      fetch("/api/subjects")
        .then((r) => r.json())
        .then((d) => setSubjects(d.subjects || []))
        .catch(() => {});
    }
  }, [showModal]);

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase()) || s.code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

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
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) => r.subject.toLowerCase().includes(search.toLowerCase()));

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
    if (grades.length > 0) {
      downloadCSV(
        grades.map((g) => ({
          Student: g.student ? `${g.student.firstName} ${g.student.lastName}` : "—",
          "Admission No": g.student?.admissionNumber || "—",
          Subject: g.subject?.name || "—",
          Score: g.score,
          "Max Score": g.maxScore,
          Type: g.type,
          Grade: g.grade,
        })),
        "results"
      );
      toast.success("Results exported successfully");
      return;
    }
    if (filteredResults.length > 0) {
      downloadCSV(
        filteredResults.map((r) => ({
          Subject: r.subject,
          "Avg Score": r.avgScore,
          Highest: r.highest,
          Lowest: r.lowest,
          "Total Records": r.count,
        })),
        "results_summary"
      );
      toast.success("Results summary exported");
      return;
    }
    toast.info("No results to export. Enter some grades first.");
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
      setSelectedStudentName("");
      setSelectedSubjectName("");
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

  const typeLabel: Record<string, string> = {
    ca1: "1st CA",
    ca2: "2nd CA",
    exam: "Exam",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border border-[var(--primary)]/20 rounded-2xl p-6 backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Results Management</h1>
            <p className="text-white/60 text-sm">Grading, ranking, CA marks, and result analysis</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
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
            className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-xs mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
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
          className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Subject Results</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)] transition-colors w-56"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1 text-white/30">Enter grades to see subject results here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-white/50 text-xs font-medium pb-3 uppercase tracking-wider">Subject</th>
                    <th className="text-left text-white/50 text-xs font-medium pb-3 uppercase tracking-wider">Avg</th>
                    <th className="text-left text-white/50 text-xs font-medium pb-3 uppercase tracking-wider">High</th>
                    <th className="text-left text-white/50 text-xs font-medium pb-3 uppercase tracking-wider">Low</th>
                    <th className="text-left text-white/50 text-xs font-medium pb-3 uppercase tracking-wider">Pass</th>
                    <th className="text-right text-white/50 text-xs font-medium pb-3 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const subjectGrades = grades.filter((g) => g.subject?.name === result.subject);
                    const passing = subjectGrades.filter((g) => (g.score / g.maxScore) * 100 >= 50).length;
                    const subjectPassRate = result.count > 0 ? Math.round((passing / result.count) * 100) : 0;
                    return (
                      <tr key={idx} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-all">
                        <td className="py-3 text-white font-medium text-sm">{result.subject}</td>
                        <td className="py-3 text-white/70 text-sm">{result.avgScore}%</td>
                        <td className="py-3 text-emerald-400 text-sm font-medium">{result.highest}%</td>
                        <td className="py-3 text-red-400 text-sm font-medium">{result.lowest}%</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/10 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${subjectPassRate >= 50 ? "bg-emerald-400" : "bg-red-400"}`}
                                style={{ width: `${subjectPassRate}%` }}
                              />
                            </div>
                            <span className="text-white/70 text-xs">{subjectPassRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-white/70 text-sm text-right">{result.count}</td>
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
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Grading Scale</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              </div>
            ) : scales.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-10">No grading scales configured</p>
            ) : (
              <div className="space-y-2">
                {scales.map((scale) => (
                  <div key={scale.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition-colors">
                    <span className={`text-lg font-bold ${scaleColors[scale.grade] || "text-white/60"}`}>{scale.grade}</span>
                    <span className="text-white/60 text-sm">{scale.minScore} – {scale.maxScore}</span>
                    <span className="text-white/40 text-xs">{scale.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Grade Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "1st CA", pct: 20, color: "bg-blue-500" },
                { label: "2nd CA", pct: 20, color: "bg-emerald-500" },
                { label: "Exam", pct: 60, color: "bg-purple-500" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">{item.label}</span>
                    <span className="text-white/40 text-xs">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className={`${item.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {grades.length > 0 && (
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Recent Grades</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {grades.slice(0, 8).map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div>
                      <p className="text-white text-xs font-medium">
                        {g.student ? `${g.student.firstName} ${g.student.lastName}` : "—"}
                      </p>
                      <p className="text-white/40 text-[10px]">{g.subject?.name} · {typeLabel[g.type] || g.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-bold">{g.score}/{g.maxScore}</p>
                      <p className={`text-[10px] font-bold ${scaleColors[g.grade] || "text-white/40"}`}>{g.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              className="relative w-full max-w-xl bg-[#0a0f1e] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[var(--primary)]/30 to-[var(--accent)]/10 px-6 py-4 border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Enter Results</h3>
                    <p className="text-white/50 text-xs mt-0.5">Add or update student grades</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="relative">
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Student *</label>
                  <button
                    type="button"
                    onClick={() => { setShowStudentDropdown(!showStudentDropdown); setShowSubjectDropdown(false); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-sm focus:outline-none focus:border-[var(--primary)] transition-colors flex items-center justify-between"
                  >
                    <span className={selectedStudentName ? "text-white" : "text-white/40"}>
                      {selectedStudentName || "Select a student..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showStudentDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showStudentDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f1b33] border border-white/[0.1] rounded-xl shadow-xl max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-white/[0.06]">
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[var(--primary)]"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-44">
                        {filteredStudents.length === 0 ? (
                          <p className="text-white/40 text-xs text-center py-4">No students found</p>
                        ) : (
                          filteredStudents.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, studentId: s.id });
                                setSelectedStudentName(`${s.firstName} ${s.lastName} (${s.admissionNumber})`);
                                setShowStudentDropdown(false);
                                setStudentSearch("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-white/[0.08] transition-colors flex items-center justify-between ${form.studentId === s.id ? "bg-[var(--primary)]/20 text-white" : "text-white/80"}`}
                            >
                              <div>
                                <p className="font-medium text-xs">{s.firstName} {s.lastName}</p>
                                <p className="text-white/40 text-[10px]">{s.admissionNumber}</p>
                              </div>
                              {form.studentId === s.id && <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Subject *</label>
                  <button
                    type="button"
                    onClick={() => { setShowSubjectDropdown(!showSubjectDropdown); setShowStudentDropdown(false); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-sm focus:outline-none focus:border-[var(--primary)] transition-colors flex items-center justify-between"
                  >
                    <span className={selectedSubjectName ? "text-white" : "text-white/40"}>
                      {selectedSubjectName || "Select a subject..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showSubjectDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showSubjectDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f1b33] border border-white/[0.1] rounded-xl shadow-xl max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-white/[0.06]">
                        <input
                          type="text"
                          placeholder="Search subjects..."
                          value={subjectSearch}
                          onChange={(e) => setSubjectSearch(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[var(--primary)]"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-44">
                        {filteredSubjects.length === 0 ? (
                          <p className="text-white/40 text-xs text-center py-4">No subjects found</p>
                        ) : (
                          filteredSubjects.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, subjectId: s.id });
                                setSelectedSubjectName(`${s.name} (${s.code})`);
                                setShowSubjectDropdown(false);
                                setSubjectSearch("");
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-white/[0.08] transition-colors flex items-center justify-between ${form.subjectId === s.id ? "bg-[var(--primary)]/20 text-white" : "text-white/80"}`}
                            >
                              <div>
                                <p className="font-medium text-xs">{s.name}</p>
                                <p className="text-white/40 text-[10px]">{s.code}</p>
                              </div>
                              {form.subjectId === s.id && <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Type *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer"
                      style={{ colorScheme: "dark" }}
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="ca1">1st CA</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="ca2">2nd CA</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="exam">Exam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Score *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.score}
                      onChange={(e) => setForm({ ...form, score: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxScore}
                      onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Term</label>
                    <input
                      type="text"
                      value={form.term}
                      onChange={(e) => setForm({ ...form, term: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g. 2nd Term"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Session</label>
                    <input
                      type="text"
                      value={form.session}
                      onChange={(e) => setForm({ ...form, session: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g. 2024/2025"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Comments</label>
                    <input
                      type="text"
                      value={form.comments}
                      onChange={(e) => setForm({ ...form, comments: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.08] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/25"
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

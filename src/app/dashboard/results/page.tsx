"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
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
  Pencil,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

interface GradeRecord {
  id: string; score: number; maxScore: number; grade: string; type: string; published?: boolean;
  subject?: { id: string; name: string };
  student?: { id: string; firstName: string; lastName: string; admissionNumber: string };
}
interface SubjectResult { subject: string; avgScore: number; highest: number; lowest: number; count: number }
interface GradingScale { id: string; grade: string; minScore: number; maxScore: number; points: number }
interface Student { id: string; firstName: string; lastName: string; admissionNumber: string; classId: string | null }
interface Subject { id: string; name: string; code: string }

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const modalCard: React.CSSProperties = { background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" };
const modalGradient: React.CSSProperties = { padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" };
const dropdownItem = (selected: boolean): React.CSSProperties => ({ width: "100%", padding: "10px 14px", textAlign: "left" as const, fontSize: "13px", fontWeight: selected ? 600 : 400, color: "#0f172a", background: selected ? "rgba(0,85,255,0.08)" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.1s" });

const scaleColors: Record<string, string> = { A: "#16a34a", B: "#2563eb", C: "#ca8a04", D: "#f97316", F: "#dc2626" };
const typeLabel: Record<string, string> = { ca1: "1st CA", ca2: "2nd CA", exam: "Exam" };

export default function ResultsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [scales, setScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalGrades: 0, subjects: 0 });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [editForm, setEditForm] = useState({ score: "", maxScore: "" });
  const [publishing, setPublishing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [form, setForm] = useState({ studentId: "", subjectId: "", type: "ca1", score: "", maxScore: "100", term: "", session: "", comments: "" });

  useEffect(() => { fetchGrades(); }, []);
  useEffect(() => {
    if (showModal) {
      fetch("/api/students?limit=100").then(r => r.json()).then(d => setStudents(d.students || [])).catch(() => {});
      fetch("/api/subjects").then(r => r.json()).then(d => setSubjects(d.subjects || [])).catch(() => {});
    }
  }, [showModal]);

  const filteredStudents = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) || s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase()));
  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()) || s.code.toLowerCase().includes(subjectSearch.toLowerCase()));

  const fetchGrades = async () => {
    setLoading(true);
    try { const res = await fetch("/api/grades"); const data = await res.json(); if (!res.ok) throw new Error(data.error); setGrades(data.grades || []); setResults(data.results || []); setScales(data.scales || []); setStats(data.stats || { totalGrades: 0, subjects: 0 }); } catch (err: any) { toast.error(err.message || "Failed"); } finally { setLoading(false); }
  };

  const handlePublishAll = async () => {
    setPublishing(true);
    try { const res = await fetch("/api/grades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publishAll: true }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); toast.success("All results published"); fetchGrades(); } catch (err: any) { toast.error(err.message); } finally { setPublishing(false); }
  };

  const handleExport = () => {
    if (grades.length > 0) { downloadCSV(grades.map(g => ({ Student: g.student ? `${g.student.firstName} ${g.student.lastName}` : "—", Subject: g.subject?.name || "—", Score: g.score, Max: g.maxScore, Type: g.type, Grade: g.grade })), "results"); toast.success("Exported"); return; }
    if (filteredResults.length > 0) { downloadCSV(filteredResults.map(r => ({ Subject: r.subject, Avg: r.avgScore, High: r.highest, Low: r.lowest, Count: r.count })), "results_summary"); toast.success("Exported"); return; }
    toast.info("No results to export");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.subjectId || !form.score) { toast.error("Fill all required fields"); return; }
    setSubmitting(true);
    try { const res = await fetch("/api/grades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, score: Number(form.score), maxScore: Number(form.maxScore) || 100, term: form.term || undefined, session: form.session || undefined, comments: form.comments || undefined }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); toast.success("Grade submitted"); setShowModal(false); setForm({ studentId: "", subjectId: "", type: "ca1", score: "", maxScore: "100", term: "", session: "", comments: "" }); setSelectedStudentName(""); setSelectedSubjectName(""); fetchGrades(); } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleEditSave = async () => {
    if (!editingGrade) return;
    setSubmitting(true);
    try { const res = await fetch("/api/grades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingGrade.id, score: Number(editForm.score), maxScore: Number(editForm.maxScore) || 100 }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); toast.success("Grade updated"); setEditingGrade(null); fetchGrades(); } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const filteredResults = results.filter(r => r.subject.toLowerCase().includes(search.toLowerCase()));
  const avgScore = useMemo(() => results.length === 0 ? 0 : Math.round(results.reduce((s, r) => s + r.avgScore, 0) / results.length), [results]);
  const topScore = useMemo(() => results.length === 0 ? 0 : Math.max(...results.map(r => r.highest)), [results]);
  const passRate = useMemo(() => { if (grades.length === 0) return 0; return Math.round((grades.filter(g => (g.score / g.maxScore) * 100 >= 50).length / grades.length) * 100); }, [grades]);

  const kpis = [
    { label: "Total Grades", value: stats.totalGrades, icon: FileText, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Average Score", value: `${avgScore}%`, icon: TrendingUp, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Pass Rate", value: `${passRate}%`, icon: Award, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Top Score", value: `${topScore}%`, icon: Users, bg: "linear-gradient(135deg, #06b6d4, #0891b2)" },
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Results Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Grading, ranking, CA marks, and result analysis</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {!isReadOnly && (
              <button onClick={handlePublishAll} disabled={publishing} style={{ padding: "10px 18px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: publishing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", opacity: publishing ? 0.6 : 1, transition: "background 0.15s" }} onMouseEnter={(e) => { if (!publishing) e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}>
                {publishing ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <FileText style={{ width: "16px", height: "16px" }} />} Publish Results
              </button>
            )}
            <button onClick={handleExport} style={{ padding: "10px 18px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            {!isReadOnly && (
              <button onClick={() => setShowModal(true)} style={{ padding: "10px 18px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                <Plus style={{ width: "16px", height: "16px" }} /> Enter Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {kpis.map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Subject Results */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Subject Results</h3>
            <div style={{ position: "relative", width: "220px" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input type="text" placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px" }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}><Loader2 style={{ width: "28px", height: "28px", color: "#94a3b8", animation: "spin 1s linear infinite" }} /></div>
            ) : filteredResults.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><BarChart3 style={{ width: "28px", height: "28px", color: "#cbd5e1" }} /></div>
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No results found</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Enter grades to see subject results here</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {["SUBJECT", "AVG", "HIGH", "LOW", "PASS", "COUNT"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: h === "COUNT" ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const subjectGrades = grades.filter(g => g.subject?.name === result.subject);
                    const passing = subjectGrades.filter(g => (g.score / g.maxScore) * 100 >= 50).length;
                    const spr = result.count > 0 ? Math.round((passing / result.count) * 100) : 0;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{result.subject}</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>{result.avgScore}%</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#16a34a" }}>{result.highest}%</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#dc2626" }}>{result.lowest}%</td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "80px", height: "6px", borderRadius: "3px", background: "#f1f5f9", overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: "3px", background: spr >= 50 ? "#10b981" : "#ef4444", width: `${spr}%`, transition: "width 0.4s ease" }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: spr >= 50 ? "#16a34a" : "#dc2626", minWidth: "32px" }}>{spr}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569", textAlign: "right" }}>{result.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Grading Scale */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Grading Scale</h3>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}><Loader2 style={{ width: "22px", height: "22px", color: "#94a3b8", animation: "spin 1s linear infinite" }} /></div>
            ) : scales.length === 0 ? (
              <p style={{ margin: 0, textAlign: "center", padding: "32px 0", fontSize: "13px", color: "#94a3b8" }}>No grading scales configured</p>
            ) : (
              <div style={{ borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {scales.map((scale, idx) => (
                  <div key={scale.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: idx < scales.length - 1 ? "1px solid #f1f5f9" : "none", background: "#ffffff", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: scaleColors[scale.grade] || "#64748b", minWidth: "32px" }}>{scale.grade}</span>
                    <span style={{ fontSize: "13px", color: "#475569", flex: 1, textAlign: "center" }}>{scale.minScore} – {scale.maxScore}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{scale.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grade Breakdown */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Grade Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "1st CA", pct: 20, color: "#0055ff" },
                { label: "2nd CA", pct: 20, color: "#10b981" },
                { label: "Exam", pct: 60, color: "#8b5cf6" },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: item.color }}>{item.pct}%</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "4px", background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "4px", background: item.color, width: `${item.pct}%`, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Grades */}
          {grades.length > 0 && (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Recent Grades</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
                {grades.slice(0, 8).map(g => (
                  <div key={g.id} style={{ padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.student ? `${g.student.firstName} ${g.student.lastName}` : "—"}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{g.subject?.name} · {typeLabel[g.type] || g.type}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600, background: g.published ? "#dcfce7" : "#fef3c7", color: g.published ? "#16a34a" : "#d97706" }}>{g.published ? "Published" : "Draft"}</span>
                      {!isReadOnly && (
                        <button onClick={() => { setEditingGrade(g); setEditForm({ score: String(g.score), maxScore: String(g.maxScore) }); }} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#0f172a"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
                          <Pencil style={{ width: "12px", height: "12px" }} />
                        </button>
                      )}
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{g.score}/{g.maxScore}</p>
                        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: scaleColors[g.grade] || "#64748b" }}>{g.grade}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enter Results Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalGradient}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Enter Results</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Add or update student grades</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: "18px", height: "18px" }} /></button>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Student Dropdown */}
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Student <span style={{ color: "#ef4444" }}>*</span></label>
                <button type="button" onClick={() => { setShowStudentDropdown(!showStudentDropdown); setShowSubjectDropdown(false); }} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#f8fafc", textAlign: "left", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: selectedStudentName ? "#0f172a" : "#94a3b8", transition: "border-color 0.2s" }}>
                  <span>{selectedStudentName || "Select a student..."}</span>
                  <ChevronDown style={{ width: "16px", height: "16px", color: "#94a3b8", transform: showStudentDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {showStudentDropdown && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden" }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                      <input type="text" placeholder="Search students..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} style={{ ...inputStyle, padding: "8px 12px", fontSize: "12px" }} autoFocus />
                    </div>
                    <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {filteredStudents.length === 0 ? <p style={{ textAlign: "center", padding: "16px", fontSize: "12px", color: "#94a3b8" }}>No students found</p> : filteredStudents.map(s => (
                        <button key={s.id} type="button" onClick={() => { setForm({ ...form, studentId: s.id }); setSelectedStudentName(`${s.firstName} ${s.lastName} (${s.admissionNumber})`); setShowStudentDropdown(false); setStudentSearch(""); }} style={dropdownItem(form.studentId === s.id)} onMouseEnter={(e) => { if (form.studentId !== s.id) e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={(e) => { if (form.studentId !== s.id) e.currentTarget.style.background = "transparent"; }}>
                          <div><p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{s.firstName} {s.lastName}</p><p style={{ margin: "1px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.admissionNumber}</p></div>
                          {form.studentId === s.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Dropdown */}
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Subject <span style={{ color: "#ef4444" }}>*</span></label>
                <button type="button" onClick={() => { setShowSubjectDropdown(!showSubjectDropdown); setShowStudentDropdown(false); }} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#f8fafc", textAlign: "left", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: selectedSubjectName ? "#0f172a" : "#94a3b8", transition: "border-color 0.2s" }}>
                  <span>{selectedSubjectName || "Select a subject..."}</span>
                  <ChevronDown style={{ width: "16px", height: "16px", color: "#94a3b8", transform: showSubjectDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {showSubjectDropdown && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden" }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                      <input type="text" placeholder="Search subjects..." value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} style={{ ...inputStyle, padding: "8px 12px", fontSize: "12px" }} autoFocus />
                    </div>
                    <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {filteredSubjects.length === 0 ? <p style={{ textAlign: "center", padding: "16px", fontSize: "12px", color: "#94a3b8" }}>No subjects found</p> : filteredSubjects.map(s => (
                        <button key={s.id} type="button" onClick={() => { setForm({ ...form, subjectId: s.id }); setSelectedSubjectName(`${s.name} (${s.code})`); setShowSubjectDropdown(false); setSubjectSearch(""); }} style={dropdownItem(form.subjectId === s.id)} onMouseEnter={(e) => { if (form.subjectId !== s.id) e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={(e) => { if (form.subjectId !== s.id) e.currentTarget.style.background = "transparent"; }}>
                          <div><p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{s.name}</p><p style={{ margin: "1px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.code}</p></div>
                          {form.subjectId === s.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Type <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="ca1">1st CA</option>
                    <option value="ca2">2nd CA</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Score <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="number" required min="0" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="0" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Max Score</label>
                  <input type="number" min="1" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Term</label>
                  <input type="text" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="e.g. 2nd Term" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Session</label>
                  <input type="text" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="e.g. 2024/2025" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Comments</label>
                  <input type="text" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} placeholder="Optional" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {editingGrade && (
        <div style={modalOverlay} onClick={() => setEditingGrade(null)}>
          <div style={{ ...modalCard, maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalGradient}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Edit Grade</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{editingGrade.student?.firstName} {editingGrade.student?.lastName} — {editingGrade.subject?.name}</p>
                </div>
                <button onClick={() => setEditingGrade(null)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: "18px", height: "18px" }} /></button>
              </div>
            </div>
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Type</label>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{typeLabel[editingGrade.type] || editingGrade.type}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Score <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="number" min="0" value={editForm.score} onChange={(e) => setEditForm({ ...editForm, score: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Max Score</label>
                  <input type="number" min="1" value={editForm.maxScore} onChange={(e) => setEditForm({ ...editForm, maxScore: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setEditingGrade(null)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleEditSave} disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

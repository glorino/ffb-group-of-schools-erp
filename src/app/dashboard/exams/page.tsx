"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Clock,
  Plus,
  Search,
  CheckCircle,
  BookOpen,
  Play,
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

export default function ExamsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, questionCount: 0 });
  const [form, setForm] = useState({ name: "", type: "terminal", startDate: "", endDate: "" });
  const [showSubjects, setShowSubjects] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [allSubjects, setAllSubjects] = useState<{ name: string; questions: number }[]>([]);

  useEffect(() => { fetchExams(); }, []);

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
    if (!form.name || !form.startDate) { toast.error("Please fill in required fields"); return; }
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
    if (exams.length === 0) { toast.info("No exams to export"); return; }
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
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase())
  );

  const activeExamCount = exams.filter((e) => e.status === "active").length;
  const completedExamCount = exams.filter((e) => e.status === "completed").length;

  const kpis = [
    { label: "Total Exams", value: stats.total, icon: FileText, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Question Bank", value: stats.questionCount, icon: BookOpen, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Active Exams", value: activeExamCount, icon: Play, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Completed", value: completedExamCount, icon: CheckCircle, bg: "linear-gradient(135deg, #06b6d4, #0891b2)" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    background: "#f8fafc",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#0055ff";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)";
    e.currentTarget.style.background = "#ffffff";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#e2e8f0";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "#f8fafc";
  };

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Examinations</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>CBT setup, question bank management, and exam scheduling</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={handleExport} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            {!isReadOnly && (
              <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                <Plus style={{ width: "16px", height: "16px" }} /> Create Exam
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{kpi.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{kpi.value}</p>
            </div>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <kpi.icon style={{ width: "24px", height: "24px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Schedule + Question Bank */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Examination Schedule */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Examination Schedule</h3>
            <div style={{ position: "relative", width: "220px" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search exams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px" }}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <Loader2 style={{ width: "32px", height: "32px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
              </div>
            ) : filteredExams.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <FileText style={{ width: "28px", height: "28px", color: "#cbd5e1" }} />
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No exams found</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Create your first exam to get started</p>
              </div>
            ) : (
              filteredExams.map((exam) => {
                const isActive = exam.status === "active";
                const isCompleted = exam.status === "completed";
                return (
                  <div
                    key={exam.id}
                    style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f1f5f9", transition: "background 0.1s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isActive ? "#dcfce7" : isCompleted ? "#f1f5f9" : "#dbeafe" }}>
                      {isActive ? <Play style={{ width: "20px", height: "20px", color: "#16a34a" }} /> : isCompleted ? <CheckCircle style={{ width: "20px", height: "20px", color: "#64748b" }} /> : <Clock style={{ width: "20px", height: "20px", color: "#2563eb" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exam.name}</p>
                      <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>{exam.type} &bull; {exam._count.questions} questions &bull; {exam._count.sittings} sittings</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, background: isActive ? "#dcfce7" : isCompleted ? "#f1f5f9" : "#dbeafe", color: isActive ? "#16a34a" : isCompleted ? "#64748b" : "#2563eb" }}>
                        {exam.status}
                      </span>
                      <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                        {new Date(exam.startDate).toLocaleDateString()}
                        {exam.endDate ? ` - ${new Date(exam.endDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Question Bank Sidebar */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Question Bank</h3>
          {allSubjects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <BookOpen style={{ width: "26px", height: "26px", color: "#10b981" }} />
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>No subjects yet</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Questions will appear here once added</p>
            </div>
          ) : (
            allSubjects.slice(0, 8).map((subject, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{subject.name}</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{subject.questions} Qs</span>
              </div>
            ))
          )}
          <button
            onClick={() => {
              fetch("/api/subjects").then(r => r.json()).then(d => {
                setAllSubjects(d.subjects || []);
                setShowSubjects(true);
              }).catch(() => { setShowSubjects(true); });
            }}
            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginTop: "16px", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            View All Subjects
          </button>
        </div>
      </div>

      {/* Create Exam Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Create Exam</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Schedule a new examination</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreate} style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Exam Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. First Term Examination" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="terminal">Terminal</option>
                  <option value="continuous">Continuous</option>
                  <option value="mock">Mock</option>
                  <option value="practice">Practice</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Start Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)", transition: "all 0.15s" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View All Subjects Modal */}
      {showSubjects && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowSubjects(false)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "500px", maxHeight: "80vh", overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>All Subjects</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Browse the question bank</p>
                </div>
                <button onClick={() => setShowSubjects(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <div style={{ padding: "24px 32px 32px" }}>
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
                <input type="text" placeholder="Search subjects..." value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px", padding: "12px 14px 12px 38px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {allSubjects.filter((s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase())).map((subject, i) => (
                  <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{subject.name}</span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{subject.questions} questions</span>
                  </div>
                ))}
                {allSubjects.filter((s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase())).length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: "13px" }}>No subjects found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

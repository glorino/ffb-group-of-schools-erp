"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  Clock,
  FileText,
  CheckCircle2,
  Send,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  totalMarks: number;
  type: string;
  status: string;
  createdAt: string;
  teacher: { id: string; firstName: string; lastName: string };
  class: { id: string; name: string; displayName?: string };
  subject: { id: string; name: string; code: string };
  _count?: { submissions: number };
  mySubmission?: { id: string; grade: number | null; status: string; submittedAt: string } | null;
}

interface ClassOption { id: string; name: string }
interface SubjectOption { id: string; name: string; code: string }
interface Submission {
  id: string;
  content: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  student: { id: string; firstName: string; lastName: string; admissionNumber: string };
}

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
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#0055ff";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)";
  e.currentTarget.style.background = "#ffffff";
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#e2e8f0";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.background = "#f8fafc";
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const modalGradient: React.CSSProperties = { padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const modalCard: React.CSSProperties = { background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" };

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isStudent, setIsStudent] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [detailAssignment, setDetailAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const [form, setForm] = useState({ title: "", description: "", classId: "", subjectId: "", dueDate: "", totalMarks: 100, type: "homework" });
  const [submitForm, setSubmitForm] = useState({ content: "" });
  const [gradeForm, setGradeForm] = useState({ score: 0, feedback: "" });

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      const roles = (d?.user as any)?.roles?.map((r: any) => r.name) || [];
      setUserRoles(roles);
      setIsStudent(roles.includes("STUDENT"));
    }).catch(() => {});
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (classFilter) params.set("classId", classFilter);
      if (subjectFilter) params.set("subjectId", subjectFilter);
      const res = await fetch(`/api/assignments?${params}`);
      const data = await res.json();
      setAssignments(data.assignments || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { setAssignments([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAssignments(); }, [page, classFilter, subjectFilter]);
  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((d) => setClasses(d.classes || d || [])).catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then((d) => setSubjects(d.subjects || [])).catch(() => {});
  }, []);

  const filteredAssignments = useMemo(() => {
    if (!search) return assignments;
    return assignments.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.subject?.name.toLowerCase().includes(search.toLowerCase()));
  }, [assignments, search]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const handleCreate = async () => {
    if (!form.title || !form.classId || !form.subjectId || !form.dueDate) { toast.error("Please fill all required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, description: form.description || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Assignment created successfully");
      setShowCreateModal(false); resetForm(); fetchAssignments();
    } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedAssignment.id, ...form, description: form.description || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Assignment updated successfully");
      setShowEditModal(false); setSelectedAssignment(null); resetForm(); fetchAssignments();
    } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Assignment deleted"); fetchAssignments();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submitForm.content) { toast.error("Please enter your submission content"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: submitForm.content }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Assignment submitted successfully");
      setShowSubmitModal(false); setSelectedAssignment(null); setSubmitForm({ content: "" }); fetchAssignments();
    } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleGrade = async () => {
    if (!selectedAssignment || !selectedSubmission) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}/grade`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId: selectedSubmission.id, score: gradeForm.score, feedback: gradeForm.feedback || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Submission graded successfully");
      setShowGradeModal(false); setSelectedSubmission(null); setGradeForm({ score: 0, feedback: "" }); loadAssignmentDetail(selectedAssignment.id);
    } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const loadAssignmentDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`);
      const data = await res.json();
      setDetailAssignment(data.assignment);
      setShowDetailModal(true);
    } catch { toast.error("Failed to load assignment details"); }
  };

  const resetForm = () => setForm({ title: "", description: "", classId: "", subjectId: "", dueDate: "", totalMarks: 100, type: "homework" });

  const openEditModal = (a: Assignment) => {
    setSelectedAssignment(a);
    setForm({ title: a.title, description: a.description || "", classId: a.class.id, subjectId: a.subject.id, dueDate: new Date(a.dueDate).toISOString().slice(0, 16), totalMarks: a.totalMarks, type: a.type });
    setShowEditModal(true);
  };

  const stats = useMemo(() => {
    const total = assignments.length;
    const overdue = assignments.filter((a) => isOverdue(a.dueDate) && a.status === "active").length;
    const submissions = assignments.reduce((sum, a) => sum + (a._count?.submissions || 0), 0);
    const graded = assignments.filter((a) => a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined).length;
    return { total, overdue, submissions, graded };
  }, [assignments]);

  const kpis = [
    { label: "Total Assignments", value: stats.total, icon: BookOpen, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Submissions", value: stats.submissions, icon: FileText, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, bg: "linear-gradient(135deg, #ef4444, #dc2626)" },
    ...(isStudent ? [{ label: "Graded", value: stats.graded, icon: Award, bg: "linear-gradient(135deg, #10b981, #059669)" }] : []),
  ];

  const renderModalHeader = (title: string, subtitle?: string) => (
    <div style={modalGradient}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>{title}</h3>
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{subtitle}</p>}
        </div>
        <button style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X style={{ width: "18px", height: "18px" }} />
        </button>
      </div>
    </div>
  );

  const renderFormFields = () => (
    <>
      <div>
        <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Assignment instructions..." rows={3} style={{ ...inputStyle, resize: "none", minHeight: "80px" }} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Class <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Subject <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">Select Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Due Date <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div>
          <label style={labelStyle}>Total Marks</label>
          <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 100 })} min={1} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Type</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
          <option value="homework">Homework</option>
          <option value="classwork">Classwork</option>
          <option value="project">Project</option>
          <option value="quiz">Quiz</option>
          <option value="lab">Lab Work</option>
        </select>
      </div>
    </>
  );

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Assignments</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage and track class assignments</p>
          </div>
          {!isStudent && (
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
              <Plus style={{ width: "16px", height: "16px" }} /> Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: "16px", marginBottom: "24px" }}>
        {kpis.map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative", minWidth: "240px" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
          <input type="text" placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px", padding: "11px 14px 11px 38px" }} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        {!isStudent && (
          <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", minWidth: "160px", cursor: "pointer", colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", minWidth: "160px", cursor: "pointer", colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["ASSIGNMENT", "CLASS", "SUBJECT", "DUE DATE", "STATUS", ...(!isStudent ? ["SUBMISSIONS"] : []), "ACTIONS"].map((h) => (
                  <th key={h} style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: h === "ACTIONS" ? "right" : h === "SUBMISSIONS" ? "center" : "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: "16px 20px" }}><div style={{ height: "16px", width: "100%", borderRadius: "6px", background: "#f1f5f9" }} /></td></tr>
                ))
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <BookOpen style={{ width: "28px", height: "28px", color: "#cbd5e1" }} />
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No assignments found</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const overdue = isOverdue(a.dueDate);
                  const submitted = !!a.mySubmission;
                  const graded = a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined;
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s" }} onClick={() => loadAssignmentDetail(a.id)} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{a.title}</p>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8" }}>{a.teacher.firstName} {a.teacher.lastName} &middot; {a.totalMarks} marks</p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: 600, border: "1px solid #e2e8f0" }}>{a.class.displayName || a.class.name}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>{a.subject.name}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock style={{ width: "14px", height: "14px", color: overdue ? "#ef4444" : "#94a3b8" }} />
                          <span style={{ fontSize: "12px", fontWeight: overdue ? 600 : 400, color: overdue ? "#ef4444" : "#64748b" }}>{new Date(a.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {isStudent ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: graded ? "#dcfce7" : submitted ? "#fef3c7" : overdue ? "#fee2e2" : "#f8fafc", color: graded ? "#16a34a" : submitted ? "#d97706" : overdue ? "#dc2626" : "#64748b" }}>
                            {graded ? <><CheckCircle2 style={{ width: "12px", height: "12px" }} /> Graded: {a.mySubmission!.grade}/{a.totalMarks}</> : submitted ? <><Clock style={{ width: "12px", height: "12px" }} /> Submitted</> : overdue ? <><AlertCircle style={{ width: "12px", height: "12px" }} /> Overdue</> : "Pending"}
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: a.status === "active" ? "#dcfce7" : "#f8fafc", color: a.status === "active" ? "#16a34a" : "#94a3b8" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.status === "active" ? "#16a34a" : "#94a3b8" }} /> {a.status}
                          </span>
                        )}
                      </td>
                      {!isStudent && (
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: "#f8fafc", color: "#0f172a", fontSize: "13px", fontWeight: 700, border: "1px solid #e2e8f0" }}>{a._count?.submissions || 0}</span>
                        </td>
                      )}
                      <td style={{ padding: "14px 20px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          {isStudent && !submitted && !overdue && (
                            <button onClick={() => { setSelectedAssignment(a); setSubmitForm({ content: "" }); setShowSubmitModal(true); }} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Send style={{ width: "12px", height: "12px" }} /> Submit</button>
                          )}
                          {isStudent && submitted && !graded && (
                            <span style={{ padding: "6px 14px", borderRadius: "8px", background: "#fef3c7", color: "#d97706", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}><Clock style={{ width: "12px", height: "12px" }} /> Pending</span>
                          )}
                          {isStudent && graded && (
                            <span style={{ padding: "6px 14px", borderRadius: "8px", background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}><Star style={{ width: "12px", height: "12px" }} /> {a.mySubmission!.grade}/{a.totalMarks}</span>
                          )}
                          {!isStudent && (
                            <>
                              <button onClick={() => openEditModal(a)} style={{ padding: "6px 8px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}><Edit3 style={{ width: "15px", height: "15px" }} /></button>
                              <button onClick={() => handleDelete(a.id)} style={{ padding: "6px 8px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}><Trash2 style={{ width: "15px", height: "15px" }} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Page {page} of {totalPages}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f8fafc", color: "#94a3b8", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft style={{ width: "16px", height: "16px" }} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pn = i + 1;
                return <button key={pn} onClick={() => setPage(pn)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: page === pn ? "#0055ff" : "#f8fafc", color: page === pn ? "#ffffff" : "#94a3b8", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: page === pn ? "0 4px 12px rgba(0,85,255,0.3)" : "none" }}>{pn}</button>;
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f8fafc", color: "#94a3b8", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight style={{ width: "16px", height: "16px" }} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            {renderModalHeader("Create Assignment", "Add a new assignment for your class")}
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {renderFormFields()}
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowCreateModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreate} disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            {renderModalHeader("Edit Assignment", "Update assignment details")}
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {renderFormFields()}
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowEditModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleEdit} disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Update Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div style={modalOverlay} onClick={() => setShowSubmitModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            {renderModalHeader("Submit Assignment", selectedAssignment.title)}
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                  <BookOpen style={{ width: "14px", height: "14px" }} />
                  <span>{selectedAssignment.subject.name} &middot; {selectedAssignment.class.displayName || selectedAssignment.class.name}</span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#94a3b8" }}>Due: {new Date(selectedAssignment.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div>
                <label style={labelStyle}>Your Submission <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea value={submitForm.content} onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })} placeholder="Type your answer or paste your work here..." rows={6} style={{ ...inputStyle, resize: "none", minHeight: "120px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowSubmitModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSubmitAssignment} disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} <Send style={{ width: "14px", height: "14px" }} /> Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && selectedAssignment && (
        <div style={modalOverlay} onClick={() => setShowGradeModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            {renderModalHeader("Grade Submission", "Review and grade student work")}
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{selectedSubmission.student.firstName} {selectedSubmission.student.lastName}</p>
                <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8" }}>{selectedSubmission.student.admissionNumber} &middot; Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString("en-NG")}</p>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0", maxHeight: "120px", overflowY: "auto" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", whiteSpace: "pre-wrap" }}>{selectedSubmission.content}</p>
              </div>
              <div>
                <label style={labelStyle}>Score (out of {selectedAssignment.totalMarks}) <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="number" value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) || 0 })} min={0} max={selectedAssignment.totalMarks} step={0.5} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={labelStyle}>Feedback</label>
                <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Optional feedback for the student..." rows={3} style={{ ...inputStyle, resize: "none", minHeight: "80px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowGradeModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleGrade} disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} <Award style={{ width: "14px", height: "14px" }} /> Save Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailAssignment && (
        <div style={modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={{ ...modalCard, maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            {renderModalHeader(detailAssignment.title, "Assignment details and submissions")}
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Class", value: detailAssignment.class.displayName || detailAssignment.class.name },
                  { label: "Subject", value: detailAssignment.subject.name },
                  { label: "Due Date", value: new Date(detailAssignment.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
                  { label: "Total Marks", value: detailAssignment.totalMarks },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ margin: "6px 0 0", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              {detailAssignment.description && (
                <div style={{ padding: "14px 16px", borderRadius: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", whiteSpace: "pre-wrap" }}>{detailAssignment.description}</p>
                </div>
              )}
              <div>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users style={{ width: "16px", height: "16px", color: "#64748b" }} /> Submissions ({detailAssignment.submissions?.length || 0})
                </h4>
                {detailAssignment.submissions?.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <FileText style={{ width: "28px", height: "28px", color: "#cbd5e1", margin: "0 auto 8px" }} />
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>No submissions yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                    {detailAssignment.submissions.map((s: Submission) => (
                      <div key={s.id} style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{s.student.firstName} {s.student.lastName}</p>
                          <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.student.admissionNumber} &middot; {new Date(s.submittedAt).toLocaleDateString("en-NG")}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {s.grade !== null ? (
                            <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 600 }}>{s.grade}/{detailAssignment.totalMarks}</span>
                          ) : (
                            <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#fef3c7", color: "#d97706", fontSize: "11px", fontWeight: 600 }}>Not Graded</span>
                          )}
                          {!isStudent && s.grade === null && (
                            <button onClick={() => { setShowDetailModal(false); setSelectedAssignment(detailAssignment); setSelectedSubmission(s); setGradeForm({ score: s.grade ?? 0, feedback: s.feedback || "" }); setShowGradeModal(true); }} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Award style={{ width: "12px", height: "12px" }} /> Grade</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

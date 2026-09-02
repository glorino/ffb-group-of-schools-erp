"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Download,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  GraduationCap,
  Phone,
  Mail,
  X,
  Grid3X3,
  List,
  Loader2,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber: string;
  class?: { name: string };
  guardianName?: string;
  guardianPhone?: string;
  status: string;
  createdAt: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortField, setSortField] = useState<"name" | "class" | "date">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", admissionNumber: "",
    guardianName: "", guardianPhone: "", classId: "",
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (classFilter) params.set("classId", classFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, classFilter, statusFilter]);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(d => setClasses(d.classes || d || [])).catch(() => {});
  }, []);

  const sortedStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      if (sortField === "name") return sortDir === "asc"
        ? `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
        : `${b.lastName} ${b.firstName}`.localeCompare(`${a.lastName} ${a.firstName}`);
      if (sortField === "class") return sortDir === "asc"
        ? (a.class?.name || "").localeCompare(b.class?.name || "")
        : (b.class?.name || "").localeCompare(a.class?.name || "");
      return sortDir === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted;
  }, [students, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);
    try {
      if (editingStudent) {
        const res = await fetch(`/api/students?id=${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName, lastName: form.lastName, email: form.email || undefined,
            classId: form.classId || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update student");
        toast.success("Student updated successfully");
      } else {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName, lastName: form.lastName, email: form.email || undefined,
            admissionNumber: form.admissionNumber || undefined, classId: form.classId || undefined,
            guardianName: form.guardianName || undefined, guardianPhone: form.guardianPhone || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create student");
        toast.success("Student added successfully");
      }
      setShowModal(false);
      setEditingStudent(null);
      setForm({ firstName: "", lastName: "", email: "", phone: "", admissionNumber: "", guardianName: "", guardianPhone: "", classId: "" });
      setPage(1);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ marginTop: "32px", borderRadius: "20px", padding: "32px 36px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Students</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage student records and profiles</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={async () => { try { const res = await fetch("/api/students/graduate", { method: "POST" }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed"); if (data.graduated === 0) toast.info(data.message || "No SSS 3 students to graduate"); else toast.success(data.message || `${data.graduated} students graduated to alumni`); } catch (err: any) { toast.error(err.message || "Graduation failed"); } }} style={{ padding: "10px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <GraduationCap style={{ width: "14px", height: "14px" }} /> Graduate SSS 3
            </button>
            <button onClick={() => downloadCSV(students.map(s => ({ Name: `${s.firstName} ${s.lastName}`, "Admission No": s.admissionNumber, Class: s.class?.name || "—", Email: s.email || "—", Status: s.status, "Date Added": new Date(s.createdAt).toLocaleDateString() })), "students_list")} style={{ padding: "10px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Download style={{ width: "14px", height: "14px" }} /> Export
            </button>
            <button onClick={() => { setEditingStudent(null); setForm({ firstName: "", lastName: "", email: "", phone: "", admissionNumber: "", guardianName: "", guardianPhone: "", classId: "" }); setShowModal(true); }} style={{ padding: "10px 20px", borderRadius: "12px", background: "#ffffff", color: "#0055ff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
              <UserPlus style={{ width: "14px", height: "14px" }} /> Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
          <input type="text" placeholder="Search by name, admission number, or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", padding: "11px 16px 11px 42px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} />
        </div>
        <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }} style={{ padding: "11px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#475569", outline: "none", cursor: "pointer", minWidth: "130px", colorScheme: "light" }}>
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "11px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#475569", outline: "none", cursor: "pointer", minWidth: "120px", colorScheme: "light" }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
        <div style={{ display: "flex", gap: "2px", padding: "4px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff" }}>
          <button onClick={() => setViewMode("table")} style={{ width: "34px", height: "34px", borderRadius: "8px", border: "none", background: viewMode === "table" ? "#0055ff" : "transparent", color: viewMode === "table" ? "#ffffff" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}><List style={{ width: "16px", height: "16px" }} /></button>
          <button onClick={() => setViewMode("grid")} style={{ width: "34px", height: "34px", borderRadius: "8px", border: "none", background: viewMode === "grid" ? "#0055ff" : "transparent", color: viewMode === "grid" ? "#ffffff" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}><Grid3X3 style={{ width: "16px", height: "16px" }} /></button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {[
                    { key: "name" as const, label: "Student" },
                    { key: "class" as const, label: "Class" },
                    { key: "date" as const, label: "Admitted" },
                  ].map((col) => (
                    <th key={col.key} onClick={() => toggleSort(col.key)} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", userSelect: "none", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {col.label}
                        {sortField === col.key && (
                          <span style={{ color: "#0055ff", fontSize: "10px" }}>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>Guardian</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td colSpan={6} style={{ padding: "16px 20px" }}>
                        <div style={{ height: "16px", borderRadius: "8px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
                      </td>
                    </tr>
                  ))
                ) : sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "64px 20px", textAlign: "center" }}>
                      <Users style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>No students found</p>
                      <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student, i) => {
                    const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase();
                    return (
                      <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }} onClick={() => router.push(`/dashboard/students/${student.id}`)} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, #0055ff, #0a2a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "12px", fontWeight: 700, flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }}>
                              {initials}
                            </div>
                            <div>
                              <p style={{ margin: 0, color: "#0f172a", fontSize: "13px", fontWeight: 500 }}>{student.lastName} {student.firstName}</p>
                              <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "11px" }}>{student.admissionNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "8px", background: "#f8fafc", color: "#475569", fontSize: "12px", fontWeight: 500, border: "1px solid #e2e8f0" }}>
                            {student.class?.name || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", color: "#0f172a", fontSize: "13px" }}>
                          {new Date(student.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div>
                            <p style={{ margin: 0, color: "#0f172a", fontSize: "13px" }}>{student.guardianName || "—"}</p>
                            <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "10px" }}>{student.guardianPhone || ""}</p>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, ...(student.status === "active" ? { background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" } : student.status === "graduated" ? { background: "#dbeafe", color: "#2563eb", border: "1px solid #bfdbfe" } : { background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }) }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: student.status === "active" ? "#16a34a" : student.status === "graduated" ? "#2563eb" : "#94a3b8" }} />
                            {student.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === student.id ? null : student.id); }} style={{ padding: "6px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <MoreHorizontal style={{ width: "16px", height: "16px" }} />
                            </button>
                            {openMenu === student.id && (
                              <div style={{ position: "absolute", right: 0, top: "32px", width: "144px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden" }}>
                                <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/students/${student.id}`); setOpenMenu(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#475569", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                  <Eye style={{ width: "14px", height: "14px" }} /> View Profile
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setEditingStudent(student); setForm({ firstName: student.firstName, lastName: student.lastName, email: student.email || "", phone: "", admissionNumber: student.admissionNumber || "", guardianName: student.guardianName || "", guardianPhone: student.guardianPhone || "", classId: student.class ? (classes.find(c => c.name === student.class?.name)?.id || "") : "" }); setShowModal(true); setOpenMenu(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#475569", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                  <Edit3 style={{ width: "14px", height: "14px" }} /> Edit
                                </button>
                                <button onClick={async (e) => { e.stopPropagation(); if (confirm(`Remove ${student.firstName} ${student.lastName}?`)) { await fetch(`/api/students?id=${student.id}`, { method: "DELETE" }); toast.success("Student removed"); fetchStudents(); } setOpenMenu(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#dc2626", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                  <Trash2 style={{ width: "14px", height: "14px" }} /> Remove
                                </button>
                              </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>Page {page} of {totalPages}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#ffffff", color: "#94a3b8", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft style={{ width: "16px", height: "16px" }} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: page === pageNum ? "1px solid #0055ff" : "1px solid #e2e8f0", background: page === pageNum ? "#0055ff" : "#ffffff", color: page === pageNum ? "#ffffff" : "#64748b", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: page === pageNum ? "0 2px 8px rgba(0,85,255,0.25)" : "none" }}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#ffffff", color: "#94a3b8", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", animation: "pulse 2s infinite" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e2e8f0" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "14px", borderRadius: "6px", background: "#e2e8f0", width: "60%", marginBottom: "6px" }} />
                    <div style={{ height: "10px", borderRadius: "6px", background: "#f1f5f9", width: "40%" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ height: "10px", borderRadius: "6px", background: "#f1f5f9" }} />
                  <div style={{ height: "10px", borderRadius: "6px", background: "#f1f5f9", width: "75%" }} />
                </div>
              </div>
            ))
          ) : sortedStudents.map((student) => {
            const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase();
            return (
              <div key={student.id} onClick={() => router.push(`/dashboard/students/${student.id}`)} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,85,255,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #0055ff, #0a2a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: 700, border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, color: "#0f172a", fontSize: "14px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.lastName} {student.firstName}</p>
                    <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "11px" }}>{student.admissionNumber}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    <GraduationCap style={{ width: "14px", height: "14px", color: "#94a3b8", flexShrink: 0 }} />
                    <span style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.class?.name || "Unassigned"}</span>
                  </div>
                  {student.guardianName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                      <Phone style={{ width: "14px", height: "14px", color: "#94a3b8", flexShrink: 0 }} />
                      <span style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.guardianName}</span>
                    </div>
                  )}
                  {student.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                      <Mail style={{ width: "14px", height: "14px", color: "#94a3b8", flexShrink: 0 }} />
                      <span style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.email}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 500, ...(student.status === "active" ? { background: "#dcfce7", color: "#16a34a" } : { background: "#f1f5f9", color: "#94a3b8" }) }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: student.status === "active" ? "#16a34a" : "#94a3b8" }} />
                    {student.status}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "10px" }}>
                    {new Date(student.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowModal(false)}>
            <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
                <button onClick={() => { setShowModal(false); setEditingStudent(null); }} style={{ padding: "8px", borderRadius: "10px", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
              <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>First Name *</label>
                    <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Last Name *</label>
                    <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Admission No.</label>
                    <input type="text" value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} placeholder="Auto-generated if empty" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@email.com" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Class</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#475569", outline: "none", cursor: "pointer", boxSizing: "border-box", colorScheme: "light" }}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Guardian Name</label>
                    <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="Parent/Guardian name" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Guardian Phone</label>
                    <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="+234..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "20px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreate} disabled={submitting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
                  {editingStudent ? "Update Student" : "Add Student"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

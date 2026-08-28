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
      const params = new URLSearchParams({ page: String(page), limit: "10" });
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
    <motion.div {...fadeIn} className="space-y-5">
      {/* Header */}
      <div className="mx-6 mt-6 bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] rounded-2xl p-7 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Students</h1>
            <p className="text-white/70 text-[13px]">Manage student records and profiles</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/students/graduate", { method: "POST" });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed");
                  if (data.graduated === 0) toast.info(data.message || "No SSS 3 students to graduate");
                  else toast.success(data.message || `${data.graduated} students graduated to alumni`);
                } catch (err: any) {
                  toast.error(err.message || "Graduation failed");
                }
              }}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-all"
            >
              <GraduationCap className="w-4 h-4" />
            Graduate SSS 3
          </button>
          <button
            onClick={() => downloadCSV(students.map(s => ({
              Name: `${s.firstName} ${s.lastName}`,
              "Admission No": s.admissionNumber,
              Class: s.class?.name || "—",
              Email: s.email || "—",
              Status: s.status,
              "Date Added": new Date(s.createdAt).toLocaleDateString(),
            })), "students_list")}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => { setEditingStudent(null); setForm({ firstName: "", lastName: "", email: "", phone: "", admissionNumber: "", guardianName: "", guardianPhone: "", classId: "" }); setShowModal(true); }}
            className="px-4 py-2 rounded-xl bg-white text-[#0055ff] text-[13px] font-semibold hover:bg-white/90 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ffffff]" />
          <input
            type="text"
            placeholder="Search by name, admission number, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-search pl-10"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
          className="select-field"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
        <div className="flex items-center gap-1 bg-[#001f5f] border border-[#0a1428] rounded-xl p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-[#001f5f] text-[#ffffff]" : "text-[#ffffff] hover:text-[#64748b]"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-[#001f5f] text-[#ffffff]" : "text-[#ffffff] hover:text-[#64748b]"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
<thead>
                <tr className="border-b border-[#0a1428]">
                  {[
                    { key: "name" as const, label: "Student" },
                    { key: "class" as const, label: "Class" },
                    { key: "date" as const, label: "Admitted" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#ffffff] uppercase tracking-wider cursor-pointer hover:text-[#64748b] transition select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        {col.label}
                        {sortField === col.key && (
                          <span className="text-[var(--accent)]">{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#ffffff] uppercase tracking-wider">Guardian</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#ffffff] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-[#ffffff] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#f1f5f9]">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-4 rounded-lg bg-[#f8fafc] animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                      <p className="text-[#94a3b8] text-sm">No students found</p>
                      <p className="text-[#94a3b8] text-[11px] mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student, i) => {
                    const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase();
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-[#f1f5f9] hover:bg-[#f1f5f9] transition cursor-pointer group"
                        onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-[11px] font-bold border border-[#e2e8f0] flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-[#1a1a2e] text-[13px] font-medium">{student.lastName} {student.firstName}</p>
                              <p className="text-[#94a3b8] text-[11px]">{student.admissionNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-[#f8fafc] text-[#64748b] text-[12px] font-medium border border-[#e2e8f0]">
                            {student.class?.name || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#1a1a2e] text-[13px]">
                          {new Date(student.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-[#1a1a2e] text-[13px]">{student.guardianName || "—"}</p>
                            <p className="text-[#94a3b8] text-[10px]">{student.guardianPhone || ""}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                            student.status === "active"
                              ? "bg-[#dcfce7] text-[#16a34a] border border-[#dcfce7]"
                              : student.status === "graduated"
                              ? "bg-[#dbeafe] text-[#2563eb] border border-[#dbeafe]"
                              : "bg-[#f8fafc] text-[#94a3b8] border border-[#e2e8f0]"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              student.status === "active" ? "bg-[#16a34a]" :
                              student.status === "graduated" ? "bg-[#2563eb]" : "bg-[#94a3b8]"
                            }`} />
                            {student.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === student.id ? null : student.id); }}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenu === student.id && (
                              <div className="absolute right-0 top-8 w-36 rounded-xl bg-white/95 backdrop-blur-2xl border border-[#e2e8f0] shadow-2xl z-[60] overflow-hidden">
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/students/${student.id}`); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] text-[12px]"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Profile
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingStudent(student);
                                    setForm({
                                      firstName: student.firstName,
                                      lastName: student.lastName,
                                      email: student.email || "",
                                      phone: "",
                                      admissionNumber: student.admissionNumber || "",
                                      guardianName: student.guardianName || "",
                                      guardianPhone: student.guardianPhone || "",
                                      classId: student.class ? (classes.find(c => c.name === student.class?.name)?.id || "") : "",
                                    });
                                    setShowModal(true);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] text-[12px]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  onClick={async (e) => { e.stopPropagation(); if (confirm(`Remove ${student.firstName} ${student.lastName}?`)) { await fetch(`/api/students?id=${student.id}`, { method: "DELETE" }); toast.success("Student removed"); fetchStudents(); } setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[#dc2626]/70 hover:text-[#dc2626] hover:bg-[#fee2e2]/30 text-[12px]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-[#f8fafc] flex items-center justify-between">
              <p className="text-[#94a3b8] text-[11px]">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-[#f8fafc] text-[#94a3b8] hover:text-[#475569] hover:bg-[#e2e8f0] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-[12px] font-medium transition ${
                        page === pageNum
                          ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                          : "bg-[#f8fafc] text-[#94a3b8] hover:text-[#475569] hover:bg-[#e2e8f0]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-[#f8fafc] text-[#94a3b8] hover:text-[#475569] hover:bg-[#e2e8f0] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="dashboard-card animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#e2e8f0]" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 rounded bg-[#e2e8f0] w-2/3" />
                    <div className="h-2.5 rounded bg-[#f1f5f9] w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 rounded bg-[#f1f5f9]" />
                  <div className="h-2.5 rounded bg-[#f1f5f9] w-3/4" />
                </div>
              </div>
            ))
          ) : sortedStudents.map((student, i) => {
            const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase();
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/dashboard/students/${student.id}`)}
                className="dashboard-card hover:border-[#e2e8f0] hover:bg-[#f1f5f9] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-[13px] font-bold border border-[#e2e8f0]">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#1a1a2e] text-[14px] font-medium truncate">{student.lastName} {student.firstName}</p>
                    <p className="text-[#94a3b8] text-[11px]">{student.admissionNumber}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[12px]">
                    <GraduationCap className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span className="text-[#64748b]">{student.class?.name || "Unassigned"}</span>
                  </div>
                  {student.guardianName && (
                    <div className="flex items-center gap-2 text-[12px]">
                      <Phone className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span className="text-[#64748b] truncate">{student.guardianName}</span>
                    </div>
                  )}
                  {student.email && (
                    <div className="flex items-center gap-2 text-[12px]">
                      <Mail className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span className="text-[#64748b] truncate">{student.email}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-[#f8fafc] flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    student.status === "active"
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#f8fafc] text-[#94a3b8]"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${student.status === "active" ? "bg-[#16a34a]" : "bg-[#94a3b8]"}`} />
                    {student.status}
                  </span>
                  <span className="text-[#94a3b8] text-[10px]">
                    {new Date(student.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content"
            >
              <div className="modal-header">
                <h3>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
                <button onClick={() => { setShowModal(false); setEditingStudent(null); }} className="text-[#64748b] hover:text-[#1a1a2e] transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">First Name *</label>
                    <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Last Name *</label>
                    <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="input-field" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Admission No.</label>
                    <input type="text" value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
                      placeholder="Auto-generated if empty" className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="student@email.com" className="input-field" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Class</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="select-field">
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Guardian Name</label>
                    <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                      placeholder="Parent/Guardian name" className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Guardian Phone</label>
                    <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                      placeholder="+234..." className="input-field" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="btn btn-primary disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingStudent ? "Update Student" : "Add Student"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

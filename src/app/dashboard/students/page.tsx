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
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", admissionNumber: "",
    guardianName: "", guardianPhone: "", classId: "",
  });

  useEffect(() => {
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
      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", admissionNumber: "", guardianName: "", guardianPhone: "", classId: "" });
      toast.success("Student added successfully");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white/95 font-display tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Users className="w-[18px] h-[18px] text-white" />
            </div>
            Students
          </h1>
          <p className="text-white/30 text-[12px] mt-1 ml-[46px]">Manage student records and profiles</p>
        </div>
        <div className="flex items-center gap-2">
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
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300 text-[13px] font-medium hover:bg-amber-500/25 transition flex items-center gap-2"
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
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search by name, admission number, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-white/[0.08] text-white/80" : "text-white/30 hover:text-white/50"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white/[0.08] text-white/80" : "text-white/30 hover:text-white/50"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    { key: "name" as const, label: "Student" },
                    { key: "class" as const, label: "Class" },
                    { key: "date" as const, label: "Admitted" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider cursor-pointer hover:text-white/50 transition select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        {col.label}
                        {sortField === col.key && (
                          <span className="text-[var(--accent)]">{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Guardian</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-4 rounded-lg bg-white/[0.04] animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No students found</p>
                      <p className="text-white/15 text-[11px] mt-1">Try adjusting your filters</p>
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
                        className="border-b border-white/[0.03] hover:bg-white/[0.03] transition cursor-pointer group"
                        onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-[11px] font-bold border border-white/10 flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-white/85 text-[13px] font-medium">{student.lastName} {student.firstName}</p>
                              <p className="text-white/25 text-[11px]">{student.admissionNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-white/50 text-[12px] font-medium border border-white/[0.06]">
                            {student.class?.name || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white/35 text-[12px]">
                          {new Date(student.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-white/50 text-[12px]">{student.guardianName || "—"}</p>
                            <p className="text-white/25 text-[10px]">{student.guardianPhone || ""}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                            student.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : student.status === "graduated"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-white/[0.05] text-white/30 border border-white/[0.06]"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              student.status === "active" ? "bg-emerald-400" :
                              student.status === "graduated" ? "bg-blue-400" : "bg-white/30"
                            }`} />
                            {student.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === student.id ? null : student.id); }}
                              className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenu === student.id && (
                              <div className="absolute right-0 top-8 w-36 rounded-xl bg-[var(--sidebar)]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl z-[60] overflow-hidden">
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/students/${student.id}`); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/[0.06] text-[12px]"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Profile
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/[0.06] text-[12px]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] text-[12px]"
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
            <div className="px-5 py-3.5 border-t border-white/[0.05] flex items-center justify-between">
              <p className="text-white/25 text-[11px]">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                          : "bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.08]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition"
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
              <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06]" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 rounded bg-white/[0.06] w-2/3" />
                    <div className="h-2.5 rounded bg-white/[0.04] w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 rounded bg-white/[0.04]" />
                  <div className="h-2.5 rounded bg-white/[0.04] w-3/4" />
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
                className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-[13px] font-bold border border-white/10">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white/85 text-[14px] font-medium truncate">{student.lastName} {student.firstName}</p>
                    <p className="text-white/25 text-[11px]">{student.admissionNumber}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[12px]">
                    <GraduationCap className="w-3.5 h-3.5 text-white/25" />
                    <span className="text-white/40">{student.class?.name || "Unassigned"}</span>
                  </div>
                  {student.guardianName && (
                    <div className="flex items-center gap-2 text-[12px]">
                      <Phone className="w-3.5 h-3.5 text-white/25" />
                      <span className="text-white/40 truncate">{student.guardianName}</span>
                    </div>
                  )}
                  {student.email && (
                    <div className="flex items-center gap-2 text-[12px]">
                      <Mail className="w-3.5 h-3.5 text-white/25" />
                      <span className="text-white/40 truncate">{student.email}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    student.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-white/[0.05] text-white/30"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${student.status === "active" ? "bg-emerald-400" : "bg-white/30"}`} />
                    {student.status}
                  </span>
                  <span className="text-white/20 text-[10px]">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[var(--sidebar)]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold">Add New Student</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/70 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">First Name *</label>
                    <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Last Name *</label>
                    <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Admission No.</label>
                    <input type="text" value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
                      placeholder="Auto-generated if empty" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="student@email.com" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Class</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                    style={{ colorScheme: "dark" }}>
                    <option value="" style={{ background: "#0f1b33", color: "#fff" }}>Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id} style={{ background: "#0f1b33", color: "#fff" }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Guardian Name</label>
                    <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                      placeholder="Parent/Guardian name" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Guardian Phone</label>
                    <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                      placeholder="+234..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/[0.05] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Student
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

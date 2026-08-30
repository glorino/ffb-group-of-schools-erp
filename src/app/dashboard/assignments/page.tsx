"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Filter,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

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

interface ClassOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface Submission {
  id: string;
  content: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  student: { id: string; firstName: string; lastName: string; admissionNumber: string };
}

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

  const [form, setForm] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    dueDate: "",
    totalMarks: 100,
    type: "homework",
  });

  const [submitForm, setSubmitForm] = useState({ content: "" });
  const [gradeForm, setGradeForm] = useState({ score: 0, feedback: "" });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        const roles = (d?.user as any)?.roles?.map((r: any) => r.name) || [];
        setUserRoles(roles);
        setIsStudent(roles.includes("STUDENT"));
      })
      .catch(() => {});
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
    } catch {
      setAssignments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, classFilter, subjectFilter]);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((d) => setClasses(d.classes || d || []))
      .catch(() => {});
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => {});
  }, []);

  const filteredAssignments = useMemo(() => {
    if (!search) return assignments;
    return assignments.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.subject?.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [assignments, search]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const handleCreate = async () => {
    if (!form.title || !form.classId || !form.subjectId || !form.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          classId: form.classId,
          subjectId: form.subjectId,
          dueDate: form.dueDate,
          totalMarks: form.totalMarks,
          type: form.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");
      toast.success("Assignment created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAssignment.id,
          title: form.title,
          description: form.description || undefined,
          classId: form.classId,
          subjectId: form.subjectId,
          dueDate: form.dueDate,
          totalMarks: form.totalMarks,
          type: form.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update assignment");
      toast.success("Assignment updated successfully");
      setShowEditModal(false);
      setSelectedAssignment(null);
      resetForm();
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Assignment deleted");
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !submitForm.content) {
      toast.error("Please enter your submission content");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: submitForm.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      toast.success("Assignment submitted successfully");
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmitForm({ content: "" });
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedAssignment || !selectedSubmission) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          score: gradeForm.score,
          feedback: gradeForm.feedback || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade");
      toast.success("Submission graded successfully");
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeForm({ score: 0, feedback: "" });
      loadAssignmentDetail(selectedAssignment.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadAssignmentDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`);
      const data = await res.json();
      setDetailAssignment(data.assignment);
      setShowDetailModal(true);
    } catch {
      toast.error("Failed to load assignment details");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", classId: "", subjectId: "", dueDate: "", totalMarks: 100, type: "homework" });
  };

  const openEditModal = (a: Assignment) => {
    setSelectedAssignment(a);
    setForm({
      title: a.title,
      description: a.description || "",
      classId: a.class.id,
      subjectId: a.subject.id,
      dueDate: new Date(a.dueDate).toISOString().slice(0, 16),
      totalMarks: a.totalMarks,
      type: a.type,
    });
    setShowEditModal(true);
  };

  const openSubmitModal = (a: Assignment) => {
    setSelectedAssignment(a);
    setSubmitForm({ content: "" });
    setShowSubmitModal(true);
  };

  const openGradeModal = (a: Assignment, s: Submission) => {
    setSelectedAssignment(a);
    setSelectedSubmission(s);
    setGradeForm({ score: s.grade ?? 0, feedback: s.feedback || "" });
    setShowGradeModal(true);
  };

  const stats = useMemo(() => {
    const total = assignments.length;
    const overdue = assignments.filter((a) => isOverdue(a.dueDate) && a.status === "active").length;
    const submissions = assignments.reduce((sum, a) => sum + (a._count?.submissions || 0), 0);
    const graded = assignments.filter((a) => a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined).length;
    return { total, overdue, submissions, graded };
  }, [assignments]);

  return (
    <motion.div {...fadeIn} className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] rounded-2xl p-8 border border-white/10 mt-8 mx-4" style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Assignments</h1>
            <p className="text-white/70 text-[13px]">Manage and track class assignments</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {!isStudent && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-white text-[#0055ff] text-[13px] font-semibold hover:bg-white/90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Assignment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Assignments", value: stats.total, icon: BookOpen, color: "text-[#0055ff]" },
          { label: "Submissions", value: stats.submissions, icon: FileText, color: "text-[#8b5cf6]" },
          { label: "Overdue", value: stats.overdue, icon: AlertCircle, color: "text-[#ef4444]" },
          ...(isStudent
            ? [{ label: "Graded", value: stats.graded, icon: Award, color: "text-[#10b981]" }]
            : []),
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-[#f8fafc] ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[22px] font-bold text-[#1a1a2e]">{stat.value}</p>
                <p className="text-[11px] text-[#94a3b8] font-medium">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search pl-10"
          />
        </div>
        {!isStudent && (
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
        )}
        <select
          value={subjectFilter}
          onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
          className="select-field"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Assignments List */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Assignment</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Class</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Subject</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wider hidden sm:table-cell">Status</th>
                {!isStudent && (
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Submissions</th>
                )}
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#f1f5f9]">
                    <td colSpan={isStudent ? 6 : 7} className="px-5 py-4">
                      <div className="h-4 rounded-lg bg-[#f8fafc] animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={isStudent ? 6 : 7} className="px-5 py-16 text-center">
                    <BookOpen className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                    <p className="text-[#94a3b8] text-sm">No assignments found</p>
                    <p className="text-[#94a3b8] text-[11px] mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a, i) => {
                  const overdue = isOverdue(a.dueDate);
                  const submitted = !!a.mySubmission;
                  const graded = a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined;

                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#f1f5f9] hover:bg-[#f1f5f9] transition cursor-pointer group"
                      onClick={() => loadAssignmentDetail(a.id)}
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-[#1a1a2e] text-[13px] font-medium">{a.title}</p>
                          <p className="text-[#94a3b8] text-[11px]">
                            {a.teacher.firstName} {a.teacher.lastName} &middot; {a.totalMarks} marks
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8fafc] text-[#64748b] text-[12px] font-medium border border-[#e2e8f0]">
                          {a.class.displayName || a.class.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="px-2.5 py-1 rounded-lg bg-[#dbeafe] text-[#2563eb] text-[12px] font-medium border border-[#dbeafe]">
                          {a.subject.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${overdue ? "text-[#ef4444]" : "text-[#94a3b8]"}`} />
                          <span className={`text-[12px] ${overdue ? "text-[#ef4444] font-medium" : "text-[#64748b]"}`}>
                            {new Date(a.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        {isStudent ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                            graded
                              ? "bg-[#dcfce7] text-[#16a34a] border border-[#dcfce7]"
                              : submitted
                              ? "bg-[#fef3c7] text-[#d97706] border border-[#fef3c7]"
                              : overdue
                              ? "bg-[#fee2e2] text-[#dc2626] border border-[#fee2e2]"
                              : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]"
                          }`}>
                            {graded ? (
                              <><CheckCircle2 className="w-3 h-3" /> Graded: {a.mySubmission!.grade}/{a.totalMarks}</>
                            ) : submitted ? (
                              <><Clock className="w-3 h-3" /> Submitted</>
                            ) : overdue ? (
                              <><AlertCircle className="w-3 h-3" /> Overdue</>
                            ) : (
                              "Pending"
                            )}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                            a.status === "active"
                              ? "bg-[#dcfce7] text-[#16a34a] border border-[#dcfce7]"
                              : "bg-[#f8fafc] text-[#94a3b8] border border-[#e2e8f0]"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-[#16a34a]" : "bg-[#94a3b8]"}`} />
                            {a.status}
                          </span>
                        )}
                      </td>
                      {!isStudent && (
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#f8fafc] text-[#1a1a2e] text-[13px] font-semibold border border-[#e2e8f0]">
                            {a._count?.submissions || 0}
                          </span>
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {isStudent && !submitted && !overdue && (
                            <button
                              onClick={() => openSubmitModal(a)}
                              className="px-3 py-1.5 rounded-lg bg-[#0055ff] text-white text-[11px] font-medium hover:bg-[#0044cc] transition flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /> Submit
                            </button>
                          )}
                          {isStudent && submitted && !graded && (
                            <span className="px-3 py-1.5 rounded-lg bg-[#fef3c7] text-[#d97706] text-[11px] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {isStudent && graded && (
                            <span className="px-3 py-1.5 rounded-lg bg-[#dcfce7] text-[#16a34a] text-[11px] font-medium flex items-center gap-1">
                              <Star className="w-3 h-3" /> {a.mySubmission!.grade}/{a.totalMarks}
                            </span>
                          )}
                          {!isStudent && (
                            <>
                              <button
                                onClick={() => openEditModal(a)}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition opacity-0 group-hover:opacity-100"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fee2e2]/30 transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content max-w-lg"
            >
              <div className="modal-header">
                <h3>Create Assignment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="input-label">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Assignment title"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Assignment instructions..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Class *</label>
                    <select
                      value={form.classId}
                      onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Subject *</label>
                    <select
                      value={form.subjectId}
                      onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Due Date *</label>
                    <input
                      type="datetime-local"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Total Marks</label>
                    <input
                      type="number"
                      value={form.totalMarks}
                      onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 100 })}
                      min={1}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="select-field"
                  >
                    <option value="homework">Homework</option>
                    <option value="classwork">Classwork</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                    <option value="lab">Lab Work</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreate} disabled={submitting} className="btn btn-primary disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Assignment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Assignment Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content max-w-lg"
            >
              <div className="modal-header">
                <h3>Edit Assignment</h3>
                <button onClick={() => setShowEditModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="input-label">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Class *</label>
                    <select
                      value={form.classId}
                      onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Subject *</label>
                    <select
                      value={form.subjectId}
                      onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Due Date *</label>
                    <input
                      type="datetime-local"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Total Marks</label>
                    <input
                      type="number"
                      value={form.totalMarks}
                      onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 100 })}
                      min={1}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="select-field"
                  >
                    <option value="homework">Homework</option>
                    <option value="classwork">Classwork</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                    <option value="lab">Lab Work</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleEdit} disabled={submitting} className="btn btn-primary disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Assignment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Assignment Modal */}
      <AnimatePresence>
        {showSubmitModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content max-w-lg"
            >
              <div className="modal-header">
                <h3>Submit: {selectedAssignment.title}</h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <div className="flex items-center gap-2 text-[12px] text-[#64748b]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{selectedAssignment.subject.name} &middot; {selectedAssignment.class.displayName || selectedAssignment.class.name}</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-1">
                    Due: {new Date(selectedAssignment.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="form-group">
                  <label className="input-label">Your Submission *</label>
                  <textarea
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                    placeholder="Type your answer or paste your work here..."
                    rows={6}
                    className="input-field resize-none"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Submit Assignment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grade Submission Modal */}
      <AnimatePresence>
        {showGradeModal && selectedSubmission && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowGradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content max-w-lg"
            >
              <div className="modal-header">
                <h3>Grade Submission</h3>
                <button onClick={() => setShowGradeModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <p className="text-[13px] font-medium text-[#1a1a2e]">
                    {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
                  </p>
                  <p className="text-[11px] text-[#94a3b8]">{selectedSubmission.student.admissionNumber}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-1">
                    Submitted: {new Date(selectedSubmission.submittedAt).toLocaleDateString("en-NG")}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] max-h-40 overflow-y-auto">
                  <p className="text-[12px] text-[#64748b] whitespace-pre-wrap">{selectedSubmission.content}</p>
                </div>
                <div className="form-group">
                  <label className="input-label">Score (out of {selectedAssignment.totalMarks}) *</label>
                  <input
                    type="number"
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) || 0 })}
                    min={0}
                    max={selectedAssignment.totalMarks}
                    step={0.5}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Feedback</label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="Optional feedback for the student..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowGradeModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleGrade} disabled={submitting} className="btn btn-primary disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Award className="w-4 h-4" />
                  Save Grade
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment Detail Modal */}
      <AnimatePresence>
        {showDetailModal && detailAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="modal-header">
                <h3>{detailAssignment.title}</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">Class</p>
                    <p className="text-[13px] text-[#1a1a2e] font-medium mt-0.5">{detailAssignment.class.displayName || detailAssignment.class.name}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">Subject</p>
                    <p className="text-[13px] text-[#1a1a2e] font-medium mt-0.5">{detailAssignment.subject.name}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">Due Date</p>
                    <p className="text-[13px] text-[#1a1a2e] font-medium mt-0.5">
                      {new Date(detailAssignment.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">Total Marks</p>
                    <p className="text-[13px] text-[#1a1a2e] font-medium mt-0.5">{detailAssignment.totalMarks}</p>
                  </div>
                </div>

                {detailAssignment.description && (
                  <div className="p-3 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0]">
                    <p className="text-[12px] text-[#64748b] whitespace-pre-wrap">{detailAssignment.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Submissions ({detailAssignment.submissions?.length || 0})
                  </h4>
                  {detailAssignment.submissions?.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                      <FileText className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                      <p className="text-[#94a3b8] text-[12px]">No submissions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {detailAssignment.submissions.map((s: Submission) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] transition"
                        >
                          <div>
                            <p className="text-[13px] font-medium text-[#1a1a2e]">
                              {s.student.firstName} {s.student.lastName}
                            </p>
                            <p className="text-[11px] text-[#94a3b8]">
                              {s.student.admissionNumber} &middot; {new Date(s.submittedAt).toLocaleDateString("en-NG")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {s.grade !== null ? (
                              <span className="px-2.5 py-1 rounded-lg bg-[#dcfce7] text-[#16a34a] text-[11px] font-medium">
                                {s.grade}/{detailAssignment.totalMarks}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#fef3c7] text-[#d97706] text-[11px] font-medium">
                                Not Graded
                              </span>
                            )}
                            {!isStudent && s.grade === null && (
                              <button
                                onClick={() => {
                                  setShowDetailModal(false);
                                  openGradeModal(detailAssignment, s);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#0055ff] text-white text-[11px] font-medium hover:bg-[#0044cc] transition flex items-center gap-1"
                              >
                                <Award className="w-3 h-3" /> Grade
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

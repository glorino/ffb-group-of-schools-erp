"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  qualification: string | null;
  specialization: string | null;
  email: string | null;
  phone: string | null;
  hireDate: string;
  status: string;
  teacherSubjects: { subject: { name: string } }[];
}

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", employeeId: "",
    qualification: "", specialization: "", password: "",
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/teachers?${params}`);
      const d = await res.json();
      setTeachers(d.teachers ?? []);
      setTotal(d.pagination?.total ?? 0);
      setTotalPages(d.pagination?.pages ?? 1);
    } catch {
      setTeachers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, search]);

  const activeCount = teachers.filter((t) => t.status === "active").length;
  const subjectsSet = new Set(teachers.flatMap((t) => t.teacherSubjects?.map((ts) => ts.subject.name) ?? []));

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.employeeId) {
      toast.error("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      const teacherRes = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName, employeeId: form.employeeId,
          email: form.email || undefined, phone: form.phone || undefined,
          qualification: form.qualification || undefined, specialization: form.specialization || undefined,
        }),
      });
      const teacherData = await teacherRes.json();
      if (!teacherRes.ok) throw new Error(teacherData.error || "Failed to create teacher");

      if (form.email) {
        const userRes = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email, name: `${form.firstName} ${form.lastName}`,
            password: form.password, phone: form.phone || undefined, role: "TEACHER",
          }),
        });
        if (userRes.ok) {
          try {
            await fetch("/api/emails/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "welcome", to: form.email,
                name: `${form.firstName} ${form.lastName}`,
                role: "Teacher", password: form.password,
              }),
            });
          } catch {}
        }
      }

      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", employeeId: "", qualification: "", specialization: "", password: "" });
      toast.success("Teacher created successfully");
      setPage(1);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!teachers.length) { toast.info("No data to export"); return; }
    downloadCSV(teachers.map(t => ({
      Name: `${t.firstName} ${t.lastName}`,
      EmployeeID: t.employeeId,
      Email: t.email || "",
      Phone: t.phone || "",
      Qualification: t.qualification || "",
      Specialization: t.specialization || "",
      Subjects: t.teacherSubjects?.map(ts => ts.subject.name).join(", ") || "",
      Status: t.status,
    })), "teachers_directory");
    toast.success("Exported successfully");
  };

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ marginTop: "32px", borderRadius: "20px", padding: "32px 36px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Teacher Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage employee records, qualifications, and performance tracking</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={handleExport} style={{ padding: "10px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Download style={{ width: "14px", height: "14px" }} /> Export
            </button>
            <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", background: "#ffffff", color: "#0055ff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
              <UserPlus style={{ width: "14px", height: "14px" }} /> Add Teacher
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Teachers", value: String(total), icon: Users, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
          { label: "Active Teachers", value: String(activeCount), icon: TrendingUp, bg: "linear-gradient(135deg, #10b981, #059669)" },
          { label: "Subjects Covered", value: String(subjectsSet.size || 0), icon: BookOpen, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
          { label: "Departments", value: "—", icon: Award, bg: "linear-gradient(135deg, #f472b6, #ec4899)" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <kpi.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{kpi.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
          <input type="text" placeholder="Search by name, employee ID, or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", padding: "11px 16px 11px 42px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Teacher Directory</h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{total} teachers</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["Teacher", "Subjects", "Qualification", "Contact", "Status"].map((label) => (
                  <th key={label} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                    {label}
                  </th>
                ))}
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
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "64px 20px", textAlign: "center" }}>
                    <Users style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>No teachers found</p>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>Try adjusting your search</p>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const initials = `${teacher.firstName?.[0] || ""}${teacher.lastName?.[0] || ""}`.toUpperCase();
                  const subjectNames = teacher.teacherSubjects?.map(ts => ts.subject.name).join(", ") || "—";
                  return (
                    <tr key={teacher.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }} onClick={() => router.push(`/dashboard/teachers/${teacher.id}`)} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0055ff, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ margin: 0, color: "#0f172a", fontSize: "13px", fontWeight: 500 }}>{teacher.firstName} {teacher.lastName}</p>
                            <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "11px" }}>{teacher.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ color: "#475569", fontSize: "12px", maxWidth: "200px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subjectNames}</span>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#475569", fontSize: "12px" }}>{teacher.qualification || "—"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div>
                          <p style={{ margin: 0, color: "#0f172a", fontSize: "13px" }}>{teacher.email || "—"}</p>
                          {teacher.phone && <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "11px" }}>{teacher.phone}</p>}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, ...(teacher.status === "active" ? { background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" } : { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }) }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: teacher.status === "active" ? "#16a34a" : "#dc2626" }} />
                          {teacher.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === teacher.id ? null : teacher.id); }} style={{ padding: "6px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MoreHorizontal style={{ width: "16px", height: "16px" }} />
                          </button>
                          {openMenu === teacher.id && (
                            <div style={{ position: "absolute", right: 0, top: "32px", width: "144px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden" }}>
                              <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/teachers/${teacher.id}`); setOpenMenu(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#475569", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                <Eye style={{ width: "14px", height: "14px" }} /> View Profile
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/teachers/${teacher.id}?edit=true`); setOpenMenu(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#475569", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                <Edit3 style={{ width: "14px", height: "14px" }} /> Edit
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
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>Page {page} of {totalPages} &middot; {total} teachers</p>
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

      {/* Add Teacher Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Add New Teacher</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px", borderRadius: "10px", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Employee ID *</label>
                <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. TCH001" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="teacher@ffb.edu.ng" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Qualification</label>
                  <input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. B.Sc, PGDE" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Specialization</label>
                  <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Mathematics" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {form.email && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Login Password</label>
                  <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "11px" }}>Login credentials will be created for this teacher</p>
                </div>
              )}
            </div>
            <div style={{ padding: "20px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} disabled={submitting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
                Create Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

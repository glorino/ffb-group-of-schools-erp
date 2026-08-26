"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Filter,
  Award,
  BookOpen,
  TrendingUp,
  MoreVertical,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
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

interface TeachersResponse {
  teachers: Teacher[];
  total: number;
}

export default function TeachersPage() {
  const router = useRouter();
  const [data, setData] = useState<TeachersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", employeeId: "",
    qualification: "", specialization: "", password: "",
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);

    fetch(`/api/teachers?${params}`)
      .then((res) => res.json())
      .then((d) => {
        setData({ teachers: d.teachers ?? [], total: d.pagination?.total ?? 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

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
        const userData = await userRes.json();
        if (userRes.ok) {
          try {
            await fetch("/api/emails/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "welcome",
                to: form.email,
                name: `${form.firstName} ${form.lastName}`,
                role: "Teacher",
                password: form.password,
              }),
            });
          } catch {}
        }
      }

      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", employeeId: "", qualification: "", specialization: "", password: "" });
      toast.success("Teacher created successfully");
      setLoading(true);
      fetch(`/api/teachers?page=${page}&limit=10${search ? `&search=${search}` : ""}`)
        .then(r => r.json())
        .then(d => setData({ teachers: d.teachers ?? [], total: d.pagination?.total ?? 0 }))
        .finally(() => setLoading(false));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!data?.teachers?.length) {
      toast.info("No data to export");
      return;
    }
    downloadCSV(data.teachers.map(t => ({
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

  const columns = [
    {
      key: "name",
      label: "Teacher",
      render: (row: Teacher) => (
        <button
          onClick={() => router.push(`/dashboard/teachers/${row.id}`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="text-[#1a1a2e] text-sm font-medium">{row.firstName} {row.lastName}</p>
            <p className="text-[#64748b] text-xs">{row.employeeId}</p>
          </div>
        </button>
      ),
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (row: Teacher) =>
        row.teacherSubjects?.map((ts) => ts.subject.name).join(", ") || "—",
    },
    {
      key: "qualification",
      label: "Qualification",
      render: (row: Teacher) => row.qualification || "—",
    },
    {
      key: "email",
      label: "Contact",
      render: (row: Teacher) => (
        <span className="text-[#475569] text-sm">{row.email || row.phone || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Teacher) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-[#dcfce7] text-[#16a34a]"
              : "bg-[#fee2e2] text-[#dc2626]"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <div className="relative group">
          <button className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
            <MoreVertical className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-8 z-[60] hidden group-hover:block bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-1 min-w-[120px]">
            <button onClick={() => router.push(`/dashboard/teachers/${row.id}`)} className="w-full text-left px-3 py-2 text-[12px] text-[#475569] hover:bg-[#f1f5f9]">View Profile</button>
            <button onClick={() => router.push(`/dashboard/teachers/${row.id}?edit=true`)} className="w-full text-left px-3 py-2 text-[12px] text-[#475569] hover:bg-[#f1f5f9]">Edit</button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="section-header">
          <div>
            <h1 className="section-title">Teacher Management</h1>
            <p className="section-subtitle">Manage employee records, qualifications, and performance tracking</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </motion.div>

      <div className="stats-grid-4">
        {[
          { label: "Total Teachers", value: String(data?.total ?? 0), icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Active Teachers", value: String(data?.teachers?.filter((t) => t.status === "active").length ?? 0), icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
          { label: "Subjects Covered", value: String(new Set(data?.teachers?.flatMap((t) => t.teacherSubjects?.map((ts) => ts.subject.name) ?? [])).size || 0), icon: BookOpen, color: "from-purple-500 to-purple-600" },
          { label: "Departments", value: "—", icon: Award, color: "from-[var(--accent)] to-emerald-400" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`stat-card-icon bg-gradient-to-br ${kpi.color}`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-label">{kpi.label}</p>
              <p className="stat-card-value">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="table-container"
      >
        <div className="table-header">
          <h3>Teacher Directory</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input-search pl-9 w-full sm:w-48"
              />
            </div>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={data?.teachers ?? []}
          loading={loading}
          searchable={false}
          pagination={false}
          emptyMessage="No teachers found"
        />
        {data && data.total > 10 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
            <p className="text-[#64748b] text-[12px]">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} of {data.total}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= data.total}
                className="btn btn-secondary disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Teacher Modal */}
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
              className="modal-content max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3>Add New Teacher</h3>
                <button onClick={() => setShowModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition">
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
                <div className="form-group">
                  <label className="input-label">Employee ID *</label>
                  <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    placeholder="e.g. TCH001" className="input-field" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="teacher@ffb.edu.ng" className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Phone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+234..." className="input-field" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Qualification</label>
                    <input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      placeholder="e.g. B.Sc, PGDE" className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Specialization</label>
                    <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      placeholder="e.g. Mathematics" className="input-field" />
                  </div>
                </div>
                {form.email && (
                  <div className="form-group">
                    <label className="input-label">Login Password</label>
                    <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field" />
                    <p className="text-[#94a3b8] text-[10px] mt-1">Login credentials will be created for this teacher</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="btn btn-primary disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Teacher
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

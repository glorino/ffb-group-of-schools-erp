"use client";

import { useEffect, useState } from "react";
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
  const [data, setData] = useState<TeachersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", employeeId: "",
    qualification: "", specialization: "", password: "teacher123",
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
      .catch(console.error)
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
      setForm({ firstName: "", lastName: "", email: "", phone: "", employeeId: "", qualification: "", specialization: "", password: "teacher123" });
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{row.firstName} {row.lastName}</p>
            <p className="text-white/40 text-xs">{row.employeeId}</p>
          </div>
        </div>
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
        <span className="text-white/60 text-sm">{row.email || row.phone || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Teacher) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: () => (
        <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Teacher Management</h1>
            <p className="text-white/60">
              Manage employee records, qualifications, and performance tracking
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Teacher Directory</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-white/40 text-sm">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= data.total}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 disabled:opacity-30"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[var(--sidebar)]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold">Add New Teacher</h3>
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
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Employee ID *</label>
                  <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    placeholder="e.g. TCH001" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="teacher@ffb.edu.ng" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Phone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+234..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Qualification</label>
                    <input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      placeholder="e.g. B.Sc, PGDE" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Specialization</label>
                    <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      placeholder="e.g. Mathematics" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
                {form.email && (
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Login Password</label>
                    <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50" />
                    <p className="text-white/25 text-[10px] mt-1">Login credentials will be created for this teacher</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/[0.05] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2">
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

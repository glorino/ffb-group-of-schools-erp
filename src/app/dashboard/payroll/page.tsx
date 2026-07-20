"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Plus,
  Search,
  Download,
  CheckCircle,
  Clock,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface PayrollEntry {
  id: string;
  teacherId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paidAt: string | null;
  teacher: { id: string; firstName: string; lastName: string; employeeId: string };
}

interface PayrollStats {
  totalNet: number;
  totalDeductions: number;
  paidCount: number;
  pendingCount: number;
  total: number;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(String(new Date().getMonth() + 1));
  const [currentYear, setCurrentYear] = useState(String(new Date().getFullYear()));
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; firstName: string; lastName: string; employeeId: string }[]>([]);
  const [form, setForm] = useState({ teacherId: "", basicSalary: "", allowances: "", deductions: "" });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/payroll?month=${currentMonth}&year=${currentYear}`)
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls || []); setStats(d.stats || null); })
      .catch(() => { setPayrolls([]); toast.error("Failed to load payroll"); })
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetch("/api/teachers?limit=100")
      .then(r => r.json())
      .then(d => setTeachers(d.teachers || []))
      .catch(() => {});
  }, []);

  const filtered = payrolls.filter(p =>
    !search || `${p.teacher.firstName} ${p.teacher.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.teacherId || !form.basicSalary) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: form.teacherId, month: currentMonth, year: currentYear,
          basicSalary: parseFloat(form.basicSalary),
          allowances: parseFloat(form.allowances || "0"),
          deductions: parseFloat(form.deductions || "0"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setShowModal(false);
      setForm({ teacherId: "", basicSalary: "", allowances: "", deductions: "" });
      toast.success("Payroll entry created");
      fetch(`/api/payroll?month=${currentMonth}&year=${currentYear}`)
        .then(r => r.json())
        .then(d => { setPayrolls(d.payrolls || []); setStats(d.stats || null); });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "paid" }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p));
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  const monthLabel = `${monthNames[parseInt(currentMonth) - 1]} ${currentYear}`;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Payroll Management</h1>
            <p className="text-white/60">Manage teacher salaries, allowances, deductions, and payments</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                downloadCSV(filtered.map(p => ({
                  Name: `${p.teacher.firstName} ${p.teacher.lastName}`,
                  "Employee ID": p.teacher.employeeId,
                  Month: monthLabel,
                  "Basic Salary": p.basicSalary,
                  Allowances: p.allowances,
                  Deductions: p.deductions,
                  "Net Pay": p.netSalary,
                  Status: p.status,
                })), `payroll_${monthLabel}`);
                toast.success("Exported successfully");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: String(stats?.total || 0), color: "from-blue-500 to-blue-600" },
          { label: "Total Net Pay", value: fmt(stats?.totalNet || 0), color: "from-emerald-500 to-emerald-600" },
          { label: "Pending Payments", value: String(stats?.pendingCount || 0), color: "from-orange-500 to-orange-600" },
          { label: "Processed", value: String(stats?.paidCount || 0), color: "from-purple-500 to-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Wallet className="w-6 h-6 text-white" />
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
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold text-lg">{monthLabel} Payroll</h3>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs outline-none"
              style={{ colorScheme: "dark" }}
            >
              {monthNames.map((m, i) => (
                <option key={i} value={String(i + 1)} style={{ background: "#0f1b33", color: "#fff" }}>{m}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs outline-none"
              style={{ colorScheme: "dark" }}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y} style={{ background: "#0f1b33", color: "#fff" }}>{y}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Staff</th>
                  <th className="text-right text-white/50 text-sm font-medium pb-3">Basic Salary</th>
                  <th className="text-right text-white/50 text-sm font-medium pb-3">Allowances</th>
                  <th className="text-right text-white/50 text-sm font-medium pb-3">Deductions</th>
                  <th className="text-right text-white/50 text-sm font-medium pb-3">Net Pay</th>
                  <th className="text-center text-white/50 text-sm font-medium pb-3">Status</th>
                  <th className="text-right text-white/50 text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30 text-sm">No payroll entries for this period</td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-xs">
                          {p.teacher.firstName[0]}{p.teacher.lastName[0]}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{p.teacher.firstName} {p.teacher.lastName}</p>
                          <p className="text-white/40 text-xs">{p.teacher.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-white/70 text-sm text-right">{fmt(p.basicSalary)}</td>
                    <td className="py-3 text-emerald-400 text-sm text-right">{fmt(p.allowances || 0)}</td>
                    <td className="py-3 text-red-400 text-sm text-right">{fmt(p.deductions || 0)}</td>
                    <td className="py-3 text-white font-medium text-sm text-right">{fmt(p.netSalary)}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        p.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {p.status === "pending" && (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/25 transition"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Payroll Modal */}
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
              className="w-full max-w-md bg-[var(--sidebar)]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold">Add Payroll Entry</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/70 transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Teacher *</label>
                  <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                    style={{ colorScheme: "dark" }}>
                    <option value="" style={{ background: "#0f1b33", color: "#fff" }}>Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id} style={{ background: "#0f1b33", color: "#fff" }}>{t.firstName} {t.lastName} ({t.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Basic Salary (₦) *</label>
                  <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                    placeholder="e.g. 300000" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Allowances (₦)</label>
                    <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                      placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Deductions (₦)</label>
                    <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                      placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[var(--primary)]/25">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

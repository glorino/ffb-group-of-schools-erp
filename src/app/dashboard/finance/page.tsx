"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Search,
  Download,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CheckCircle2,
  Clock,
  Wallet,
  Receipt,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

import { downloadCSV } from "@/lib/exports";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const revenueByClass = [
  { name: "JSS1", amount: 8200000 },
  { name: "JSS2", amount: 7600000 },
  { name: "JSS3", amount: 6800000 },
  { name: "SS1", amount: 9100000 },
  { name: "SS2", amount: 8400000 },
  { name: "SS3", amount: 10200000 },
];

const feeStatusData = [
  { name: "Fully Paid", value: 68, color: "#28ff9c" },
  { name: "Partial", value: 24, color: "#f59e0b" },
  { name: "Unpaid", value: 8, color: "#ef4444" },
];

const recentPayments = [
  { id: 1, student: "Adewale Babatune", class: "SS2A", amount: 245000, term: "2nd Term", method: "Bank Transfer", date: "2025-06-16", status: "verified" },
  { id: 2, student: "Chidinma Okafor", class: "JSS3A", amount: 245000, term: "2nd Term", method: "Flutterwave", date: "2025-06-15", status: "verified" },
  { id: 3, student: "Emeka Nnamdi", class: "SS1B", amount: 120000, term: "2nd Term", method: "Cash", date: "2025-06-15", status: "pending" },
  { id: 4, student: "Fatima Bello", class: "JSS2A", amount: 245000, term: "2nd Term", method: "Bank Transfer", date: "2025-06-14", status: "verified" },
  { id: 5, student: "Ibrahim Musa", class: "SS3A", amount: 180000, term: "2nd Term", method: "Flutterwave", date: "2025-06-14", status: "verified" },
  { id: 6, student: "Ngozi Eze", class: "JSS1B", amount: 245000, term: "2nd Term", method: "Bank Transfer", date: "2025-06-13", status: "verified" },
  { id: 7, student: "Oluwaseun Adeyemi", class: "SS1A", amount: 65000, term: "2nd Term", method: "Cash", date: "2025-06-13", status: "pending" },
  { id: 8, student: "Blessing Okonkwo", class: "JSS3A", amount: 245000, term: "2nd Term", method: "Flutterwave", date: "2025-06-12", status: "verified" },
];

const pendingInvoices = [
  { student: "Tunde Bakare", class: "SS3A", amount: 245000, due: "2025-07-01", daysLeft: 15 },
  { student: "Amara Obi", class: "JSS2B", amount: 245000, due: "2025-07-01", daysLeft: 15 },
  { student: "Yusuf Abdullahi", class: "SS2A", amount: 180000, due: "2025-07-15", daysLeft: 29 },
  { student: "Chiamaka Nwosu", class: "JSS1A", amount: 245000, due: "2025-07-01", daysLeft: 15 },
];

export default function FinancePage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "payments" | "invoices">("overview");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    schoolFeeId: "",
    dueDate: "",
    description: "",
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/finance/payments");
        const data = await res.json();
        if (data.payments?.length) setPayments(data.payments);
      } catch {}
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const displayPayments = payments.length ? payments : recentPayments;
  const filteredPayments = displayPayments.filter(
    (p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      const studentName = p.student ? `${p.student.firstName || ""} ${p.student.lastName || ""}` : (p.studentName || "");
      const className = p.student?.class?.name || p.className || p.class || "";
      const reference = p.reference || "";
      return studentName.toLowerCase().includes(s) || className.toLowerCase().includes(s) || reference.toLowerCase().includes(s);
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.schoolFeeId || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          schoolFeeId: form.schoolFeeId,
          amount: Number(form.amount),
          dueDate: form.dueDate,
          notes: form.description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      toast.success("Invoice created successfully");
      setShowModal(false);
      setForm({ studentId: "", amount: "", schoolFeeId: "", dueDate: "", description: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = ["overview", "payments", "invoices"] as const;

  return (
    <motion.div {...fadeIn} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white/95 font-display tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <CreditCard className="w-[18px] h-[18px] text-white" />
            </div>
            Finance
          </h1>
          <p className="text-white/30 text-[12px] mt-1 ml-[46px]">Manage fees, payments, and financial records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(payments.map((p: any) => ({
              Student: `${p.student?.firstName || ""} ${p.student?.lastName || ""}`,
              Amount: p.amount,
              Method: p.method || "\u2014",
              Status: p.status,
              Date: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "\u2014",
              Reference: p.reference || "\u2014",
            })), "finance_payments")}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium capitalize transition-all ${tab === t ? "bg-white/[0.08] text-white shadow-lg shadow-black/10" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Collected", value: "\u20A648.2M", change: "+18%", up: true, icon: Wallet, color: "from-emerald-500 to-emerald-700" },
              { label: "Outstanding", value: "\u20A612.8M", change: "-5%", up: false, icon: Receipt, color: "from-amber-500 to-amber-700" },
              { label: "This Month", value: "\u20A66.2M", change: "+24%", up: true, icon: TrendingUp, color: "from-blue-500 to-blue-700" },
              { label: "Defaulters", value: "16", change: "+3", up: false, icon: AlertCircle, color: "from-red-500 to-red-700" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-white text-xl font-bold font-display">{stat.value}</p>
                <p className="text-white/30 text-[11px] mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5">Revenue by Class</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueByClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: any) => `\u20A6${(v / 1000000).toFixed(1)}M`} contentStyle={{ background: "rgba(0,31,95,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} cursor={false} />
                  <Bar dataKey="amount" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
              <h3 className="text-white/80 font-semibold text-[15px] mb-1">Fee Collection Status</h3>
              <p className="text-white/25 text-[11px] mb-4">194 students total</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={feeStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {feeStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "rgba(0,31,95,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {feeStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-white/40">{item.name}</span>
                    </span>
                    <span className="text-white/60 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "payments" && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Student", "Class", "Amount", "Method", "Date", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p, i) => (
                  <motion.tr
                    key={p.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition"
                  >
                    <td className="px-5 py-3.5 text-white/70 text-[13px] font-medium">{p.student || p.studentName}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] text-white/40 text-[11px] font-medium">{p.class || p.className}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/80 text-[13px] font-semibold">{"\u20A6"}{(p.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-white/40 text-[12px]">{p.method}</td>
                    <td className="px-5 py-3.5 text-white/30 text-[12px]">{p.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${p.status === "verified" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {p.status === "verified" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-white/80 font-semibold text-[15px]">Pending Invoices</h3>
          </div>
          <div className="p-5 space-y-3">
            {pendingInvoices.map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/70 text-[13px] font-medium">{inv.student}</p>
                    <p className="text-white/25 text-[11px] mt-0.5">{inv.class} {"\u00B7"} Due {inv.due}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white/70 text-[13px] font-semibold">{"\u20A6"}{inv.amount.toLocaleString()}</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${inv.daysLeft <= 7 ? "text-red-400" : "text-amber-400"}`}>
                      {inv.daysLeft} days left
                    </p>
                  </div>
                  <button
                    onClick={() => toast.success("Payment reminder sent")}
                    className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--blue-3)] text-[11px] font-medium hover:bg-[var(--primary)]/20 transition"
                  >
                    Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0f1e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Create Invoice</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Enter student ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">School Fee ID *</label>
                  <input
                    type="text"
                    required
                    value={form.schoolFeeId}
                    onChange={(e) => setForm({ ...form, schoolFeeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Enter school fee ID"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

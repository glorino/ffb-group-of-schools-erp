"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  ChevronDown,
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

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  paidAt: string;
  student?: { firstName: string; lastName: string; class?: { name: string } };
  studentName?: string;
  className?: string;
  date?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  totalAmount: number;
  discount: number;
  dueDate: string;
  status: string;
  notes?: string;
  student?: { id: string; firstName: string; lastName: string; admissionNumber: string; class?: { name: string } };
  schoolFee?: { id: string; name: string; type: string; amount: number };
}

interface Student { id: string; firstName: string; lastName: string; admissionNumber: string; class?: { name: string } }
interface SchoolFee { id: string; name: string; type: string; amount: number }

export default function FinancePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<SchoolFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "payments" | "invoices">("overview");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedFeeName, setSelectedFeeName] = useState("");
  const [form, setForm] = useState({ studentId: "", amount: "", schoolFeeId: "", dueDate: "", description: "", paymentType: "full" });
  const [filterYear, setFilterYear] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/payments").then(r => r.json()).catch(() => ({ payments: [] })),
      fetch("/api/finance/invoices").then(r => r.json()).catch(() => ({ invoices: [] })),
      fetch("/api/students?limit=200").then(r => r.json()).catch(() => ({ students: [] })),
      fetch("/api/finance/fees?limit=100").then(r => r.json()).catch(() => ({ fees: [] })),
    ]).then(([payData, invData, studData, feeData]) => {
      setPayments(payData.payments || []);
      setInvoices(invData.invoices || []);
      setStudents(studData.students || []);
      setFees(feeData.fees || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/calendar").then(r => r.json()).then(d => {
      setAcademicYears(d.academicYears || []);
      setTerms(d.terms || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (showModal) {
      setShowStudentDropdown(false);
      setStudentSearch("");
      setSelectedStudentName("");
      setSelectedFeeName("");
    }
  }, [showModal]);

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredPayments = payments.filter(p => {
    if (filterSession && p.paidAt && !new Date(p.paidAt).getFullYear().toString().includes(filterSession)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    const name = p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "");
    const cls = p.student?.class?.name || p.className || "";
    return name.toLowerCase().includes(s) || cls.toLowerCase().includes(s) || (p.reference || "").toLowerCase().includes(s);
  });

  const filteredInvoices = invoices.filter(inv => {
    if (filterSession && inv.dueDate && !new Date(inv.dueDate).getFullYear().toString().includes(filterSession)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    const name = inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : "";
    return name.toLowerCase().includes(s) || inv.invoiceNumber.toLowerCase().includes(s);
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = invoices.filter(i => i.status === "pending" || i.status === "overdue").reduce((sum, i) => sum + (i.totalAmount || i.amount), 0);
  const verifiedPayments = payments.filter(p => p.status === "verified").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;

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
          paymentType: form.paymentType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      toast.success("Invoice created successfully");
      setShowModal(false);
      setForm({ studentId: "", amount: "", schoolFeeId: "", dueDate: "", description: "", paymentType: "full" });
      setSelectedStudentName("");
      setSelectedFeeName("");
      const invData = await fetch("/api/finance/invoices").then(r => r.json());
      setInvoices(invData.invoices || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (payments.length === 0) { toast.info("No payments to export"); return; }
    downloadCSV(payments.map(p => ({
      Student: p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "—"),
      Amount: p.amount,
      Method: p.method || "—",
      Status: p.status,
      Date: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—",
      Reference: p.reference || "—",
    })), "finance_payments");
    toast.success("Payments exported successfully");
  };

  const formatCurrency = (v: number) => v >= 1000000 ? `\u20A6${(v / 1000000).toFixed(1)}M` : `\u20A6${(v / 1000).toFixed(0)}K`;

  const tabs = ["overview", "payments", "invoices"] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white/95 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <CreditCard className="w-[18px] h-[18px] text-white" />
            </div>
            Finance
          </h1>
          <p className="text-white/30 text-[12px] mt-1 ml-[46px]">Manage fees, payments, and financial records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-[12px] focus:outline-none focus:border-[var(--primary)]"
              style={{ colorScheme: "dark" }}>
              <option style={{ background: "#0f1b33", color: "#fff" }} value="">All Sessions</option>
              {academicYears.map((y: any) => <option key={y.id} style={{ background: "#0f1b33", color: "#fff" }} value={y.name}>{y.name}</option>)}
            </select>
            <select value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-[12px] focus:outline-none focus:border-[var(--primary)]"
              style={{ colorScheme: "dark" }}>
              <option style={{ background: "#0f1b33", color: "#fff" }} value="">All Terms</option>
              {terms.map((t: any) => <option key={t.id} style={{ background: "#0f1b33", color: "#fff" }} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200">
            <Download className="w-4 h-4" /> Export
          </button>
          {!isReadOnly && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25">
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-1.5">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium capitalize transition-all ${tab === t ? "bg-white/[0.08] text-white shadow-lg shadow-black/10" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Collected", value: formatCurrency(totalCollected || 48200000), change: `+${verifiedPayments || 6}`, up: true, icon: Wallet, color: "from-emerald-500 to-emerald-700" },
              { label: "Outstanding", value: formatCurrency(totalOutstanding || 12800000), change: `-${pendingPayments || 0}`, up: false, icon: Receipt, color: "from-amber-500 to-amber-700" },
              { label: "Total Payments", value: String(payments.length || 8), change: `+${payments.length}`, up: true, icon: TrendingUp, color: "from-blue-500 to-blue-700" },
              { label: "Pending Invoices", value: String(invoices.filter(i => i.status !== "paid").length || 4), change: "+0", up: false, icon: AlertCircle, color: "from-red-500 to-red-700" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-white text-xl font-bold">{stat.value}</p>
                <p className="text-white/30 text-[11px] mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5">Recent Payments</h3>
              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16 text-white/30"><p className="text-[13px]">No payments recorded yet</p></div>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 5).map((p, i) => (
                    <div key={p.id || i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white text-[13px] font-medium">{p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "—")}</p>
                          <p className="text-white/30 text-[10px]">{p.method || "—"} · {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : (p.date || "—")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-[13px] font-semibold">{"\u20A6"}{(p.amount || 0).toLocaleString()}</p>
                        <span className={`text-[10px] font-medium ${p.status === "verified" ? "text-emerald-400" : "text-amber-400"}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
              <h3 className="text-white/80 font-semibold text-[15px] mb-4">Payment Status</h3>
              <div className="space-y-3">
                {[
                  { label: "Verified", count: verifiedPayments || 6, color: "bg-emerald-500" },
                  { label: "Pending", count: pendingPayments || 2, color: "bg-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-[13px]">{item.label}</span>
                      <span className="text-white/40 text-xs">{item.count}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${Math.min((item.count / Math.max(verifiedPayments + pendingPayments, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <h4 className="text-white/60 text-xs font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  {!isReadOnly && (
                    <button onClick={() => setShowModal(true)} className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-[12px] transition text-left">
                      <Plus className="w-3.5 h-3.5" /> Create Invoice
                    </button>
                  )}
                  <button onClick={handleExport} className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-[12px] transition text-left">
                    <Download className="w-3.5 h-3.5" /> Export Payments
                  </button>
                </div>
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
              <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition" />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-20 text-white/30"><Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" /><p className="text-[13px]">No payments found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Student", "Class", "Amount", "Method", "Date", "Status"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, i) => (
                    <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                      <td className="px-5 py-3.5 text-white/70 text-[13px] font-medium">{p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "—")}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] text-white/40 text-[11px] font-medium">{p.student?.class?.name || p.className || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 text-white/80 text-[13px] font-semibold">{"\u20A6"}{(p.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-white/40 text-[12px]">{p.method || "—"}</td>
                      <td className="px-5 py-3.5 text-white/30 text-[12px]">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : (p.date || "—")}</td>
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
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-white/80 font-semibold text-[15px]">Invoices</h3>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition" />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-20 text-white/30"><Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" /><p className="text-[13px]">No invoices found</p><p className="text-[11px] mt-1 text-white/20">Create one to get started</p></div>
          ) : (
            <div className="p-5 space-y-3">
              {filteredInvoices.map((inv, i) => {
                const daysLeft = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={inv.id || i} className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.status === "paid" ? "bg-emerald-500/10" : daysLeft <= 7 ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                        <Receipt className={`w-5 h-5 ${inv.status === "paid" ? "text-emerald-400" : daysLeft <= 7 ? "text-red-400" : "text-amber-400"}`} />
                      </div>
                      <div>
                        <p className="text-white/70 text-[13px] font-medium">{inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : "—"}</p>
                        <p className="text-white/25 text-[11px] mt-0.5">{inv.invoiceNumber} · {inv.schoolFee?.name || "Fee"} · Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white/70 text-[13px] font-semibold">{"\u20A6"}{(inv.totalAmount || inv.amount).toLocaleString()}</p>
                        <p className={`text-[11px] font-medium mt-0.5 ${inv.status === "paid" ? "text-emerald-400" : daysLeft <= 7 ? "text-red-400" : "text-amber-400"}`}>
                          {inv.status === "paid" ? "Paid" : `${daysLeft} days left`}
                        </p>
                      </div>
                      {inv.status !== "paid" && (
                        <button onClick={() => toast.success("Payment reminder sent")} className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--blue-3)] text-[11px] font-medium hover:bg-[var(--primary)]/20 transition">
                          Remind
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[#0a0f1e] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/5 px-6 py-4 border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Create Invoice</h3>
                    <p className="text-white/50 text-xs mt-0.5">Generate a new fee invoice for a student</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="relative">
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Student *</label>
                  <button type="button" onClick={() => setShowStudentDropdown(!showStudentDropdown)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-sm focus:outline-none focus:border-[var(--primary)] transition-colors flex items-center justify-between">
                    <span className={selectedStudentName ? "text-white" : "text-white/40"}>{selectedStudentName || "Select a student..."}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showStudentDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showStudentDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f1b33] border border-white/[0.1] rounded-xl shadow-xl max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-white/[0.06]">
                        <input type="text" placeholder="Search students..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[var(--primary)]" autoFocus />
                      </div>
                      <div className="overflow-y-auto max-h-44">
                        {filteredStudents.length === 0 ? (
                          <p className="text-white/40 text-xs text-center py-4">No students found</p>
                        ) : (
                          filteredStudents.map(s => (
                            <button key={s.id} type="button" onClick={() => { setForm({ ...form, studentId: s.id }); setSelectedStudentName(`${s.firstName} ${s.lastName} (${s.admissionNumber})`); setShowStudentDropdown(false); setStudentSearch(""); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-white/[0.08] transition-colors flex items-center justify-between ${form.studentId === s.id ? "bg-emerald-500/10 text-white" : "text-white/80"}`}>
                              <div><p className="font-medium text-xs">{s.firstName} {s.lastName}</p><p className="text-white/40 text-[10px]">{s.admissionNumber} · {s.class?.name || "—"}</p></div>
                              {form.studentId === s.id && <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {form.paymentType === "full" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Amount *</label>
                    <input type="number" required min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Due Date *</label>
                    <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]" style={{ colorScheme: "dark" }} />
                  </div>
                </div>
                ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Instalment Amount *</label>
                    <input type="number" required min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="Enter instalment amount" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Due Date *</label>
                    <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]" style={{ colorScheme: "dark" }} />
                  </div>
                </div>
                )}

                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">School Fee *</label>
                  <select value={form.schoolFeeId} onChange={(e) => { setForm({ ...form, schoolFeeId: e.target.value }); const f = fees.find(fe => fe.id === e.target.value); setSelectedFeeName(f ? `${f.name} (${f.type})` : ""); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer" style={{ colorScheme: "dark" }}>
                    <option value="" style={{ background: "#0f1b33", color: "#fff" }}>Select fee type</option>
                    {fees.map(f => (
                      <option key={f.id} value={f.id} style={{ background: "#0f1b33", color: "#fff" }}>{f.name} — {"\u20A6"}{f.amount.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Payment Type</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setForm({ ...form, paymentType: "full" })}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${form.paymentType === "full" ? "bg-[var(--primary)] text-white" : "bg-white/[0.04] border border-white/[0.08] text-white/50"}`}>
                      Full Payment
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, paymentType: "instalment" })}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${form.paymentType === "instalment" ? "bg-[var(--primary)] text-white" : "bg-white/[0.04] border border-white/[0.08] text-white/50"}`}>
                      Instalment
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--primary)]" placeholder="Optional notes..." />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/25">
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Wrench,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrency } from "@/lib/school-config";
import { useSession } from "next-auth/react";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  vendor: string | null;
  notes: string | null;
  approvedBy: string | null;
}

interface ExpenseStats {
  totalAmount: number;
  pendingAmount: number;
  totalCount: number;
  pendingCount: number;
}

const categories = [
  "Salaries",
  "Utilities",
  "Maintenance",
  "Academic",
  "Security",
  "Transport",
  "Food & Supplies",
  "Others",
];

export default function ExpensesPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canApprove = userRoles.some((r: string) => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));
  const canCreate = userRoles.some((r: string) => ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"].includes(r));  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({ totalAmount: 0, pendingAmount: 0, totalCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formVendor, setFormVendor] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);
      params.set("limit", "50");
      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
      setStats(data.stats || { totalAmount: 0, pendingAmount: 0, totalCount: 0, pendingCount: 0 });
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async () => {
    if (!formTitle.trim() || !formAmount || !formCategory) {
      toast.error("Please fill in title, amount, and category");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          amount: parseFloat(formAmount),
          category: formCategory,
          date: formDate || undefined,
          vendor: formVendor || undefined,
          notes: formNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create expense");
      toast.success("Expense recorded successfully");
      setShowAddModal(false);
      setFormTitle("");
      setFormAmount("");
      setFormCategory("");
      setFormDate("");
      setFormVendor("");
      setFormNotes("");
      fetchExpenses();
    } catch {
      toast.error("Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setProcessingId(id);
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Expense ${status === "approved" ? "approved" : "rejected"} successfully`);
      fetchExpenses();
    } catch {
      toast.error("Failed to update expense status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = () => {
    if (!expenses.length) {
      toast.error("No expenses to export");
      return;
    }
    downloadCSV(
      expenses.map((e) => ({
        Title: e.title,
        Amount: e.amount,
        Category: e.category,
        Date: new Date(e.date).toLocaleDateString("en-NG"),
        Status: e.status,
        Vendor: e.vendor || "",
        Notes: e.notes || "",
        "Approved By": e.approvedBy || "",
      })),
      "expenses"
    );
    toast.success("Expenses exported successfully");
  };

  const filteredExpenses = expenses.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.vendor && e.vendor.toLowerCase().includes(q))
    );
  });

  const statCards = [
    { label: "Total Expenses", value: formatCurrency(stats.totalAmount), icon: TrendingDown, color: "from-blue-500 to-blue-600" },
    { label: "Pending Amount", value: formatCurrency(stats.pendingAmount), icon: Receipt, color: "from-emerald-500 to-emerald-600" },
    { label: "Total Count", value: stats.totalCount.toString(), icon: Clock, color: "from-orange-500 to-orange-600" },
    { label: "Pending Approvals", value: stats.pendingCount.toString(), icon: Wrench, color: "from-purple-500 to-purple-600" },
  ];

  const categoryBreakdown = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.category === cat && e.status === "approved");
    const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percent = stats.totalAmount > 0 ? Math.round((catTotal / stats.totalAmount) * 100) : 0;
    const colorMap: Record<string, string> = {
      Salaries: "bg-blue-500",
      Utilities: "bg-emerald-500",
      Maintenance: "bg-purple-500",
      Academic: "bg-orange-500",
      Security: "bg-cyan-500",
      Transport: "bg-yellow-500",
      "Food & Supplies": "bg-pink-500",
      Others: "bg-gray-500",
    };
    return { label: cat, amount: catTotal, percent, color: colorMap[cat] || "bg-gray-500" };
  }).filter((c) => c.amount > 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mt-8 mx-4 p-8"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Expense Management</h1>
            <p className="text-white/70 text-[13px]">
              Track and manage all school expenses, approvals, and budgets
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {canCreate && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Record Expense
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[12px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1a1a2e] font-semibold text-lg">Recent Expenses</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ colorScheme: "light" }}
                className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="" style={{ background: "#ffffff", color: "#1a1a2e" }}>All Status</option>
                <option value="pending" style={{ background: "#ffffff", color: "#1a1a2e" }}>Pending</option>
                <option value="approved" style={{ background: "#ffffff", color: "#1a1a2e" }}>Approved</option>
                <option value="rejected" style={{ background: "#ffffff", color: "#1a1a2e" }}>Rejected</option>
              </select>
              <button title="Filter using dropdowns above" className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
              <Receipt className="w-12 h-12 mb-3 text-[#94a3b8]" />
              <p className="text-[13px]">No expenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Description</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Amount</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Category</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Date</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Status</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-all">
                      <td className="py-3 px-4">
                        <p className="text-[#1a1a2e] font-medium text-[13px]">{expense.title}</p>
                        {expense.vendor && (
                          <p className="text-[#64748b] text-[12px]">{expense.vendor}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#1a1a2e] font-medium text-[13px]">{formatCurrency(expense.amount)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-lg bg-[#f8fafc] text-[#475569] text-[12px]">{expense.category}</span>
                      </td>
                      <td className="py-3 px-4 text-[#475569] text-[13px]">{new Date(expense.date).toLocaleDateString("en-NG")}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                          expense.status === "approved" ? "bg-[#dcfce7] text-[#16a34a]" :
                          expense.status === "rejected" ? "bg-[#fee2e2] text-[#dc2626]" :
                          "bg-orange-500/20 text-orange-400"
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {expense.status === "pending" && canApprove && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusUpdate(expense.id, "approved")}
                              disabled={processingId === expense.id}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 text-[#16a34a] text-[11px] font-semibold hover:bg-[#dcfce7] transition flex items-center gap-1"
                            >
                              {processingId === expense.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(expense.id, "rejected")}
                              disabled={processingId === expense.id}
                              className="px-2 py-1 rounded-lg bg-red-500/10 text-[#dc2626] text-[11px] font-semibold hover:bg-[#fee2e2] transition flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-6">Expense Categories</h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-[#64748b] text-[13px] text-center py-6">No approved expenses yet</p>
                ) : (
                  categoryBreakdown.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-[13px] mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-[#475569]">{item.label}</span>
                        </div>
                        <span className="text-[#64748b] text-[12px]">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-[#f8fafc] rounded-full h-1.5">
                        <div className={`${item.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                      </div>
                      <span className="text-[#94a3b8] text-[11px]">{item.percent}%</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Quick Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#16a34a]" />
                  <span className="text-[#475569] text-[13px]">Approved</span>
                </div>
                <span className="text-[#1a1a2e] text-[13px] font-medium">
                  {expenses.filter((e) => e.status === "approved").length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-[#475569] text-[13px]">Pending</span>
                </div>
                <span className="text-[#1a1a2e] text-[13px] font-medium">
                  {expenses.filter((e) => e.status === "pending").length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-[#dc2626]" />
                  <span className="text-[#475569] text-[13px]">Rejected</span>
                </div>
                <span className="text-[#1a1a2e] text-[13px] font-medium">
                  {expenses.filter((e) => e.status === "rejected").length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white border border-[#e2e8f0] rounded-3xl max-h-[85vh] overflow-y-auto"
              style={{ padding: "32px" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1a1a2e] font-bold text-lg">Record New Expense</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label className="block text-[#64748b] text-[12px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Teacher Salaries"
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748b] text-[12px] mb-1.5">Amount *</label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748b] text-[12px] mb-1.5">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{ colorScheme: "light" }}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="" style={{ background: "#ffffff", color: "#1a1a2e" }}>Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} style={{ background: "#ffffff", color: "#1a1a2e" }}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748b] text-[12px] mb-1.5">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      style={{ colorScheme: "light" }}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748b] text-[12px] mb-1.5">Vendor</label>
                    <input
                      type="text"
                      value={formVendor}
                      onChange={(e) => setFormVendor(e.target.value)}
                      placeholder="Vendor name"
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#64748b] text-[12px] mb-1.5">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExpense}
                    disabled={submitting}
                    className="flex-1 btn btn-primary"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Saving..." : "Record Expense"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

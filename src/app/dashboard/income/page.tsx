"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrency } from "@/lib/school-config";

interface IncomeCategory {
  id: string;
  name: string;
}

interface Income {
  id: string;
  title: string;
  amount: number;
  date: string;
  reference: string | null;
  notes: string | null;
  category: IncomeCategory | null;
}

interface IncomeStats {
  totalIncome: number;
  count: number;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [stats, setStats] = useState<IncomeStats>({ totalIncome: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formReference, setFormReference] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/income");
      if (!res.ok) throw new Error("Failed to fetch income");
      const data = await res.json();
      setIncomes(data.incomes || []);
      setIncomeCategories(data.categories || []);
      setStats(data.stats || { totalIncome: 0, count: 0 });
    } catch {
      toast.error("Failed to load income data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleAddIncome = async () => {
    if (!formTitle.trim() || !formAmount) {
      toast.error("Please fill in title and amount");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          amount: parseFloat(formAmount),
          categoryId: formCategoryId || undefined,
          date: formDate || undefined,
          reference: formReference || undefined,
          notes: formNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create income");
      toast.success("Income recorded successfully");
      setShowAddModal(false);
      setFormTitle("");
      setFormAmount("");
      setFormCategoryId("");
      setFormDate("");
      setFormReference("");
      setFormNotes("");
      fetchIncomes();
    } catch {
      toast.error("Failed to record income");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!incomes.length) {
      toast.error("No income records to export");
      return;
    }
    downloadCSV(
      incomes.map((i) => ({
        Title: i.title,
        Amount: i.amount,
        Category: i.category?.name || "",
        Date: new Date(i.date).toLocaleDateString("en-NG"),
        Reference: i.reference || "",
        Notes: i.notes || "",
      })),
      "income"
    );
    toast.success("Income exported successfully");
  };

  const filteredIncomes = incomes.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      (i.category?.name && i.category.name.toLowerCase().includes(q)) ||
      (i.reference && i.reference.toLowerCase().includes(q))
    );
  });

  const categoryMap = filteredIncomes.reduce<Record<string, number>>((acc, i) => {
    const cat = i.category?.name || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + i.amount;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: stats.totalIncome > 0 ? Math.round((amount / stats.totalIncome) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const statCards = [
    { label: "Total Income", value: formatCurrency(stats.totalIncome), icon: TrendingUp, color: "from-blue-500 to-blue-600" },
    { label: "Transactions", value: stats.count.toString(), icon: Calendar, color: "from-emerald-500 to-emerald-600" },
    { label: "Categories", value: incomeCategories.length.toString(), icon: BarChart3, color: "from-purple-500 to-purple-600" },
    { label: "This Month", value: formatCurrency(incomes.filter((i) => {
      const d = new Date(i.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, i) => sum + i.amount, 0)), icon: ArrowUpRight, color: "from-[var(--accent)] to-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mx-8 mt-8 p-8"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Income Tracking</h1>
            <p className="text-white/70 text-[13px]">
              Monitor all income sources, revenue streams, and financial trends
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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Record Income
            </button>
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
            <h3 className="text-[#1a1a2e] font-semibold text-lg">Income Sources</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search income..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button title="Filter using search above" className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
              <CreditCard className="w-12 h-12 mb-3 text-[#94a3b8]" />
              <p className="text-[13px]">No income records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Source</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Amount</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Category</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Date</th>
                    <th className="text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider pb-3 px-4">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income, idx) => (
                    <tr key={income.id} className={`border-b border-[#e2e8f0] hover:bg-[#f1f5f9] transition-all ${idx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}>
                      <td className="py-3 px-4 text-[#1a1a2e] font-medium text-[13px]">{income.title}</td>
                      <td className="py-3 px-4 text-[#1a1a2e] font-medium text-[13px]">{formatCurrency(income.amount)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-lg bg-[#f8fafc] text-[#475569] text-[12px]">
                          {income.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#475569] text-[13px]">{new Date(income.date).toLocaleDateString("en-NG")}</td>
                      <td className="py-3 px-4 text-[#64748b] text-[13px]">{income.reference || "—"}</td>
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
          className="card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-lg mb-6">Income Breakdown</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-[#64748b] text-[13px] text-center py-6">No income data yet</p>
                ) : (
                  categoryBreakdown.map((item, i) => {
                    const colors = ["bg-[var(--accent)]", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-cyan-500", "bg-pink-500", "bg-yellow-500", "bg-emerald-500"];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-[13px] mb-1">
                          <span className="text-[#475569]">{item.name}</span>
                          <span className="text-[#64748b] text-[12px]">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="w-full bg-[#f8fafc] rounded-full h-1.5">
                          <div
                            className={`${colors[i % colors.length]} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="text-[#94a3b8] text-[11px]">{item.percent}%</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-[#e2e8f0]">
                <h4 className="text-[#1a1a2e] text-[12px] mb-3 uppercase tracking-wide">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc]">
                    <span className="text-[#475569] text-[13px]">Total Income</span>
                    <span className="text-[#1a1a2e] text-[13px] font-medium">{formatCurrency(stats.totalIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc]">
                    <span className="text-[#475569] text-[13px]">Transactions</span>
                    <span className="text-[#1a1a2e] text-[13px] font-medium">{stats.count}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc]">
                    <span className="text-[#475569] text-[13px]">Categories</span>
                    <span className="text-[#1a1a2e] text-[13px] font-medium">{incomeCategories.length}</span>
                  </div>
                </div>
              </div>
            </>
          )}
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
              className="w-full max-w-lg bg-white border border-[#e2e8f0] rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1a1a2e] font-bold text-lg">Record New Income</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#64748b] text-[12px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. School Fees - JSS"
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
                    <label className="block text-[#64748b] text-[12px] mb-1.5">Category</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      style={{ colorScheme: "light" }}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="" style={{ background: "#ffffff", color: "#1a1a2e" }}>Select category</option>
                      {incomeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} style={{ background: "#ffffff", color: "#1a1a2e" }}>{cat.name}</option>
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
                    <label className="block text-[#64748b] text-[12px] mb-1.5">Reference</label>
                    <input
                      type="text"
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      placeholder="e.g. REF-001"
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
                    onClick={handleAddIncome}
                    disabled={submitting}
                    className="flex-1 btn btn-primary"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Saving..." : "Record Income"}
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

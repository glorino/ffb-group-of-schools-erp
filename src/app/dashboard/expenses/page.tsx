"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

const expenses = [
  { id: 1, description: "Teacher Salaries - January", amount: "₦12.5M", category: "Salaries", date: "Jan 31, 2025", status: "approved", approvedBy: "Principal" },
  { id: 2, description: "Generator Fuel", amount: "₦850,000", category: "Utilities", date: "Jan 28, 2025", status: "approved", approvedBy: "Bursar" },
  { id: 3, description: "Cleaning Materials", amount: "₦120,000", category: "Maintenance", date: "Jan 25, 2025", status: "pending", approvedBy: "-" },
  { id: 4, description: "Exam Materials", amount: "₦450,000", category: "Academic", date: "Jan 22, 2025", status: "approved", approvedBy: "VP Admin" },
  { id: 5, description: "Security Guards", amount: "₦600,000", category: "Security", date: "Jan 20, 2025", status: "approved", approvedBy: "Bursar" },
];

const monthlyExpenses = [
  { month: "Sep", amount: 28.5 },
  { month: "Oct", amount: 32.1 },
  { month: "Nov", amount: 30.8 },
  { month: "Dec", amount: 35.2 },
  { month: "Jan", amount: 33.5 },
];

const stats = [
  { label: "Total Expenses", value: "₦33.5M", icon: TrendingDown, color: "from-blue-500 to-blue-600" },
  { label: "This Month", value: "₦33.5M", icon: Receipt, color: "from-emerald-500 to-emerald-600" },
  { label: "Pending Approvals", value: "5", icon: Clock, color: "from-orange-500 to-orange-600" },
  { label: "Categories", value: "8", icon: Wrench, color: "from-purple-500 to-purple-600" },
];

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Expense Management</h1>
            <p className="text-white/60">
              Track and manage all school expenses, approvals, and budgets
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Record Expense
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
                <p className="text-3xl font-bold text-white">{stat.value}</p>
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
            <h3 className="text-white font-semibold text-lg">Recent Expenses</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Description</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Amount</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Category</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Date</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 text-white font-medium text-sm">{expense.description}</td>
                    <td className="py-3 text-white font-medium text-sm">{expense.amount}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">{expense.category}</span>
                    </td>
                    <td className="py-3 text-white/70 text-sm">{expense.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        expense.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-6">Monthly Trend</h3>
            <div className="flex items-end justify-between h-40 gap-3">
              {monthlyExpenses.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <span className="text-white/40 text-xs mb-2">₦{month.amount}M</span>
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-orange-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(month.amount / 40) * 100}%` }}
                  />
                  <span className="text-white/40 text-xs mt-2">{month.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Expense Categories</h3>
            <div className="space-y-2">
              {[
                { label: "Salaries", amount: "₦12.5M", percent: 37, color: "bg-blue-500" },
                { label: "Utilities", amount: "₦5.2M", percent: 16, color: "bg-emerald-500" },
                { label: "Maintenance", amount: "₦4.8M", percent: 14, color: "bg-purple-500" },
                { label: "Academic", amount: "₦4.5M", percent: 13, color: "bg-orange-500" },
                { label: "Security", amount: "₦3.5M", percent: 10, color: "bg-cyan-500" },
                { label: "Others", amount: "₦3M", percent: 10, color: "bg-pink-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-white/60">{item.label}</span>
                    </div>
                    <span className="text-white/40">{item.amount}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

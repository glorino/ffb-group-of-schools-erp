"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

const incomeData = [
  { id: 1, source: "School Fees - JSS", amount: "₦18.5M", date: "Jan 2025", category: "Tuition", status: "received" },
  { id: 2, source: "School Fees - SS", amount: "₦15.2M", date: "Jan 2025", category: "Tuition", status: "received" },
  { id: 3, source: "Hostel Fees", amount: "₦4.8M", date: "Jan 2025", category: "Accommodation", status: "received" },
  { id: 4, source: "Transport Fees", amount: "₦3.2M", date: "Jan 2025", category: "Transport", status: "received" },
  { id: 5, source: "PTA Levy", amount: "₦2.1M", date: "Jan 2025", category: "Levy", status: "received" },
  { id: 6, source: "Uniform Sales", amount: "₦1.4M", date: "Jan 2025", category: "Merchandise", status: "received" },
];

const monthlyIncome = [
  { month: "Sep", amount: 38.5 },
  { month: "Oct", amount: 42.1 },
  { month: "Nov", amount: 40.8 },
  { month: "Dec", amount: 45.2 },
  { month: "Jan", amount: 43.5 },
];

const stats = [
  { label: "Total Income", value: "₦45.2M", icon: TrendingUp, color: "from-blue-500 to-blue-600" },
  { label: "This Month", value: "₦43.5M", icon: Calendar, color: "from-emerald-500 to-emerald-600" },
  { label: "vs Last Month", value: "+3.8%", icon: ArrowUpRight, color: "from-purple-500 to-purple-600" },
  { label: "Sources", value: "12", icon: BarChart3, color: "from-[var(--accent)] to-emerald-400" },
];

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Income Tracking</h1>
            <p className="text-white/60">
              Monitor all income sources, revenue streams, and financial trends
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Record Income
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
            <h3 className="text-white font-semibold text-lg">Income Sources</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search income..."
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
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Source</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Amount</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Category</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Date</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((income) => (
                  <tr key={income.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 text-white font-medium text-sm">{income.source}</td>
                    <td className="py-3 text-white font-medium text-sm">{income.amount}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">{income.category}</span>
                    </td>
                    <td className="py-3 text-white/70 text-sm">{income.date}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        {income.status}
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
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">Monthly Trend</h3>
          <div className="flex items-end justify-between h-48 gap-3">
            {monthlyIncome.map((month, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className="text-white/40 text-xs mb-2">₦{month.amount}M</span>
                <div
                  className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--accent)] rounded-t-lg transition-all duration-500"
                  style={{ height: `${(month.amount / 50) * 100}%` }}
                />
                <span className="text-white/40 text-xs mt-2">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-white/60 text-sm mb-3">Income Breakdown</h4>
            <div className="space-y-2">
              {[
                { label: "Tuition", amount: "₦33.7M", percent: 75 },
                { label: "Hostel", amount: "₦4.8M", percent: 11 },
                { label: "Transport", amount: "₦3.2M", percent: 7 },
                { label: "Others", amount: "₦3.5M", percent: 7 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white/40">{item.amount}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-[var(--accent)] h-1.5 rounded-full" style={{ width: `${item.percent}%` }} />
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

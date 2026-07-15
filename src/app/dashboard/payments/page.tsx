"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Receipt,
} from "lucide-react";

const payments = [
  { id: 1, student: "Chidinma Okafor", class: "JSS1A", amount: "₦125,000", type: "School Fees", date: "Jan 15, 2025", status: "confirmed", reference: "PAY-2025-001" },
  { id: 2, student: "Emeka Nwosu", class: "SS2A", amount: "₦150,000", type: "School Fees", date: "Jan 14, 2025", status: "confirmed", reference: "PAY-2025-002" },
  { id: 3, student: "Fatima Bello", class: "JSS3A", amount: "₦85,000", type: "Hostel", date: "Jan 13, 2025", status: "pending", reference: "PAY-2025-003" },
  { id: 4, student: "Oluwaseun Adeyemi", class: "SS1B", amount: "₦45,000", type: "Transport", date: "Jan 12, 2025", status: "confirmed", reference: "PAY-2025-004" },
  { id: 5, student: "Ngozi Okwu", class: "SS3A", amount: "₦125,000", type: "School Fees", date: "Jan 11, 2025", status: "confirmed", reference: "PAY-2025-005" },
];

const stats = [
  { label: "Total Payments", value: "₦45.2M", icon: CreditCard, color: "from-blue-500 to-blue-600" },
  { label: "Confirmed", value: "₦42.8M", icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
  { label: "Pending", value: "₦2.4M", icon: Clock, color: "from-orange-500 to-orange-600" },
  { label: "Transactions", value: "2,847", icon: Receipt, color: "from-purple-500 to-purple-600" },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Payments</h1>
            <p className="text-white/60">
              View payment history, confirm transactions, and manage receipts
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Record Payment
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Payment History</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search payments..."
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
                <th className="text-left text-white/50 text-sm font-medium pb-3">Student</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Class</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Amount</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Type</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Date</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Status</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="py-3 text-white font-medium text-sm">{payment.student}</td>
                  <td className="py-3 text-white/70 text-sm">{payment.class}</td>
                  <td className="py-3 text-white font-medium text-sm">{payment.amount}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">{payment.type}</span>
                  </td>
                  <td className="py-3 text-white/70 text-sm">{payment.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      payment.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 text-white/40 text-sm">{payment.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

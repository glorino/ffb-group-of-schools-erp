"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";

const financeKPIs = [
  {
    label: "Total Revenue",
    value: "₦542.8M",
    change: "+18.2%",
    trend: "up",
    icon: DollarSign,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Collected This Month",
    value: "₦45.2M",
    change: "+12.5%",
    trend: "up",
    icon: CreditCard,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Outstanding Fees",
    value: "₦28.4M",
    change: "-8.3%",
    trend: "down",
    icon: AlertCircle,
    color: "from-orange-500 to-orange-600",
  },
  {
    label: "Expenses (Month)",
    value: "₦18.6M",
    change: "+3.2%",
    trend: "up",
    icon: TrendingDown,
    color: "from-red-500 to-red-600",
  },
];

const recentPayments = [
  {
    student: "Adebayo Johnson",
    amount: "₦125,000",
    type: "School Fees",
    method: "Flutterwave",
    date: "2025-01-15",
    ref: "TXN-001",
    status: "completed",
  },
  {
    student: "Chioma Okafor",
    amount: "₦85,000",
    type: "Hostel Fees",
    method: "Bank Transfer",
    date: "2025-01-15",
    ref: "TXN-002",
    status: "completed",
  },
  {
    student: "Ibrahim Mohammed",
    amount: "₦125,000",
    type: "School Fees",
    method: "Flutterwave",
    date: "2025-01-14",
    ref: "TXN-003",
    status: "completed",
  },
  {
    student: "Fatima Abdullahi",
    amount: "₦45,000",
    type: "Transport",
    method: "Card Payment",
    date: "2025-01-14",
    ref: "TXN-004",
    status: "pending",
  },
  {
    student: "Emeka Nwankwo",
    amount: "₦125,000",
    type: "School Fees",
    method: "Flutterwave",
    date: "2025-01-13",
    ref: "TXN-005",
    status: "completed",
  },
];

const outstandingFees = [
  { student: "Oluwaseun Akindele", class: "SS3", amount: "₦125,000", overdue: "15 days" },
  { student: "Amina Yusuf", class: "JSS2", amount: "₦85,000", overdue: "8 days" },
  { student: "Chukwuemeka Obi", class: "SS1", amount: "₦125,000", overdue: "22 days" },
  { student: "Funmilayo Adeyemi", class: "JSS3", amount: "₦85,000", overdue: "5 days" },
];

const expenseBreakdown = [
  { category: "Staff Salaries", amount: "₦12.5M", percentage: 67 },
  { category: "Infrastructure", amount: "₦2.8M", percentage: 15 },
  { category: "Utilities", amount: "₦1.5M", percentage: 8 },
  { category: "Supplies", amount: "₦1.2M", percentage: 6 },
  { category: "Others", amount: "₦0.6M", percentage: 4 },
];

export default function FinancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Finance Management</h2>
          <p className="text-white/50 text-sm">
            Track revenue, expenses, payments, and financial analytics
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeKPIs.map((kpi, i) => (
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
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-emerald-400 text-sm font-medium">
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}
              >
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Recent Payments</h3>
            <button className="text-[var(--accent)] text-sm hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment, i) => (
                  <tr key={i}>
                    <td className="text-white font-medium">{payment.student}</td>
                    <td className="text-[var(--accent)] font-semibold">{payment.amount}</td>
                    <td className="text-white/60">{payment.type}</td>
                    <td className="text-white/60">{payment.method}</td>
                    <td className="text-white/60">{payment.date}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">
            Expense Breakdown
          </h3>
          <div className="space-y-4">
            {expenseBreakdown.map((expense, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-sm">{expense.category}</span>
                  <span className="text-white font-medium text-sm">{expense.amount}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${expense.percentage}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Outstanding Fees */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Outstanding Fees</h3>
          <button className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-all">
            Send Reminders
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Amount</th>
                <th>Overdue</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {outstandingFees.map((fee, i) => (
                <tr key={i}>
                  <td className="text-white font-medium">{fee.student}</td>
                  <td className="text-white/60">{fee.class}</td>
                  <td className="text-orange-400 font-semibold">{fee.amount}</td>
                  <td className="text-red-400">{fee.overdue}</td>
                  <td className="text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-medium hover:bg-[var(--primary)]/30 transition-all">
                      Remind
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

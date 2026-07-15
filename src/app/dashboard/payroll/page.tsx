"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Users,
  Calculator,
  FileText,
  CreditCard,
} from "lucide-react";

const payroll = [
  { id: 1, name: "Mrs. Adaeze Okonkwo", position: "Senior Teacher", department: "Mathematics", salary: "₦350,000", allowances: "₦50,000", deductions: "₦35,000", net: "₦365,000", status: "paid" },
  { id: 2, name: "Mr. Emeka Nwosu", position: "Teacher", department: "English", salary: "₦280,000", allowances: "₦40,000", deductions: "₦28,000", net: "₦292,000", status: "paid" },
  { id: 3, name: "Mrs. Fatima Abubakar", position: "HOD", department: "Science", salary: "₦420,000", allowances: "₦60,000", deductions: "₦42,000", net: "₦438,000", status: "pending" },
  { id: 4, name: "Mr. Olusegun Adeyemi", position: "Teacher", department: "Chemistry", salary: "₦280,000", allowances: "₦40,000", deductions: "₦28,000", net: "₦292,000", status: "pending" },
  { id: 5, name: "Mrs. Ngozi Okwu", position: "Vice Principal", department: "Administration", salary: "₦550,000", allowances: "₦80,000", deductions: "₦55,000", net: "₦575,000", status: "paid" },
];

const stats = [
  { label: "Total Staff", value: "156", icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Monthly Payroll", value: "₦45.2M", icon: Wallet, color: "from-emerald-500 to-emerald-600" },
  { label: "Pending Payments", value: "23", icon: Clock, color: "from-orange-500 to-orange-600" },
  { label: "Processed", value: "133", icon: CheckCircle, color: "from-purple-500 to-purple-600" },
];

export default function PayrollPage() {
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
            <p className="text-white/60">
              Manage teacher salaries, allowances, deductions, and payments
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Calculator className="w-4 h-4" />
              Run Payroll
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Download className="w-4 h-4" />
              Export Payslips
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
          <h3 className="text-white font-semibold text-lg">January 2025 Payroll</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search staff..."
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
                <th className="text-left text-white/50 text-sm font-medium pb-3">Staff</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Position</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Basic Salary</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Allowances</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Deductions</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Net Pay</th>
                <th className="text-left text-white/50 text-sm font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((staff) => (
                <tr key={staff.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-xs">
                        {staff.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{staff.name}</p>
                        <p className="text-white/40 text-xs">{staff.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-white/70 text-sm">{staff.position}</td>
                  <td className="py-3 text-white/70 text-sm">{staff.salary}</td>
                  <td className="py-3 text-emerald-400 text-sm">{staff.allowances}</td>
                  <td className="py-3 text-red-400 text-sm">{staff.deductions}</td>
                  <td className="py-3 text-white font-medium text-sm">{staff.net}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      staff.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {staff.status}
                    </span>
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

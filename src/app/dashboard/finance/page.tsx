"use client";

import { useEffect, useState } from "react";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  paidAt: string | null;
  createdAt: string;
  student: { firstName: string; lastName: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  student: { firstName: string; lastName: string };
  schoolFee: { name: string };
}

interface FinanceData {
  payments: Payment[];
  invoices: Invoice[];
  totalRevenue: number;
  collectedThisMonth: number;
  outstandingFees: number;
  expensesThisMonth: number;
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/payments").then((r) => r.json()),
      fetch("/api/finance/invoices").then((r) => r.json()),
    ])
      .then(([paymentsData, invoicesData]) => {
        const payments = paymentsData.payments ?? [];
        const invoices = invoicesData.invoices ?? [];

        const completedPayments = payments.filter((p: Payment) => p.status === "completed");
        const totalRevenue = completedPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const collectedThisMonth = completedPayments
          .filter((p: Payment) => p.paidAt && new Date(p.paidAt) >= monthStart)
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);

        const outstandingFees = invoices
          .filter((i: Invoice) => i.status === "unpaid")
          .reduce((sum: number, i: Invoice) => sum + i.totalAmount, 0);

        setData({
          payments,
          invoices,
          totalRevenue,
          collectedThisMonth,
          outstandingFees,
          expensesThisMonth: 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
    return `₦${amount.toLocaleString()}`;
  };

  const financeKPIs = [
    {
      label: "Total Revenue",
      value: formatCurrency(data?.totalRevenue ?? 0),
      change: "",
      trend: "up" as const,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Collected This Month",
      value: formatCurrency(data?.collectedThisMonth ?? 0),
      change: "",
      trend: "up" as const,
      icon: CreditCard,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Outstanding Fees",
      value: formatCurrency(data?.outstandingFees ?? 0),
      change: "",
      trend: "down" as const,
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "Total Transactions",
      value: String(data?.payments?.length ?? 0),
      change: "",
      trend: "up" as const,
      icon: Receipt,
      color: "from-purple-500 to-purple-600",
    },
  ];

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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4"><div className="skeleton h-4 w-full" /></td>
                    </tr>
                  ))
                ) : data?.payments?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  data?.payments?.slice(0, 10).map((payment) => (
                    <tr key={payment.id}>
                      <td className="text-white font-medium">
                        {payment.student.firstName} {payment.student.lastName}
                      </td>
                      <td className="text-[var(--accent)] font-semibold">
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="text-white/60">Fee Payment</td>
                      <td className="text-white/60">{payment.method}</td>
                      <td className="text-white/60">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : payment.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Outstanding Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">Outstanding Invoices</h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 w-full rounded-xl" />
              ))
            ) : data?.invoices?.filter((i) => i.status === "unpaid").length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">No outstanding invoices</p>
            ) : (
              data?.invoices?.filter((i) => i.status === "unpaid").slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {invoice.student.firstName} {invoice.student.lastName}
                      </p>
                      <p className="text-white/40 text-xs">
                        {invoice.invoiceNumber} • {invoice.schoolFee.name}
                      </p>
                    </div>
                    <span className="text-orange-400 text-sm font-semibold">
                      ₦{invoice.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/30 text-xs">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                    <button className="px-2 py-1 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-medium hover:bg-[var(--primary)]/30 transition-all">
                      Remind
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

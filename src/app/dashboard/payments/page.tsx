"use client";

import { useEffect, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface PaymentStudent {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  schoolFee: { name: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  reference: string | null;
  paidAt: string | null;
  student: PaymentStudent;
  invoice: PaymentInvoice | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterMethod) params.set("method", filterMethod);
      const res = await fetch(`/api/finance/payments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data.payments || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterMethod]);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handleExport = () => {
    if (!payments.length) {
      toast.error("No payments to export");
      return;
    }
    downloadCSV(
      payments.map((p) => ({
        Student: `${p.student.firstName} ${p.student.lastName}`,
        "Admission No": p.student.admissionNumber,
        Amount: p.amount,
        Method: p.method,
        Status: p.status,
        Reference: p.reference || "",
        "Paid At": p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "",
        "Invoice": p.invoice?.invoiceNumber || "",
      })),
      "payments"
    );
    toast.success("Payments exported successfully");
  };

  const totalCollected = payments
    .filter((p) => p.status === "completed" || p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    { label: "Total Collected", value: formatNaira(totalCollected), icon: TrendingUp, color: "from-blue-500 to-blue-600" },
    { label: "Pending Amount", value: formatNaira(totalPending), icon: Clock, color: "from-emerald-500 to-emerald-600" },
    { label: "Total Payments", value: pagination.total.toString(), icon: CreditCard, color: "from-orange-500 to-orange-600" },
    { label: "Transactions", value: payments.length.toString(), icon: Receipt, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Payments</h1>
            <p className="text-[#475569]">
              View payment history, confirm transactions, and manage receipts
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-[#e2e8f0] text-[#1a1a2e] text-sm font-medium hover:bg-[#f1f5f9] transition-all"
            >
              <Download className="w-4 h-4" />
              Export
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
                <stat.icon className="w-6 h-6 text-[#1a1a2e]" />
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
          <h3 className="text-[#1a1a2e] font-semibold text-lg">Payment History</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="" style={{ background: "#0f1b33", color: "#fff" }}>All Status</option>
              <option value="completed" style={{ background: "#0f1b33", color: "#fff" }}>Completed</option>
              <option value="pending" style={{ background: "#0f1b33", color: "#fff" }}>Pending</option>
              <option value="failed" style={{ background: "#0f1b33", color: "#fff" }}>Failed</option>
            </select>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="" style={{ background: "#0f1b33", color: "#fff" }}>All Methods</option>
              <option value="cash" style={{ background: "#0f1b33", color: "#fff" }}>Cash</option>
              <option value="bank_transfer" style={{ background: "#0f1b33", color: "#fff" }}>Bank Transfer</option>
              <option value="card" style={{ background: "#0f1b33", color: "#fff" }}>Card</option>
              <option value="online" style={{ background: "#0f1b33", color: "#fff" }}>Online</option>
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
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
            <Receipt className="w-12 h-12 mb-3 text-[#94a3b8]" />
            <p className="text-[13px]">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Student</th>
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Amount</th>
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Method</th>
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Invoice</th>
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Date</th>
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Status</th>
              <th className="text-left text-[#64748b] text-[12px] font-medium pb-3 px-4">Reference</th>
            </tr>
           </thead>
           <tbody>
             {payments.map((payment) => (
               <tr key={payment.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-all">
                 <td className="py-3 px-4">
                   <p className="text-[#1a1a2e] font-medium text-[13px]">
                     {payment.student.firstName} {payment.student.lastName}
                   </p>
                   <p className="text-[#64748b] text-[12px]">{payment.student.admissionNumber}</p>
                 </td>
                 <td className="py-3 px-4 text-[#1a1a2e] font-medium text-[13px]">{formatNaira(payment.amount)}</td>
                 <td className="py-3 px-4">
                   <span className="px-2 py-1 rounded-lg bg-[#f8fafc] text-[#475569] text-[12px] capitalize">
                     {payment.method?.replace("_", " ") || "—"}
                   </span>
                 </td>
                 <td className="py-3 px-4">
                   {payment.invoice ? (
                     <div>
                       <p className="text-[#475569] text-[13px]">{payment.invoice.invoiceNumber}</p>
                       {payment.invoice.schoolFee && (
                         <p className="text-[#64748b] text-[12px]">{payment.invoice.schoolFee.name}</p>
                       )}
                     </div>
                   ) : (
                     <span className="text-[#94a3b8] text-[13px]">—</span>
                   )}
                 </td>
                 <td className="py-3 px-4 text-[#475569] text-[13px]">
                   {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-NG") : "—"}
                 </td>
                 <td className="py-3 px-4">
                   <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                     payment.status === "completed" || payment.status === "confirmed"
                       ? "bg-[#dcfce7] text-[#16a34a]"
                       : payment.status === "pending"
                       ? "bg-orange-500/20 text-orange-400"
                       : "bg-[#fee2e2] text-[#dc2626]"
                   }`}>
                     {payment.status}
                   </span>
                 </td>
                 <td className="py-3 px-4 text-[#64748b] text-[13px]">{payment.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e2e8f0]">
            <p className="text-[#64748b] text-[13px]">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchPayments(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition ${
                      pagination.page === pageNum
                        ? "bg-[var(--primary)] text-[#1a1a2e]"
                        : "bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

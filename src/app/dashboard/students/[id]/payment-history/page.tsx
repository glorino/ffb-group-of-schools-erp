"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Printer,
  Receipt,
  Loader2,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  paidAt: string;
  invoice?: { invoiceNumber: string };
}

export default function StudentPaymentHistoryPage() {
  const params = useParams();
  const id = params.id as string;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/finance/payments?studentId=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setPayments(d.payments || []);
        if (d.payments?.length > 0) {
          const p = d.payments[0];
          if (p.student) setStudentName(`${p.student.firstName} ${p.student.lastName}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success("PDF download started");
    window.print();
  };

  const totalPaid = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const methodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "💵";
      case "transfer":
        return "🏦";
      case "card":
        return "💳";
      case "pos":
        return "_POS";
      default:
        return "💰";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/students"
            className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-[22px] font-bold text-white/95 tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Receipt className="w-[18px] h-[18px] text-white" />
              </div>
              Payment History
            </h1>
            {studentName && (
              <p className="text-white/30 text-[12px] mt-1 ml-[46px]">
                {studentName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div ref={printRef}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
          {[
            {
              label: "Total Paid",
              value: `\u20A6${totalPaid.toLocaleString()}`,
              icon: CreditCard,
              color: "from-emerald-500 to-emerald-700",
            },
            {
              label: "Total Transactions",
              value: String(payments.length),
              icon: Receipt,
              color: "from-blue-500 to-blue-700",
            },
            {
              label: "Verified Payments",
              value: String(payments.filter((p) => p.status === "verified").length),
              icon: CheckCircle2,
              color: "from-purple-500 to-purple-700",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/30 text-[11px]">{stat.label}</p>
              </div>
              <p className="text-white text-xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Date", "Amount", "Method", "Status", "Reference", "Invoice Number"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <motion.tr
                      key={p.id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition"
                    >
                      <td className="px-5 py-3.5 text-white/70 text-[13px]">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-white/80 text-[13px] font-semibold">
                        {"\u20A6"}
                        {(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-white/40 text-[12px]">
                        <span className="flex items-center gap-1.5">
                          <span>{methodIcon(p.method)}</span>
                          {p.method || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${
                            p.status === "verified"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {p.status === "verified" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-[12px] font-mono">
                        {p.reference || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-[12px] font-mono">
                        {p.invoice?.invoiceNumber || "—"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

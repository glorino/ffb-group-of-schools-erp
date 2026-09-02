"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CreditCard, Receipt, Clock, CheckCircle, ChevronDown, ChevronUp, Wallet,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

export default function ParentPaymentsPage() {
  const { data: session } = useSession();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/parent/invoices")
      .then(r => r.json())
      .then(d => {
        setChildren(d.children || []);
        if (d.children?.length > 0) setExpandedChild(d.children[0].studentId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (studentId: string, invoiceId: string, amount: number) => {
    const email = (session?.user as any)?.email || "";
    const name = (session?.user as any)?.name || "";
    setPaying(invoiceId);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, invoiceId, amount, email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");
      if (data.paymentLink) {
        window.open(data.paymentLink, "_blank");
      }
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setPaying(null);
    }
  };

  const totalOwed = children.reduce((sum, c) => sum + c.totalOwed, 0);
  const totalPaid = children.reduce((sum, c) => sum + c.totalPaid, 0);

  return (
    <motion.div {...fadeIn} className="space-y-5">
      <div className="mt-8 mx-4 bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] rounded-2xl p-8 border border-white/10" style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6" />
            Fee Payments
          </h1>
          <p className="text-white/70 text-[13px] mt-1">View and pay school fees for your children</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mx-4">
        <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
          <p className="text-[#64748b] text-[12px]">Total Children</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{children.length}</p>
        </div>
        <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
          <p className="text-[#64748b] text-[12px]">Total Paid</p>
          <p className="text-[28px] font-bold text-emerald-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
          <p className="text-[#64748b] text-[12px]">Outstanding</p>
          <p className="text-[28px] font-bold text-red-600 mt-1">{formatCurrency(totalOwed)}</p>
        </div>
      </div>

      <div className="mx-4 space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#f1f5f9] animate-pulse" />
          ))
        ) : children.length === 0 ? (
          <div className="text-center py-16 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0]">
            <Receipt className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-[#64748b] text-[14px]">No children found</p>
            <p className="text-[#94a3b8] text-[12px] mt-1">Contact the school to link your account</p>
          </div>
        ) : (
          children.map((child) => (
            <div key={child.studentId} className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedChild(expandedChild === child.studentId ? null : child.studentId)}
                className="w-full p-5 flex items-center justify-between hover:bg-[#f8fafc] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0055ff]/10 flex items-center justify-center">
                    <span className="text-[#0055ff] font-bold text-[14px]">{child.studentName.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[#1a1a2e] font-semibold text-[14px]">{child.studentName}</p>
                    <p className="text-[#64748b] text-[11px]">{child.admissionNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-emerald-600 text-[12px] font-medium">Paid: {formatCurrency(child.totalPaid)}</p>
                    <p className="text-red-600 text-[12px] font-medium">Owed: {formatCurrency(child.totalOwed)}</p>
                  </div>
                  {expandedChild === child.studentId ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                </div>
              </button>

              {expandedChild === child.studentId && (
                <div className="border-t border-[#e2e8f0] p-5">
                  {child.invoices.length === 0 ? (
                    <p className="text-[#94a3b8] text-[12px] text-center py-4">No invoices yet</p>
                  ) : (
                    <div className="space-y-3">
                      {child.invoices.map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#e2e8f0]">
                          <div>
                            <p className="text-[#1a1a2e] text-[13px] font-medium">{inv.title}</p>
                            <p className="text-[#64748b] text-[11px] mt-0.5">
                              {inv.term} {inv.session} {inv.dueDate ? `· Due: ${new Date(inv.dueDate).toLocaleDateString()}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[#1a1a2e] text-[13px] font-semibold">{formatCurrency(inv.amount)}</p>
                              {inv.paid > 0 && <p className="text-emerald-600 text-[11px]">{formatCurrency(inv.paid)} paid</p>}
                            </div>
                            {inv.status === "paid" ? (
                              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePay(child.studentId, inv.id, inv.amount - inv.paid)}
                                disabled={paying === inv.id}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0055ff] text-white text-[12px] font-medium hover:bg-[#0044cc] transition disabled:opacity-50"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                {paying === inv.id ? "Processing..." : "Pay Now"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

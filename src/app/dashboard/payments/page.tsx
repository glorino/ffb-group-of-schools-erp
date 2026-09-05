"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard, Search, Filter, Download, CheckCircle, Clock, TrendingUp, Receipt, Loader2, Plus, X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface PaymentStudent { id: string; firstName: string; lastName: string; admissionNumber: string; }
interface PaymentInvoice { id: string; invoiceNumber: string; schoolFee: { name: string } | null; }
interface Payment {
  id: string; amount: number; status: string; method: string; reference: string | null;
  paidAt: string | null; student: PaymentStudent; invoice: PaymentInvoice | null;
}
interface Pagination { page: number; limit: number; total: number; pages: number; }

const formatNaira = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" as const, background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "10px 20px", borderRadius: "12px", border: "none", background: disabled ? "#94a3b8" : bg, color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 });

const statusColor = (s: string) => {
  if (s === "completed" || s === "confirmed") return { bg: "rgba(16,185,129,0.1)", color: "#16a34a" };
  if (s === "pending") return { bg: "rgba(245,158,11,0.1)", color: "#d97706" };
  return { bg: "rgba(239,68,68,0.1)", color: "#dc2626" };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [recordForm, setRecordForm] = useState({ amount: "", method: "cash", reference: "", description: "", invoiceId: "" });

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
    } catch { toast.error("Failed to load payments"); } finally { setLoading(false); }
  }, [search, filterStatus, filterMethod]);

  useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  const handleExport = () => {
    if (!payments.length) { toast.error("No payments to export"); return; }
    downloadCSV(payments.map((p) => ({ Student: `${p.student.firstName} ${p.student.lastName}`, "Admission No": p.student.admissionNumber, Amount: p.amount, Method: p.method, Status: p.status, Reference: p.reference || "", "Paid At": p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "", "Invoice": p.invoice?.invoiceNumber || "" })), "payments");
    toast.success("Payments exported successfully");
  };

  const searchStudents = async (q: string) => {
    setStudentSearch(q);
    if (q.length < 2) { setStudentResults([]); return; }
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setStudentResults(data.students || []);
    } catch { setStudentResults([]); }
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent) { toast.error("Select a student"); return; }
    const amount = parseFloat(recordForm.amount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    setRecording(true);
    try {
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount,
          method: recordForm.method,
          reference: recordForm.reference || undefined,
          description: recordForm.description || undefined,
          invoiceId: recordForm.invoiceId || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      toast.success(`Payment of ${formatNaira(amount)} recorded for ${selectedStudent.firstName} ${selectedStudent.lastName}`);
      setShowRecordModal(false);
      setSelectedStudent(null);
      setStudentSearch("");
      setRecordForm({ amount: "", method: "cash", reference: "", description: "", invoiceId: "" });
      fetchPayments(1);
    } catch (err: any) { toast.error(err.message || "Failed to record payment"); } finally { setRecording(false); }
  };

  const totalCollected = payments.filter((p) => p.status === "completed" || p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  const kpis = [
    { label: "Total Collected", value: formatNaira(totalCollected), bg: "linear-gradient(135deg, #0055ff, #0033cc)", icon: <TrendingUp style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Pending Amount", value: formatNaira(totalPending), bg: "linear-gradient(135deg, #10b981, #059669)", icon: <Clock style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Total Payments", value: pagination.total.toString(), bg: "linear-gradient(135deg, #f59e0b, #d97706)", icon: <CreditCard style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Transactions", value: payments.length.toString(), bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", icon: <Receipt style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}><CreditCard style={{ width: "28px", height: "28px" }} /> Payments</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>View payment history, confirm transactions, and manage receipts</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowRecordModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "#10b981", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")} onMouseLeave={(e) => (e.currentTarget.style.background = "#10b981")}>
              <Plus style={{ width: "16px", height: "16px" }} /> Record Payment
            </button>
            <button onClick={handleExport} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {kpis.map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Header + Filters */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Payment History</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", maxWidth: "220px" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "130px", padding: "10px 14px", cursor: "pointer", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur}>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">All Status</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="completed">Completed</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="pending">Pending</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="failed">Failed</option>
            </select>
            <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "140px", padding: "10px 14px", cursor: "pointer", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur}>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">All Methods</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="cash">Cash</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="bank_transfer">Bank Transfer</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="card">Card</option>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="online">Online</option>
            </select>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Filter using dropdowns above">
              <Filter style={{ width: "16px", height: "16px", color: "#64748b" }} />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff" }} className="animate-spin" /></div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><Receipt style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 16px" }} /><p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No payments found</p></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Student", "Amount", "Method", "Invoice", "Date", "Status", "Reference"].map(h => (<th key={h} style={{ padding: "12px 20px", textAlign: "left" as const, fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "2px solid #f1f5f9" }}>{h}</th>))}</tr></thead>
              <tbody>
                {payments.map((p, i) => {
                  const sc = statusColor(p.status);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{p.student.firstName} {p.student.lastName}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{p.student.admissionNumber}</p>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{formatNaira(p.amount)}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "6px", background: "#f8fafc", fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "capitalize" as const }}>{p.method?.replace("_", " ") || "\u2014"}</span></td>
                      <td style={{ padding: "14px 20px" }}>
                        {p.invoice ? (<div><p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{p.invoice.invoiceNumber}</p>{p.invoice.schoolFee && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{p.invoice.schoolFee.name}</p>}</div>) : <span style={{ fontSize: "12px", color: "#94a3b8" }}>\u2014</span>}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "\u2014"}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>{p.status}</span></td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#94a3b8" }}>{p.reference || "\u2014"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button key={pageNum} onClick={() => fetchPayments(pageNum)} style={{ padding: "6px 12px", borderRadius: "8px", border: pagination.page === pageNum ? "none" : "1px solid #e2e8f0", background: pagination.page === pageNum ? "#0055ff" : "#f8fafc", color: pagination.page === pageNum ? "#ffffff" : "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{pageNum}</button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowRecordModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Record Payment</h3>
              <button onClick={() => setShowRecordModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}><X style={{ width: "20px", height: "20px", color: "#64748b" }} /></button>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Student Search */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Student *</label>
                {selectedStudent ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f0fdf4", borderRadius: "10px", border: "1.5px solid #bbf7d0" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{selectedStudent.firstName} {selectedStudent.lastName}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>{selectedStudent.admissionNumber}</p>
                    </div>
                    <button onClick={() => { setSelectedStudent(null); setStudentSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X style={{ width: "16px", height: "16px", color: "#64748b" }} /></button>
                  </div>
                ) : (
                  <div>
                    <input type="text" placeholder="Search by name or admission number..." value={studentSearch} onChange={(e) => searchStudents(e.target.value)} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                    {studentResults.length > 0 && (
                      <div style={{ marginTop: "4px", border: "1px solid #e2e8f0", borderRadius: "10px", maxHeight: "150px", overflow: "auto" }}>
                        {studentResults.map((s) => {
                          const btnStyle2: React.CSSProperties = { display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "#0f172a" };
                          return (
                            <button key={s.id} onClick={() => { setSelectedStudent(s); setStudentResults([]); setStudentSearch(""); }} style={btnStyle2} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                              {s.firstName} {s.lastName} <span style={{ color: "#94a3b8", fontSize: "11px" }}>({s.admissionNumber})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Amount */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Amount (NGN) *</label>
                <input type="number" placeholder="e.g. 50000" value={recordForm.amount} onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              {/* Method */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Payment Method *</label>
                <select value={recordForm.method} onChange={(e) => setRecordForm({ ...recordForm, method: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="cash" style={{ background: "#ffffff" }}>Cash</option>
                  <option value="bank_transfer" style={{ background: "#ffffff" }}>Bank Transfer</option>
                  <option value="card" style={{ background: "#ffffff" }}>Card</option>
                  <option value="online" style={{ background: "#ffffff" }}>Online</option>
                </select>
              </div>
              {/* Reference */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Reference (optional)</label>
                <input type="text" placeholder="Teller number, transaction ID..." value={recordForm.reference} onChange={(e) => setRecordForm({ ...recordForm, reference: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Description (optional)</label>
                <input type="text" placeholder="School fees, transport, etc." value={recordForm.description} onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
            <div style={{ padding: "16px 28px 24px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowRecordModal(false)} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleRecordPayment} disabled={recording || !selectedStudent} style={btnStyle("#10b981", recording || !selectedStudent)}>
                {recording ? <><Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" /> Recording...</> : <><CheckCircle style={{ width: "14px", height: "14px" }} /> Record Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

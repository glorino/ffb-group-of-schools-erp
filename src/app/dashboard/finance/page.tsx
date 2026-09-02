"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/school-config";
import {
  CreditCard, Search, Download, TrendingUp, ArrowUpRight, ArrowDownRight,
  Plus, CheckCircle2, Clock, Wallet, Receipt, AlertCircle, X, Loader2, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface Payment {
  id: string; amount: number; method: string; status: string; reference: string; paidAt: string;
  student?: { firstName: string; lastName: string; class?: { name: string } };
  studentName?: string; className?: string; date?: string;
}
interface Invoice {
  id: string; invoiceNumber: string; amount: number; totalAmount: number; discount: number;
  dueDate: string; status: string; notes?: string;
  student?: { id: string; firstName: string; lastName: string; admissionNumber: string; class?: { name: string } };
  schoolFee?: { id: string; name: string; type: string; amount: number };
}
interface Student { id: string; firstName: string; lastName: string; admissionNumber: string; class?: { name: string } }
interface SchoolFee { id: string; name: string; type: string; amount: number }

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" as const, background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "10px 20px", borderRadius: "12px", border: "none", background: disabled ? "#94a3b8" : bg, color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 });

export default function FinancePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<SchoolFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "payments" | "invoices">("overview");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedFeeName, setSelectedFeeName] = useState("");
  const [form, setForm] = useState({ studentId: "", amount: "", schoolFeeId: "", dueDate: "", description: "", paymentType: "full" });
  const [filterSession, setFilterSession] = useState("");
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/payments").then(r => r.json()).catch(() => ({ payments: [] })),
      fetch("/api/finance/invoices").then(r => r.json()).catch(() => ({ invoices: [] })),
      fetch("/api/students?limit=200").then(r => r.json()).catch(() => ({ students: [] })),
      fetch("/api/finance/fees?limit=100").then(r => r.json()).catch(() => ({ fees: [] })),
    ]).then(([payData, invData, studData, feeData]) => {
      setPayments(payData.payments || []);
      setInvoices(invData.invoices || []);
      setStudents(studData.students || []);
      setFees(feeData.fees || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ps = params.get("payment");
    if (ps === "success") { toast.success("Payment completed successfully!"); window.history.replaceState({}, "", "/dashboard/finance"); }
    else if (ps === "error") { toast.error("Payment failed. Please try again."); window.history.replaceState({}, "", "/dashboard/finance"); }
  }, []);

  useEffect(() => { fetch("/api/calendar").then(r => r.json()).then(d => { setAcademicYears(d.academicYears || []); setTerms(d.terms || []); }).catch(() => {}); }, []);
  useEffect(() => { if (showModal) { setShowStudentDropdown(false); setStudentSearch(""); setSelectedStudentName(""); setSelectedFeeName(""); } }, [showModal]);

  const filteredStudents = students.filter(s =>
    (`${s.firstName} ${s.lastName}`).toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const filteredPayments = payments.filter(p => {
    if (filterSession && p.paidAt && !new Date(p.paidAt).getFullYear().toString().includes(filterSession)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    const name = p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "");
    return name.toLowerCase().includes(s) || (p.student?.class?.name || p.className || "").toLowerCase().includes(s) || (p.reference || "").toLowerCase().includes(s);
  });
  const filteredInvoices = invoices.filter(inv => {
    if (filterSession && inv.dueDate && !new Date(inv.dueDate).getFullYear().toString().includes(filterSession)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : "").toLowerCase().includes(s) || inv.invoiceNumber.toLowerCase().includes(s);
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = invoices.filter(i => i.status === "pending" || i.status === "overdue").reduce((sum, i) => sum + (i.totalAmount || i.amount), 0);
  const verifiedPayments = payments.filter(p => p.status === "verified").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;

  const handleRemind = async (invoice: Invoice) => { try { const res = await fetch("/api/finance/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId: invoice.id }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed"); toast.success(data.message || "Reminder sent"); } catch (err: any) { toast.error(err.message || "Failed"); } };
  const handlePayNow = async (invoice: any) => { try { const res = await fetch("/api/payments/initialize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: invoice.studentId, amount: invoice.totalAmount || invoice.amount, email: invoice.student?.email || "", name: invoice.student ? `${invoice.student.firstName} ${invoice.student.lastName}` : "" }) }); const data = await res.json(); if (data.paymentLink) { window.location.href = data.paymentLink; } else { toast.error(data.error || "Failed to initialize payment"); } } catch { toast.error("Failed to initialize payment"); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.schoolFeeId || !form.dueDate) { toast.error("Please fill in all required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/finance/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: form.studentId, schoolFeeId: form.schoolFeeId, amount: Number(form.amount), dueDate: form.dueDate, notes: form.description || undefined, paymentType: form.paymentType }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      toast.success("Invoice created successfully");
      setShowModal(false);
      setForm({ studentId: "", amount: "", schoolFeeId: "", dueDate: "", description: "", paymentType: "full" });
      setSelectedStudentName(""); setSelectedFeeName("");
      const invData = await fetch("/api/finance/invoices").then(r => r.json());
      setInvoices(invData.invoices || []);
    } catch (err: any) { toast.error(err.message || "Failed to create invoice"); } finally { setSubmitting(false); }
  };

  const handleExport = () => { if (payments.length === 0) { toast.info("No payments to export"); return; } downloadCSV(payments.map(p => ({ Student: p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "\u2014"), Amount: p.amount, Method: p.method || "\u2014", Status: p.status, Date: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "\u2014", Reference: p.reference || "\u2014" })), "finance_payments"); toast.success("Payments exported successfully"); };

  const formatCompact = (v: number) => v >= 1000000 ? formatCurrencyCompact(v) : formatCurrency(v);
  const tabs = ["overview", "payments", "invoices"] as const;
  const kpis = [
    { label: "Total Collected", value: formatCurrency(totalCollected), change: `+${verifiedPayments}`, up: true, bg: "linear-gradient(135deg, #10b981, #059669)", icon: "wallet" },
    { label: "Outstanding", value: formatCurrency(totalOutstanding), change: `-${pendingPayments}`, up: false, bg: "linear-gradient(135deg, #f59e0b, #d97706)", icon: "receipt" },
    { label: "Total Payments", value: String(payments.length), change: `+${payments.length}`, up: true, bg: "linear-gradient(135deg, #0055ff, #0033cc)", icon: "trending" },
    { label: "Pending Invoices", value: String(invoices.filter(i => i.status !== "paid").length), change: "+0", up: false, bg: "linear-gradient(135deg, #ef4444, #dc2626)", icon: "alert" },
  ];
  const kpiIcons: Record<string, React.ReactNode> = {
    wallet: <Wallet style={{ width: "20px", height: "20px", color: "#ffffff" }} />,
    receipt: <Receipt style={{ width: "20px", height: "20px", color: "#ffffff" }} />,
    trending: <TrendingUp style={{ width: "20px", height: "20px", color: "#ffffff" }} />,
    alert: <AlertCircle style={{ width: "20px", height: "20px", color: "#ffffff" }} />,
  };

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}><CreditCard style={{ width: "28px", height: "28px" }} /> Finance</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage fees, payments, and financial records</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "140px", padding: "10px 14px", cursor: "pointer" as const, colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
              <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">All Sessions</option>
              {academicYears.map((y: any) => <option key={y.id} style={{ background: "#ffffff", color: "#1a1a2e" }} value={y.name}>{y.name}</option>)}
            </select>
            <button onClick={handleExport} style={btnStyle("#ffffff")}><span style={{ color: "#475569" }}><Download style={{ width: "16px", height: "16px", display: "inline" }} /></span><span style={{ color: "#475569" }}>Export</span></button>
            {!isReadOnly && <button onClick={() => setShowModal(true)} style={btnStyle("#0055ff")}><Plus style={{ width: "16px", height: "16px" }} /> Create Invoice</button>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "6px", marginBottom: "24px" }}>
        {tabs.map(t => (<button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px 0", borderRadius: "12px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" as const, transition: "all 0.2s", background: tab === t ? "#ffffff" : "transparent", color: tab === t ? "#0f172a" : "#94a3b8", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>{t}</button>))}
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {kpis.map((stat, i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{kpiIcons[stat.icon]}</div>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: stat.up ? "#16a34a" : "#dc2626" }}>
                    {stat.up ? <ArrowUpRight style={{ width: "14px", height: "14px" }} /> : <ArrowDownRight style={{ width: "14px", height: "14px" }} />}{stat.change}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Recent Payments</h3>
              </div>
              <div style={{ padding: "8px" }}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff" }} className="animate-spin" /></div>
                ) : payments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}><p style={{ margin: 0, fontSize: "14px" }}>No payments recorded yet</p></div>
                ) : (
                  payments.slice(0, 5).map((p, i) => (
                    <div key={p.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", marginBottom: "4px", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 style={{ width: "18px", height: "18px", color: "#16a34a" }} /></div>
                        <div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "\u2014")}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{p.method || "\u2014"} \u00b7 {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : (p.date || "\u2014")}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(p.amount || 0)}</p>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: p.status === "verified" ? "#16a34a" : "#d97706" }}>{p.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Payment Status</h3>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {[
                  { label: "Verified", count: verifiedPayments, color: "#10b981" },
                  { label: "Pending", count: pendingPayments, color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: "12px", background: "#f8fafc", marginBottom: i === 0 ? "10px" : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{item.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>{item.count}</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "#f1f5f9" }}>
                      <div style={{ height: "6px", borderRadius: "3px", background: item.color, width: `${Math.min((item.count / Math.max(verifiedPayments + pendingPayments, 1)) * 100, 100)}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Quick Actions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {!isReadOnly && (
                      <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: "10px 16px", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}><Plus style={{ width: "14px", height: "14px" }} /> Create Invoice</button>
                    )}
                    <button onClick={handleExport} style={{ width: "100%", padding: "10px 16px", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}><Download style={{ width: "14px", height: "14px" }} /> Export Payments</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "payments" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", maxWidth: "320px", flex: 1 }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px" }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff" }} className="animate-spin" /></div>
          ) : filteredPayments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}><Receipt style={{ width: "40px", height: "40px", color: "#cbd5e1", margin: "0 auto 16px" }} /><p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No payments found</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Student", "Class", "Amount", "Method", "Date", "Status"].map(h => (<th key={h} style={{ padding: "12px 20px", textAlign: "left" as const, fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "2px solid #f1f5f9" }}>{h}</th>))}</tr></thead>
                <tbody>
                  {filteredPayments.map((p, i) => (
                    <tr key={p.id || i} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{p.student ? `${p.student.firstName} ${p.student.lastName}` : (p.studentName || "\u2014")}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "6px", background: "#f8fafc", fontSize: "11px", fontWeight: 500, color: "#64748b" }}>{p.student?.class?.name || p.className || "\u2014"}</span></td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(p.amount || 0)}</td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{p.method || "\u2014"}</td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#94a3b8" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : (p.date || "\u2014")}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: p.status === "verified" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: p.status === "verified" ? "#16a34a" : "#d97706" }}>{p.status === "verified" ? <CheckCircle2 style={{ width: "12px", height: "12px" }} /> : <Clock style={{ width: "12px", height: "12px" }} />}{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Invoices</h3>
            <div style={{ position: "relative", maxWidth: "280px" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px" }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff" }} className="animate-spin" /></div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}><Receipt style={{ width: "40px", height: "40px", color: "#cbd5e1", margin: "0 auto 16px" }} /><p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No invoices found</p><p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Create one to get started</p></div>
          ) : (
            <div style={{ padding: "12px" }}>
              {filteredInvoices.map((inv, i) => {
                const daysLeft = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);
                const isUrgent = inv.status !== "paid" && daysLeft <= 7;
                return (
                  <div key={inv.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: "12px", marginBottom: "8px", border: "1px solid #f1f5f9", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: inv.status === "paid" ? "rgba(16,185,129,0.1)" : isUrgent ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Receipt style={{ width: "20px", height: "20px", color: inv.status === "paid" ? "#16a34a" : isUrgent ? "#dc2626" : "#d97706" }} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : "\u2014"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{inv.invoiceNumber} \u00b7 {inv.schoolFee?.name || "Fee"} \u00b7 Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(inv.totalAmount || inv.amount)}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600, color: inv.status === "paid" ? "#16a34a" : isUrgent ? "#dc2626" : "#d97706" }}>{inv.status === "paid" ? "Paid" : `${daysLeft} days left`}</p>
                      </div>
                      {inv.status !== "paid" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handlePayNow(inv)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "rgba(16,185,129,0.1)", color: "#16a34a", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}>Pay Now</button>
                          <button onClick={() => handleRemind(inv)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "rgba(0,85,255,0.1)", color: "#0055ff", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,85,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,85,255,0.1)")}>Remind</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowModal(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "560px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>Create Invoice</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Generate a new fee invoice for a student</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <label style={labelStyle}>Student *</label>
                <button type="button" onClick={() => setShowStudentDropdown(!showStudentDropdown)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.background = "#ffffff"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}>
                  <span style={{ color: selectedStudentName ? "#0f172a" : "#94a3b8" }}>{selectedStudentName || "Select a student..."}</span>
                  <ChevronDown style={{ width: "16px", height: "16px", color: "#94a3b8", transform: showStudentDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>
                {showStudentDropdown && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden" }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                      <input type="text" placeholder="Search students..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} style={{ ...inputStyle, padding: "8px 12px", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur} autoFocus />
                    </div>
                    <div style={{ maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
                      {filteredStudents.length === 0 ? (
                        <p style={{ textAlign: "center", padding: "16px", fontSize: "12px", color: "#94a3b8" }}>No students found</p>
                      ) : filteredStudents.map(s => (
                        <button key={s.id} type="button" onClick={() => { setForm({ ...form, studentId: s.id }); setSelectedStudentName(`${s.firstName} ${s.lastName} (${s.admissionNumber})`); setShowStudentDropdown(false); setStudentSearch(""); }} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "none", background: form.studentId === s.id ? "rgba(0,85,255,0.06)" : "transparent", cursor: "pointer", textAlign: "left" as const, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = form.studentId === s.id ? "rgba(0,85,255,0.06)" : "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = form.studentId === s.id ? "rgba(0,85,255,0.06)" : "transparent")}>
                          <div><p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{s.firstName} {s.lastName}</p><p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.admissionNumber} \u00b7 {s.class?.name || "\u2014"}</p></div>
                          {form.studentId === s.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0055ff" }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, fontSize: "13px" }}>Payment Type</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["full", "instalment"].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, paymentType: t })} style={{ flex: 1, padding: "10px 0", borderRadius: "10px", border: form.paymentType === t ? "1.5px solid #0055ff" : "1.5px solid #e2e8f0", background: form.paymentType === t ? "rgba(0,85,255,0.06)" : "#f8fafc", color: form.paymentType === t ? "#0055ff" : "#64748b", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{t === "full" ? "Full Payment" : "Instalment"}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>{form.paymentType === "full" ? "Amount" : "Instalment Amount"} *</label>
                  <input type="number" required min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} placeholder="0" onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Due Date *</label>
                  <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={{ ...inputStyle, colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>School Fee *</label>
                <select value={form.schoolFeeId} onChange={(e) => { setForm({ ...form, schoolFeeId: e.target.value }); const f = fees.find(fe => fe.id === e.target.value); setSelectedFeeName(f ? `${f.name} (${f.type})` : ""); }} style={{ ...inputStyle, cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">Select fee type</option>
                  {fees.map(f => (<option key={f.id} value={f.id} style={{ background: "#ffffff", color: "#1a1a2e" }}>{f.name} \u2014 {formatCurrency(f.amount)}</option>))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} placeholder="Optional notes..." onFocus={inputFocus} onBlur={inputBlur} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>Cancel</button>
                <button type="submit" disabled={submitting} style={btnStyle("#0055ff", submitting)}>
                  {submitting && <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />} Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

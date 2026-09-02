"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/school-config";
import { Wallet, Plus, Search, Download, CheckCircle, Clock, Users, X, Loader2, Zap, Mail, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface PayrollEntry {
  id: string; teacherId: string; month: string; year: number; basicSalary: number; allowances: number; deductions: number; bonus: number; netSalary: number; status: string; paidAt: string | null; payslipSent: boolean; payslipSentAt: string | null;
  teacher: { id: string; firstName: string; lastName: string; employeeId: string; email: string };
}
interface PayrollStats { totalNet: number; totalDeductions: number; paidCount: number; pendingCount: number; total: number; }

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" as const, background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "10px 20px", borderRadius: "12px", border: "none", background: disabled ? "#94a3b8" : bg, color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 });

const avatarGradients = [
  "linear-gradient(135deg, #0055ff, #0033cc)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
  "linear-gradient(135deg, #06b6d4, #0891b2)",
];

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(String(new Date().getMonth() + 1));
  const [currentYear, setCurrentYear] = useState(String(new Date().getFullYear()));
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; firstName: string; lastName: string; employeeId: string }[]>([]);
  const [form, setForm] = useState({ teacherId: "", basicSalary: "", allowances: "", deductions: "" });

  const fetchPayroll = () => {
    fetch(`/api/payroll?month=${currentMonth}&year=${currentYear}`)
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls || []); setStats(d.stats || null); })
      .catch(() => { setPayrolls([]); toast.error("Failed to load payroll"); });
  };

  useEffect(() => {
    setLoading(true);
    fetchPayroll();
    setTimeout(() => setLoading(false), 300);
  }, [currentMonth, currentYear]);

  useEffect(() => { fetch("/api/teachers?limit=100").then(r => r.json()).then(d => setTeachers(d.teachers || [])).catch(() => {}); }, []);

  const filtered = payrolls.filter(p => !search || `${p.teacher.firstName} ${p.teacher.lastName}`.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.teacherId || !form.basicSalary) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherId: form.teacherId, month: currentMonth, year: currentYear, basicSalary: parseFloat(form.basicSalary), allowances: parseFloat(form.allowances || "0"), deductions: parseFloat(form.deductions || "0") }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setShowModal(false); setForm({ teacherId: "", basicSalary: "", allowances: "", deductions: "" });
      toast.success("Payroll entry created");
      fetchPayroll();
    } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch("/api/payroll", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "paid" }) });
      if (!res.ok) throw new Error("Failed to update");
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p));
      toast.success("Marked as paid");
    } catch { toast.error("Failed to mark as paid"); }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: currentMonth, year: currentYear }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      toast.success(data.message);
      fetchPayroll();
    } catch (err: any) { toast.error(err.message); } finally { setGenerating(false); }
  };

  const handleSendPayslip = async (payrollId: string) => {
    setSendingId(payrollId);
    try {
      const res = await fetch("/api/payroll/send-payslips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollIds: [payrollId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      if (data.sent > 0) {
        toast.success("Payslip sent successfully");
        setPayrolls(prev => prev.map(p => p.id === payrollId ? { ...p, payslipSent: true, payslipSentAt: new Date().toISOString() } : p));
      } else {
        toast.error(data.errors?.[0] || "Failed to send");
      }
    } catch (err: any) { toast.error(err.message); } finally { setSendingId(null); }
  };

  const handleSendAll = async () => {
    setSendingAll(true);
    try {
      const res = await fetch("/api/payroll/send-payslips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: currentMonth, year: currentYear }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      toast.success(data.message);
      fetchPayroll();
    } catch (err: any) { toast.error(err.message); } finally { setSendingAll(false); }
  };

  const fmt = (n: number) => formatCurrency(n);
  const monthLabel = `${monthNames[parseInt(currentMonth) - 1]} ${currentYear}`;

  const kpis = [
    { label: "Total Staff", value: String(stats?.total || 0), bg: "linear-gradient(135deg, #0055ff, #0033cc)", icon: <Users style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Total Net Pay", value: fmt(stats?.totalNet || 0), bg: "linear-gradient(135deg, #10b981, #059669)", icon: <Wallet style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Pending Payments", value: String(stats?.pendingCount || 0), bg: "linear-gradient(135deg, #f59e0b, #d97706)", icon: <Clock style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Processed", value: String(stats?.paidCount || 0), bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", icon: <CheckCircle style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}><Wallet style={{ width: "28px", height: "28px" }} /> Payroll Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage teacher salaries, allowances, deductions, and payments</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleAutoGenerate} disabled={generating} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: generating ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: generating ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: generating ? 0.6 : 1 }} onMouseEnter={(e) => { if (!generating) e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }} onMouseLeave={(e) => { if (!generating) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}>
              {generating ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Zap style={{ width: "16px", height: "16px" }} />}
              {generating ? "Generating..." : "Auto-Generate"}
            </button>
            <button onClick={handleSendAll} disabled={sendingAll || filtered.length === 0} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: sendingAll ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: sendingAll || filtered.length === 0 ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: sendingAll || filtered.length === 0 ? 0.6 : 1 }} onMouseEnter={(e) => { if (!sendingAll && filtered.length > 0) e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }} onMouseLeave={(e) => { if (!sendingAll && filtered.length > 0) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}>
              {sendingAll ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Mail style={{ width: "16px", height: "16px" }} />}
              {sendingAll ? "Sending..." : "Send All Payslips"}
            </button>
            <button onClick={() => { downloadCSV(filtered.map(p => ({ Name: `${p.teacher.firstName} ${p.teacher.lastName}`, "Employee ID": p.teacher.employeeId, Month: monthLabel, "Basic Salary": p.basicSalary, Allowances: p.allowances, Deductions: p.deductions, "Net Pay": p.netSalary, Status: p.status, "Payslip Sent": p.payslipSent ? "Yes" : "No" })), `payroll_${monthLabel}`); toast.success("Exported successfully"); }} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              <Plus style={{ width: "16px", height: "16px" }} /> Add Entry
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

      {/* Payroll Table */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>{monthLabel} Payroll</h3>
            <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "80px", padding: "8px 12px", fontSize: "12px", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
              {monthNames.map((m, i) => (<option key={i} value={String(i + 1)} style={{ background: "#ffffff", color: "#1a1a2e" }}>{m}</option>))}
            </select>
            <select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "80px", padding: "8px 12px", fontSize: "12px", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
              {[2024, 2025, 2026].map(y => (<option key={y} value={y} style={{ background: "#ffffff", color: "#1a1a2e" }}>{y}</option>))}
            </select>
          </div>
          <div style={{ position: "relative", maxWidth: "240px" }}>
            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
            <input type="text" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff", animation: "spin 1s linear infinite" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><Wallet style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 16px" }} /><p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No payroll entries for this period</p><p style={{ margin: "8px 0 0", fontSize: "13px", color: "#94a3b8" }}>Click &quot;Auto-Generate&quot; to create payroll for all active staff</p></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Staff", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Status", "Payslip", "Actions"].map((h, i) => (<th key={h} style={{ padding: "12px 20px", textAlign: i === 0 ? "left" : "right", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #f1f5f9" }}>{h}</th>))}</tr></thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: avatarGradients[idx % avatarGradients.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{p.teacher.firstName[0]}{p.teacher.lastName[0]}</span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{p.teacher.firstName} {p.teacher.lastName}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{p.teacher.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", color: "#475569" }}>{fmt(p.basicSalary)}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#16a34a" }}>{fmt(p.allowances || 0)}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#dc2626" }}>{fmt(p.deductions || 0)}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{fmt(p.netSalary)}</td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: p.status === "paid" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: p.status === "paid" ? "#16a34a" : "#d97706" }}>{p.status}</span>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      {p.payslipSent ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: "rgba(16,185,129,0.1)", color: "#16a34a" }}><CheckCheck style={{ width: "12px", height: "12px" }} /> Sent</span>
                      ) : (
                        <button onClick={() => handleSendPayslip(p.id)} disabled={sendingId === p.id} style={{ padding: "5px 12px", borderRadius: "8px", border: "none", background: "rgba(0,85,255,0.1)", color: "#0055ff", fontSize: "11px", fontWeight: 600, cursor: sendingId === p.id ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "4px", transition: "all 0.15s", opacity: sendingId === p.id ? 0.6 : 1 }}>
                          {sendingId === p.id ? <Loader2 style={{ width: "12px", height: "12px", animation: "spin 1s linear infinite" }} /> : <Mail style={{ width: "12px", height: "12px" }} />}
                          Send
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      {p.status === "pending" && (
                        <button onClick={() => handleMarkPaid(p.id)} style={{ padding: "5px 12px", borderRadius: "8px", border: "none", background: "rgba(16,185,129,0.1)", color: "#16a34a", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payroll Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowModal(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "520px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>Add Payroll Entry</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Create a new payroll entry for {monthLabel}</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Teacher *</label>
                <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">Select Teacher</option>
                  {teachers.map(t => (<option key={t.id} value={t.id} style={{ background: "#ffffff", color: "#1a1a2e" }}>{t.firstName} {t.lastName} ({t.employeeId})</option>))}
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Basic Salary *</label>
                <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} placeholder="e.g. 300000" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={labelStyle}>Allowances</label>
                  <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} placeholder="0" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Deductions</label>
                  <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} placeholder="0" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>Cancel</button>
                <button onClick={handleCreate} disabled={submitting} style={{ ...btnStyle("#0055ff", submitting), flex: 1, justifyContent: "center" }}>
                  {submitting && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />} Create Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

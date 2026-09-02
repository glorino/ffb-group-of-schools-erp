"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingDown, Plus, Search, Filter, Download, Receipt, AlertCircle, CheckCircle, Clock, Wrench, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrency } from "@/lib/school-config";
import { useSession } from "next-auth/react";

interface Expense { id: string; title: string; amount: number; category: string; date: string; status: string; vendor: string | null; notes: string | null; approvedBy: string | null; }
interface ExpenseStats { totalAmount: number; pendingAmount: number; totalCount: number; pendingCount: number; }

const categories = ["Salaries", "Utilities", "Maintenance", "Academic", "Security", "Transport", "Food & Supplies", "Others"];
const barColors: Record<string, string> = { Salaries: "#0055ff", Utilities: "#10b981", Maintenance: "#8b5cf6", Academic: "#f59e0b", Security: "#06b6d4", Transport: "#eab308", "Food & Supplies": "#ec4899", Others: "#6b7280" };

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" as const, background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "10px 20px", borderRadius: "12px", border: "none", background: disabled ? "#94a3b8" : bg, color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 });

const statusStyle = (s: string) => {
  if (s === "approved") return { bg: "rgba(16,185,129,0.1)", color: "#16a34a" };
  if (s === "rejected") return { bg: "rgba(239,68,68,0.1)", color: "#dc2626" };
  return { bg: "rgba(245,158,11,0.1)", color: "#d97706" };
};

export default function ExpensesPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canApprove = userRoles.some((r: string) => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));
  const canCreate = userRoles.some((r: string) => ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"].includes(r));

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({ totalAmount: 0, pendingAmount: 0, totalCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formVendor, setFormVendor] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);
      params.set("limit", "50");
      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
      setStats(data.stats || { totalAmount: 0, pendingAmount: 0, totalCount: 0, pendingCount: 0 });
    } catch { toast.error("Failed to load expenses"); } finally { setLoading(false); }
  }, [filterCategory, filterStatus]);
  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAddExpense = async () => {
    if (!formTitle.trim() || !formAmount || !formCategory) { toast.error("Please fill in title, amount, and category"); return; }
    try {
      setSubmitting(true);
      const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: formTitle, amount: parseFloat(formAmount), category: formCategory, date: formDate || undefined, vendor: formVendor || undefined, notes: formNotes || undefined }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Expense recorded successfully");
      setShowAddModal(false); setFormTitle(""); setFormAmount(""); setFormCategory(""); setFormDate(""); setFormVendor(""); setFormNotes("");
      fetchExpenses();
    } catch { toast.error("Failed to record expense"); } finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setProcessingId(id);
      const res = await fetch("/api/expenses", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Expense ${status === "approved" ? "approved" : "rejected"} successfully`);
      fetchExpenses();
    } catch { toast.error("Failed to update expense status"); } finally { setProcessingId(null); }
  };

  const handleExport = () => {
    if (!expenses.length) { toast.error("No expenses to export"); return; }
    downloadCSV(expenses.map((e) => ({ Title: e.title, Amount: e.amount, Category: e.category, Date: new Date(e.date).toLocaleDateString("en-NG"), Status: e.status, Vendor: e.vendor || "", Notes: e.notes || "", "Approved By": e.approvedBy || "" })), "expenses");
    toast.success("Expenses exported successfully");
  };

  const filteredExpenses = expenses.filter((e) => { if (!search) return true; const q = search.toLowerCase(); return e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.vendor && e.vendor.toLowerCase().includes(q)); });

  const categoryBreakdown = categories.map((cat) => {
    const catTotal = expenses.filter((e) => e.category === cat && e.status === "approved").reduce((sum, e) => sum + e.amount, 0);
    const percent = stats.totalAmount > 0 ? Math.round((catTotal / stats.totalAmount) * 100) : 0;
    return { label: cat, amount: catTotal, percent, color: barColors[cat] || "#6b7280" };
  }).filter((c) => c.amount > 0);

  const approvedCount = expenses.filter((e) => e.status === "approved").length;
  const pendingCount = expenses.filter((e) => e.status === "pending").length;
  const rejectedCount = expenses.filter((e) => e.status === "rejected").length;

  const kpis = [
    { label: "Total Expenses", value: formatCurrency(stats.totalAmount), bg: "linear-gradient(135deg, #0055ff, #0033cc)", icon: <TrendingDown style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Pending Amount", value: formatCurrency(stats.pendingAmount), bg: "linear-gradient(135deg, #10b981, #059669)", icon: <Receipt style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Total Count", value: stats.totalCount.toString(), bg: "linear-gradient(135deg, #f59e0b, #d97706)", icon: <Clock style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Pending Approvals", value: stats.pendingCount.toString(), bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", icon: <Wrench style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}><TrendingDown style={{ width: "28px", height: "28px" }} /> Expense Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Track and manage all school expenses, approvals, and budgets</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={handleExport} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            {canCreate && (
              <button onClick={() => setShowAddModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
                <Plus style={{ width: "16px", height: "16px" }} /> Record Expense
              </button>
            )}
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

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Expenses Table */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Recent Expenses</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative", maxWidth: "200px" }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
                <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "130px", padding: "10px 14px", cursor: "pointer", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur}>
                <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">All Status</option>
                <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="pending">Pending</option>
                <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="approved">Approved</option>
                <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="rejected">Rejected</option>
              </select>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Filter using dropdowns above">
                <Filter style={{ width: "16px", height: "16px", color: "#64748b" }} />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff" }} className="animate-spin" /></div>
          ) : filteredExpenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}><Receipt style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 16px" }} /><p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No expenses found</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Description", "Amount", "Category", "Date", "Status", "Actions"].map(h => (<th key={h} style={{ padding: "12px 20px", textAlign: "left" as const, fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "2px solid #f1f5f9" }}>{h}</th>))}</tr></thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const sc = statusStyle(expense.status);
                    return (
                      <tr key={expense.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px" }}>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{expense.title}</p>
                          {expense.vendor && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{expense.vendor}</p>}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(expense.amount)}</td>
                        <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "6px", background: "#f8fafc", fontSize: "11px", fontWeight: 500, color: "#475569" }}>{expense.category}</span></td>
                        <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{new Date(expense.date).toLocaleDateString("en-NG")}</td>
                        <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>{expense.status}</span></td>
                        <td style={{ padding: "14px 20px" }}>
                          {expense.status === "pending" && canApprove && (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleStatusUpdate(expense.id, "approved")} disabled={processingId === expense.id} style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: "rgba(16,185,129,0.1)", color: "#16a34a", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}>
                                {processingId === expense.id ? <Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" /> : <CheckCircle style={{ width: "12px", height: "12px" }} />} Approve
                              </button>
                              <button onClick={() => handleStatusUpdate(expense.id, "rejected")} disabled={processingId === expense.id} style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#dc2626", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}>
                                <X style={{ width: "12px", height: "12px" }} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Expense Categories */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Expense Categories</h3>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}><Loader2 style={{ width: "20px", height: "20px", color: "#0055ff" }} className="animate-spin" /></div>
              ) : categoryBreakdown.length === 0 ? (
                <p style={{ margin: 0, textAlign: "center", padding: "24px 0", fontSize: "13px", color: "#94a3b8" }}>No approved expenses yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {categoryBreakdown.map((item, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>{formatCurrency(item.amount)}</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "#f1f5f9" }}>
                        <div style={{ height: "6px", borderRadius: "3px", background: item.color, width: `${item.percent}%`, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.percent}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Quick Summary</h3>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Approved", count: approvedCount, icon: <CheckCircle style={{ width: "16px", height: "16px", color: "#16a34a" }} />, color: "#16a34a" },
                { label: "Pending", count: pendingCount, icon: <Clock style={{ width: "16px", height: "16px", color: "#d97706" }} />, color: "#d97706" },
                { label: "Rejected", count: rejectedCount, icon: <AlertCircle style={{ width: "16px", height: "16px", color: "#dc2626" }} />, color: "#dc2626" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {item.icon}
                    <span style={{ fontSize: "13px", color: "#475569" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowAddModal(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "520px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: "85vh", overflowY: "auto" as const }}>
            {/* Modal Gradient Header */}
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>Record New Expense</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Add a new expense entry for tracking</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Title *</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Teacher Salaries" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Amount *</label>
                  <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">Select category</option>
                    {categories.map((cat) => (<option key={cat} value={cat} style={{ background: "#ffffff", color: "#1a1a2e" }}>{cat}</option>))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} style={{ ...inputStyle, colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Vendor</label>
                  <input type="text" value={formVendor} onChange={(e) => setFormVendor(e.target.value)} placeholder="Vendor name" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional notes..." rows={3} style={{ ...inputStyle, resize: "none" as const, minHeight: "80px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>Cancel</button>
                <button onClick={handleAddExpense} disabled={submitting} style={{ ...btnStyle("#0055ff", submitting), flex: 1, justifyContent: "center" }}>
                  {submitting && <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />} {submitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

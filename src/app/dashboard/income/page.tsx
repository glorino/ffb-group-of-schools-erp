"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Plus, Search, Filter, Download, ArrowUpRight, CreditCard, Calendar, BarChart3, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrency } from "@/lib/school-config";

interface IncomeCategory { id: string; name: string; }
interface Income { id: string; title: string; amount: number; date: string; reference: string | null; notes: string | null; category: IncomeCategory | null; }
interface IncomeStats { totalIncome: number; count: number; }

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" as const, background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "10px 20px", borderRadius: "12px", border: "none", background: disabled ? "#94a3b8" : bg, color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 });

const barColors = ["#0055ff", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#eab308", "#14b8a6"];

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [stats, setStats] = useState<IncomeStats>({ totalIncome: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formReference, setFormReference] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchIncomes = useCallback(async () => {
    try { setLoading(true); const res = await fetch("/api/income"); if (!res.ok) throw new Error("Failed"); const data = await res.json(); setIncomes(data.incomes || []); setIncomeCategories(data.categories || []); setStats(data.stats || { totalIncome: 0, count: 0 }); } catch { toast.error("Failed to load income data"); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const handleAddIncome = async () => {
    if (!formTitle.trim() || !formAmount) { toast.error("Please fill in title and amount"); return; }
    try {
      setSubmitting(true);
      const res = await fetch("/api/income", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: formTitle, amount: parseFloat(formAmount), categoryId: formCategoryId || undefined, date: formDate || undefined, reference: formReference || undefined, notes: formNotes || undefined }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Income recorded successfully");
      setShowAddModal(false); setFormTitle(""); setFormAmount(""); setFormCategoryId(""); setFormDate(""); setFormReference(""); setFormNotes("");
      fetchIncomes();
    } catch { toast.error("Failed to record income"); } finally { setSubmitting(false); }
  };

  const handleExport = () => {
    if (!incomes.length) { toast.error("No income records to export"); return; }
    downloadCSV(incomes.map((i) => ({ Title: i.title, Amount: i.amount, Category: i.category?.name || "", Date: new Date(i.date).toLocaleDateString("en-NG"), Reference: i.reference || "", Notes: i.notes || "" })), "income");
    toast.success("Income exported successfully");
  };

  const filteredIncomes = incomes.filter((i) => { if (!search) return true; const q = search.toLowerCase(); return i.title.toLowerCase().includes(q) || (i.category?.name && i.category.name.toLowerCase().includes(q)) || (i.reference && i.reference.toLowerCase().includes(q)); });

  const categoryMap = filteredIncomes.reduce<Record<string, number>>((acc, i) => { const cat = i.category?.name || "Uncategorized"; acc[cat] = (acc[cat] || 0) + i.amount; return acc; }, {});
  const categoryBreakdown = Object.entries(categoryMap).map(([name, amount]) => ({ name, amount, percent: stats.totalIncome > 0 ? Math.round((amount / stats.totalIncome) * 100) : 0 })).sort((a, b) => b.amount - a.amount);

  const thisMonthTotal = incomes.filter((i) => { const d = new Date(i.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((sum, i) => sum + i.amount, 0);

  const kpis = [
    { label: "Total Income", value: formatCurrency(stats.totalIncome), bg: "linear-gradient(135deg, #0055ff, #0033cc)", icon: <TrendingUp style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Transactions", value: stats.count.toString(), bg: "linear-gradient(135deg, #10b981, #059669)", icon: <Calendar style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "Categories", value: incomeCategories.length.toString(), bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", icon: <BarChart3 style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
    { label: "This Month", value: formatCurrency(thisMonthTotal), bg: "linear-gradient(135deg, #10b981, #14b8a6)", icon: <ArrowUpRight style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}><TrendingUp style={{ width: "28px", height: "28px" }} /> Income Tracking</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Monitor all income sources, revenue streams, and financial trends</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={handleExport} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            <button onClick={() => setShowAddModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              <Plus style={{ width: "16px", height: "16px" }} /> Record Income
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

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Income Sources Table */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Income Sources</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative", maxWidth: "220px" }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
                <input type="text" placeholder="Search income..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px", fontSize: "12px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Filter using search above">
                <Filter style={{ width: "16px", height: "16px", color: "#64748b" }} />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "24px", height: "24px", color: "#0055ff" }} className="animate-spin" /></div>
          ) : filteredIncomes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}><CreditCard style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 16px" }} /><p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No income records found</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Source", "Amount", "Category", "Date", "Reference"].map(h => (<th key={h} style={{ padding: "12px 20px", textAlign: "left" as const, fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "2px solid #f1f5f9" }}>{h}</th>))}</tr></thead>
                <tbody>
                  {filteredIncomes.map((income) => (
                    <tr key={income.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{income.title}</td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(income.amount)}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "6px", background: "#f8fafc", fontSize: "11px", fontWeight: 500, color: "#475569" }}>{income.category?.name || "Uncategorized"}</span></td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{new Date(income.date).toLocaleDateString("en-NG")}</td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#94a3b8" }}>{income.reference || "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Income Breakdown Sidebar */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Income Breakdown</h3>
          </div>
          <div style={{ padding: "20px 24px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}><Loader2 style={{ width: "20px", height: "20px", color: "#0055ff" }} className="animate-spin" /></div>
            ) : categoryBreakdown.length === 0 ? (
              <p style={{ margin: 0, textAlign: "center", padding: "24px 0", fontSize: "13px", color: "#94a3b8" }}>No income data yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {categoryBreakdown.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{item.name}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>{formatCurrency(item.amount)}</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "#f1f5f9" }}>
                      <div style={{ height: "6px", borderRadius: "3px", background: barColors[i % barColors.length], width: `${item.percent}%`, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.percent}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Quick Stats</p>
              {[
                { label: "Total Income", value: formatCurrency(stats.totalIncome) },
                { label: "Transactions", value: stats.count.toString() },
                { label: "Categories", value: incomeCategories.length.toString() },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "#f8fafc", marginBottom: i < 2 ? "6px" : 0 }}>
                  <span style={{ fontSize: "13px", color: "#475569" }}>{item.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Income Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowAddModal(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "520px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: "85vh", overflowY: "auto" as const }}>
            {/* Modal Gradient Header */}
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>Record New Income</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Add a new income entry to track revenue</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Title *</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. School Fees - JSS" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Amount *</label>
                  <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">Select category</option>
                    {incomeCategories.map((cat) => (<option key={cat.id} value={cat.id} style={{ background: "#ffffff", color: "#1a1a2e" }}>{cat.name}</option>))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} style={{ ...inputStyle, colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Reference</label>
                  <input type="text" value={formReference} onChange={(e) => setFormReference(e.target.value)} placeholder="e.g. REF-001" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional notes..." rows={3} style={{ ...inputStyle, resize: "none" as const, minHeight: "80px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>Cancel</button>
                <button onClick={handleAddIncome} disabled={submitting} style={{ ...btnStyle("#0055ff", submitting), flex: 1, justifyContent: "center" }}>
                  {submitting && <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />} {submitting ? "Saving..." : "Record Income"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

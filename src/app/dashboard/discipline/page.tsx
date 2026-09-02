"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Search, Plus, Edit3, Trash2, X, Loader2, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface DisciplineRecord {
  id: string;
  studentId: string;
  type: string;
  title: string;
  details?: string;
  date: string;
  action?: string;
  reportedBy?: string;
  createdAt: string;
  student: { id: string; firstName: string; lastName: string; admissionNumber?: string; class?: { name: string } };
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const modalCard: React.CSSProperties = { background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" };
const modalGradient: React.CSSProperties = { padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" };

const typeStyles: Record<string, { bg: string; color: string }> = {
  behavior: { bg: "#fef3c7", color: "#d97706" },
  academic: { bg: "#eff6ff", color: "#2563eb" },
  attendance: { bg: "#fef2f2", color: "#dc2626" },
  safety: { bg: "#f3e8ff", color: "#7c3aed" },
};

const actionStyles: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fef3c7", color: "#d97706" },
  warning: { bg: "#fff7ed", color: "#ea580c" },
  suspension: { bg: "#fef2f2", color: "#dc2626" },
  expulsion: { bg: "#fef2f2", color: "#b91c1c" },
  resolved: { bg: "#dcfce7", color: "#16a34a" },
};

export default function DisciplinePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [stats, setStats] = useState({ totalIncidents: 0, resolved: 0, pending: 0, byType: [], monthlyTrend: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DisciplineRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ studentId: "", type: "behavior", title: "", details: "", date: new Date().toISOString().split("T")[0], action: "pending" });
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState({ type: "", status: "", search: "" });

  useEffect(() => { fetchRecords(); fetchStudents(); }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/discipline");
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        setStats({ totalIncidents: data.totalIncidents, resolved: data.resolved, pending: data.pending, byType: data.byType, monthlyTrend: data.monthlyTrend });
      }
    } catch {} finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try { const res = await fetch("/api/students?limit=200"); const data = await res.json(); if (data.students) setStudents(data.students); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingRecord ? "PUT" : "POST";
      const body = editingRecord ? { id: editingRecord.id, ...form } : form;
      const res = await fetch("/api/discipline", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingRecord ? "Record updated" : "Record created");
        setShowModal(false); setEditingRecord(null);
        setForm({ studentId: "", type: "behavior", title: "", details: "", date: new Date().toISOString().split("T")[0], action: "pending" });
        fetchRecords();
      } else { const err = await res.json(); toast.error(err.error || "Failed"); }
    } catch { toast.error("Failed to save record"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try { const res = await fetch(`/api/discipline?id=${id}`, { method: "DELETE" }); if (res.ok) { toast.success("Record deleted"); fetchRecords(); } } catch { toast.error("Failed to delete"); }
  };

  const filteredRecords = records.filter(r => {
    if (filter.type && r.type !== filter.type) return false;
    if (filter.status && r.action !== filter.status) return false;
    if (filter.search && !`${r.student.firstName} ${r.student.lastName}`.toLowerCase().includes(filter.search.toLowerCase()) && !r.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const kpis = [
    { label: "Total Incidents", value: stats.totalIncidents, icon: AlertTriangle, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Pending", value: stats.pending, icon: Clock, bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
    { label: "Types Tracked", value: stats.byType.length, icon: Shield, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Discipline Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Track and manage student discipline records</p>
          </div>
          <button onClick={() => { setShowModal(true); setEditingRecord(null); setForm({ studentId: "", type: "behavior", title: "", details: "", date: new Date().toISOString().split("T")[0], action: "pending" }); }} style={{ padding: "10px 22px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
            <Plus style={{ width: "16px", height: "16px" }} /> New Record
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {kpis.map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Filters */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative", minWidth: "200px" }}>
            <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
            <input type="text" placeholder="Search student or title..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} style={{ ...inputStyle, paddingLeft: "38px", padding: "11px 14px 11px 38px" }} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} style={{ ...inputStyle, width: "auto", minWidth: "140px", cursor: "pointer", colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">All Types</option>
            <option value="behavior">Behavior</option>
            <option value="academic">Academic</option>
            <option value="attendance">Attendance</option>
            <option value="safety">Safety</option>
          </select>
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} style={{ ...inputStyle, width: "auto", minWidth: "140px", cursor: "pointer", colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="warning">Warning</option>
            <option value="suspension">Suspension</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["STUDENT", "TYPE", "TITLE", "DATE", "ACTION", "ACTIONS"].map((h) => (
                  <th key={h} style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: h === "ACTIONS" ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: "16px 20px" }}><div style={{ height: "16px", width: "100%", borderRadius: "6px", background: "#f1f5f9" }} /></td></tr>
                ))
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Shield style={{ width: "28px", height: "28px", color: "#cbd5e1" }} />
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No discipline records found</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Records will appear here once created</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const ts = typeStyles[r.type] || { bg: "#f1f5f9", color: "#64748b" };
                  const as = actionStyles[r.action || "pending"] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{r.student.firstName} {r.student.lastName}</p>
                        {r.student.class && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{r.student.class.name}</p>}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: ts.bg, color: ts.color, textTransform: "capitalize" }}>{r.type}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>{r.title}</td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{new Date(r.date).toLocaleDateString()}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: as.bg, color: as.color, textTransform: "capitalize" }}>{r.action || "pending"}</span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                          <button onClick={() => { setEditingRecord(r); setForm({ studentId: r.studentId, type: r.type, title: r.title, details: r.details || "", date: new Date(r.date).toISOString().split("T")[0], action: r.action || "pending" }); setShowModal(true); }} style={{ padding: "6px 10px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                            <Edit3 style={{ width: "15px", height: "15px" }} />
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{ padding: "6px 10px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                            <Trash2 style={{ width: "15px", height: "15px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalGradient}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>{editingRecord ? "Edit Record" : "New Discipline Record"}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{editingRecord ? "Update incident details" : "Log a new discipline incident"}</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Student <span style={{ color: "#ef4444" }}>*</span></label>
                <select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="behavior">Behavior</option>
                    <option value="academic">Academic</option>
                    <option value="attendance">Attendance</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Action</label>
                  <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="pending">Pending</option>
                    <option value="warning">Warning</option>
                    <option value="suspension">Suspension</option>
                    <option value="expulsion">Expulsion</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief title" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={labelStyle}>Details</label>
                <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} rows={3} placeholder="Detailed description..." style={{ ...inputStyle, resize: "none", minHeight: "80px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={labelStyle}>Date <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} {editingRecord ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

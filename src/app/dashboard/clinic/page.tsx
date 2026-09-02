"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Thermometer,
  Stethoscope,
  Loader2,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface ClinicVisit {
  id: string;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  student: { firstName: string; lastName: string };
}

interface Medication {
  name: string;
  used: number;
  category: string;
}

interface ClinicStats {
  totalVisits: number;
  recentVisits: number;
  totalMedications: number;
  lowStockAlerts: number;
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "#0055ff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; };
const labelStyle: React.CSSProperties = { color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "8px 16px", borderRadius: "12px", backgroundColor: bg, color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "6px" });
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const modalCard: React.CSSProperties = { background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" };

const ROWS_PER_PAGE = 20;

export default function ClinicPage() {
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [stats, setStats] = useState<ClinicStats>({ totalVisits: 0, recentVisits: 0, totalMedications: 0, lowStockAlerts: 0 });
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ studentId: "", reason: "", diagnosis: "", treatment: "", medication: "" });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clinicRes, inventoryRes] = await Promise.all([
        fetch("/api/clinic"),
        fetch("/api/clinic/inventory"),
      ]);

      const clinicData = await clinicRes.json();
      setVisits(clinicData.visits || []);

      const inventoryData = await inventoryRes.json();
      const meds = inventoryData.medications || [];
      setMedications(meds);

      setStats({
        totalVisits: clinicData.stats?.totalVisits || 0,
        recentVisits: clinicData.stats?.recentVisits || 0,
        totalMedications: meds.length,
        lowStockAlerts: meds.filter((m: Medication) => m.used > 0).length,
      });
    } catch {
      toast.error("Failed to load clinic data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          reason: form.reason,
          diagnosis: form.diagnosis,
          treatment: form.treatment,
          medication: form.medication,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Visit recorded successfully");
      setShowModal(false);
      setForm({ studentId: "", reason: "", diagnosis: "", treatment: "", medication: "" });
      fetchData();
    } catch {
      toast.error("Failed to record visit");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVisits = visits.filter((v) => {
    const name = `${v.student.firstName} ${v.student.lastName}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      v.reason.toLowerCase().includes(search.toLowerCase()) ||
      v.diagnosis.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedVisits = filteredVisits.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const kpiColors = [
    "linear-gradient(135deg, #0055ff, #0033cc)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    "linear-gradient(135deg, #f59e0b, #d97706)",
  ];

  const statCards = [
    { label: "Total Visits", value: stats.totalVisits, icon: Users, bg: kpiColors[0] },
    { label: "Recent Visits", value: stats.recentVisits, icon: Clock, bg: kpiColors[1] },
    { label: "Medications", value: stats.totalMedications, icon: Pill, bg: kpiColors[2] },
    { label: "Alerts", value: stats.lowStockAlerts, icon: AlertTriangle, bg: kpiColors[3] },
  ];

  const handleExport = () => {
    const data = visits.map((v) => ({
      Student: `${v.student.firstName} ${v.student.lastName}`,
      Date: new Date(v.date).toLocaleDateString(),
      Reason: v.reason,
      Diagnosis: v.diagnosis,
      Treatment: v.treatment,
      Medication: v.medication,
    }));
    downloadCSV(data, "clinic_visits");
    toast.success("CSV downloaded");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#0055ff", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "16px", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Clinic / Medical Records</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Manage student visits, medications, allergies, and health records</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleExport} style={{ ...btnStyle("rgba(255,255,255,0.15)", false), backdropFilter: "blur(8px)" }}>
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            <button onClick={() => setShowModal(true)} style={{ ...btnStyle("#ffffff"), color: "#0a2a6e" }}>
              <Plus style={{ width: "16px", height: "16px" }} /> New Visit
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", margin: "24px 16px 0" }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#1a1a2e" }}>{stat.value}</p>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", margin: "24px 16px 0" }}>
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>Recent Visits</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px", fontSize: "12px", width: "200px" }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              <button title="Filter using search above" style={{ padding: "8px 12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer" }}>
                <Filter style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {paginatedVisits.map((visit) => (
              <div key={visit.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "#dcfce7", color: "#16a34a", flexShrink: 0 }}>
                  <Stethoscope style={{ width: "18px", height: "18px" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{visit.student.firstName} {visit.student.lastName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{visit.reason} · {visit.diagnosis}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: "#dcfce7", color: "#16a34a" }}>treated</span>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>{new Date(visit.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {paginatedVisits.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "#94a3b8", fontSize: "13px" }}>No visits found</div>
            )}
          </div>
          {filteredVisits.length > ROWS_PER_PAGE && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Showing {(safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filteredVisits.length)} of {filteredVisits.length}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} style={{ ...btnStyle(safePage <= 1 ? "#e2e8f0" : "#f8fafc"), color: safePage <= 1 ? "#cbd5e1" : "#475569", border: "1px solid #e2e8f0", padding: "6px 10px", opacity: 1 }}>
                  <ChevronLeft style={{ width: "14px", height: "14px" }} />
                </button>
                <span style={{ padding: "6px 12px", fontSize: "12px", color: "#475569", fontWeight: 500, display: "flex", alignItems: "center" }}>
                  {safePage} / {totalPages}
                </span>
                <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} style={{ ...btnStyle(safePage >= totalPages ? "#e2e8f0" : "#f8fafc"), color: safePage >= totalPages ? "#cbd5e1" : "#475569", border: "1px solid #e2e8f0", padding: "6px 10px", opacity: 1 }}>
                  <ChevronRight style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>Medications Stock</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {medications.length === 0 ? (
                <p style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "13px", margin: 0 }}>No medications recorded yet</p>
              ) : (
                medications.map((med, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: "12px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e" }}>{med.name}</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{med.category}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Used: {med.used} times
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>Health Alerts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {stats.lowStockAlerts === 0 && stats.totalVisits === 0 ? (
                <p style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "13px", margin: 0 }}>No alerts at this time</p>
              ) : (
                <>
                  {stats.lowStockAlerts > 0 && (
                    <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AlertTriangle style={{ width: "14px", height: "14px", color: "#f97316" }} />
                        <span style={{ fontSize: "13px", color: "#1a1a2e" }}>{stats.lowStockAlerts} medications have been used recently</span>
                      </div>
                    </div>
                  )}
                  {stats.recentVisits > 5 && (
                    <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AlertTriangle style={{ width: "14px", height: "14px", color: "#dc2626" }} />
                        <span style={{ fontSize: "13px", color: "#1a1a2e" }}>High clinic activity: {stats.recentVisits} visits this week</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px 20px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px 20px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>New Clinic Visit</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Record a student medical visit</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Student ID <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  placeholder="e.g. STU-001"
                />
              </div>
              <div>
                <label style={labelStyle}>Reason for Visit <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  placeholder="e.g. Headache"
                />
              </div>
              <div>
                <label style={labelStyle}>Diagnosis</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  placeholder="e.g. Malaria"
                />
              </div>
              <div>
                <label style={labelStyle}>Treatment</label>
                <input
                  type="text"
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  placeholder="e.g. Medication prescribed"
                />
              </div>
              <div>
                <label style={labelStyle}>Medication</label>
                <input
                  type="text"
                  value={form.medication}
                  onChange={(e) => setForm({ ...form, medication: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 1, ...btnStyle(submitting ? "#93c5fd" : "#0055ff", submitting), justifyContent: "center" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
                  Record Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

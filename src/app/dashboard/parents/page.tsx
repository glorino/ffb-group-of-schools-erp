"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  Eye,
  X,
  Loader2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  occupation: string | null;
  isPrimary: boolean;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class: { name: string; displayName: string } | null;
  };
}

export default function ParentsPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewGuardian, setViewGuardian] = useState<Guardian | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/guardians?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch guardians");
      setGuardians(data.guardians || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to load guardians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuardians(); }, [page, search]);

  const uniqueParents = guardians.reduce((acc, g) => {
    const key = g.email || g.id;
    if (!acc.find((p) => (p.email || p.id) === key)) acc.push(g);
    return acc;
  }, [] as Guardian[]);

  const primaryCount = guardians.filter(g => g.isPrimary).length;

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ marginTop: "32px", borderRadius: "20px", padding: "32px 36px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Parents & Guardians</h1>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>View all guardians and their linked students</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Guardians", value: total, icon: Users, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
          { label: "Unique Parents", value: uniqueParents.length, icon: GraduationCap, bg: "linear-gradient(135deg, #10b981, #059669)" },
          { label: "Primary Contacts", value: primaryCount, icon: Phone, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
        ].map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{stat.value}</p>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Table Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>All Guardians</h3>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
            <input type="text" placeholder="Search guardians..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ padding: "10px 14px 10px 38px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", width: "240px", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : guardians.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <Users style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>No guardians found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Guardian", "Relationship", "Student", "Class", "Contact"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                  ))}
                  <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guardians.map((g) => {
                  const initials = `${g.firstName?.[0] || ""}${g.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <tr key={g.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{g.firstName} {g.lastName}</p>
                            {g.isPrimary && (
                              <span style={{ display: "inline-block", marginTop: "2px", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, background: "#dcfce7", color: "#16a34a" }}>Primary</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a" }}>{g.relationship}</td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a" }}>{g.student.firstName} {g.student.lastName}</td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a" }}>{g.student.class?.displayName || g.student.class?.name || "—"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#64748b" }}>
                          {g.phone && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone style={{ width: "12px", height: "12px" }} /> {g.phone}</span>}
                          {g.email && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Mail style={{ width: "12px", height: "12px" }} /> {g.email}</span>}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <button onClick={() => setViewGuardian(g)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Eye style={{ width: "16px", height: "16px" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>Page {page} of {totalPages} &middot; {total} guardians</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#ffffff", color: "#94a3b8", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeft style={{ width: "16px", height: "16px" }} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: page === pageNum ? "1px solid #0055ff" : "1px solid #e2e8f0", background: page === pageNum ? "#0055ff" : "#ffffff", color: page === pageNum ? "#ffffff" : "#64748b", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: page === pageNum ? "0 2px 8px rgba(0,85,255,0.25)" : "none" }}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#ffffff", color: "#94a3b8", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}>
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guardian Detail Modal */}
      {viewGuardian && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setViewGuardian(null)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #0055ff, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "16px", fontWeight: 700 }}>
                  {viewGuardian.firstName[0]}{viewGuardian.lastName[0]}
                </div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Guardian Details</h3>
              </div>
              <button onClick={() => setViewGuardian(null)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Full Name", value: `${viewGuardian.firstName} ${viewGuardian.lastName}` },
                { label: "Relationship", value: viewGuardian.relationship },
                { label: "Phone", value: viewGuardian.phone, action: { label: "Call", href: `tel:${viewGuardian.phone}`, color: "#0055ff", bg: "#eff6ff" } },
                { label: "Email", value: viewGuardian.email || "—", action: viewGuardian.email ? { label: "Email", href: `mailto:${viewGuardian.email}`, color: "#16a34a", bg: "#f0fdf4" } : undefined },
                { label: "Occupation", value: viewGuardian.occupation || "—" },
                { label: "Linked Student", value: `${viewGuardian.student.firstName} ${viewGuardian.student.lastName}`, sub: `${viewGuardian.student.admissionNumber} · ${viewGuardian.student.class?.displayName || "—"}` },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", gridColumn: i === 5 ? "1 / -1" : undefined }}>
                  <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{item.value}</p>
                      {"sub" in item && item.sub && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{item.sub}</p>}
                    </div>
                    {"action" in item && item.action && (
                      <a href={item.action.href} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "20px", background: item.action.bg, color: item.action.color, fontSize: "11px", fontWeight: 500, textDecoration: "none" }}>
                        {item.action.label === "Call" ? <Phone style={{ width: "12px", height: "12px" }} /> : <Mail style={{ width: "12px", height: "12px" }} />}
                        {item.action.label}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewGuardian(null)} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

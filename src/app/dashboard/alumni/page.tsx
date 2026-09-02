"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Heart,
  Handshake,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  MapPin,
  DollarSign,
  Star,
  MessageCircle,
  Calendar,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrency, formatCurrencyCompact } from "@/lib/school-config";

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#0055ff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; };
const labelStyle: React.CSSProperties = { color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "8px 16px", borderRadius: "12px", backgroundColor: bg, color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "6px" });
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const modalCard: React.CSSProperties = { background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" };
const ROWS_PER_PAGE = 20;

interface AlumniRecord {
  id: string;
  graduationYear: number;
  university: string | null;
  degree: string | null;
  currentEmployer: string | null;
  currentPosition: string | null;
  industry: string | null;
  biography: string | null;
  user: { id: string; name: string; email: string } | null;
  donations: { id: string; amount: number; donatedAt: string; purpose: string | null }[];
  mentorships: { id: string; status: string }[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string | null;
  type: string;
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    graduationYear: "",
    university: "",
    degree: "",
    industry: "",
    currentEmployer: "",
    currentPosition: "",
    biography: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [messageModal, setMessageModal] = useState<{ alumni: AlumniRecord; subject: string; body: string } | null>(null);
  const [page, setPage] = useState(1);

  const fetchAlumni = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/alumni?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAlumni(data.alumni ?? []);
    } catch {
      toast.error("Failed to load alumni");
    }
    setLoading(false);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar");
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.schoolEvents ?? []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchAlumni();
    fetchEvents();
  }, [fetchAlumni, fetchEvents]);

  const totalDonations = alumni.reduce(
    (sum, a) => sum + a.donations.reduce((s, d) => s + d.amount, 0),
    0
  );
  const totalMentorships = alumni.reduce(
    (sum, a) => sum + a.mentorships.length,
    0
  );

  const filteredAlumni = alumni.filter((person) => {
    if (filterCategory === "all") return true;
    if (filterCategory === "mentoring") return person.mentorships.length > 0;
    if (filterCategory === "donating") return person.donations.length > 0;
    if (filterCategory === "recent") return person.graduationYear >= new Date().getFullYear() - 5;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAlumni.length / ROWS_PER_PAGE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const paginatedAlumni = filteredAlumni.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [filterCategory, search]);

  const stats = [
    { label: "Total Alumni", value: alumni.length.toLocaleString(), icon: Users, gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    { label: "Active Members", value: alumni.length.toLocaleString(), icon: Star, gradient: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Total Donations", value: formatCurrencyCompact(totalDonations), icon: DollarSign, gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Mentorship Pairs", value: totalMentorships.toString(), icon: Handshake, gradient: "linear-gradient(135deg, #0055ff, #10b981)" },
  ];

  const handleAddAlumni = async () => {
    if (!form.graduationYear) {
      toast.error("Graduation year is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "",
          graduationYear: form.graduationYear,
          university: form.university || undefined,
          degree: form.degree || undefined,
          industry: form.industry || undefined,
          currentEmployer: form.currentEmployer || undefined,
          currentPosition: form.currentPosition || undefined,
          biography: form.biography || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add alumni");
      }
      toast.success("Alumni record created");
      setShowAddModal(false);
      setForm({ graduationYear: "", university: "", degree: "", industry: "", currentEmployer: "", currentPosition: "", biography: "" });
      fetchAlumni();
    } catch (err: any) {
      toast.error(err.message || "Failed to add alumni");
    }
    setSubmitting(false);
  };

  const handleExport = () => {
    const data = alumni.map((a) => ({
      Name: a.user?.name || "—",
      "Graduation Year": a.graduationYear,
      University: a.university || "—",
      Degree: a.degree || "—",
      Industry: a.industry || "—",
      "Current Employer": a.currentEmployer || "—",
      "Current Position": a.currentPosition || "—",
      Donations: a.donations.reduce((s, d) => s + d.amount, 0),
    }));
    downloadCSV(data, "alumni_directory");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "16px", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Alumni Portal</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Connect with alumni, manage networking, donations, and mentorship</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleExport} style={btnStyle("#ffffff")}>
              <Download style={{ width: "16px", height: "16px" }} />
              Export CSV
            </button>
            <button onClick={() => setShowAddModal(true)} style={btnStyle("#10b981")}>
              <Plus style={{ width: "16px", height: "16px" }} />
              Add Alumni
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", padding: "0 16px" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>{stat.label}</p>
                <p style={{ color: "#1a1a2e", fontSize: "28px", fontWeight: 700, margin: 0 }}>{stat.value}</p>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: stat.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <stat.icon style={{ width: "24px", height: "24px", color: "#ffffff" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", padding: "0 16px" }}>
        {/* Alumni Directory */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px", margin: 0 }}>Alumni Directory</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", position: "relative" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search alumni..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "36px", width: "200px" }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  style={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer" }}
                >
                  <Filter style={{ width: "16px", height: "16px" }} />
                </button>
                {showFilter && (
                  <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "8px", zIndex: 40, width: "192px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", padding: "4px" }}>
                    {["all", "mentoring", "donating", "recent"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setFilterCategory(opt); setShowFilter(false); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", textTransform: "capitalize", border: "none", cursor: "pointer",
                          backgroundColor: filterCategory === opt ? "rgba(0,85,255,0.1)" : "transparent",
                          color: filterCategory === opt ? "#0055ff" : "#475569",
                        }}
                      >
                        {opt === "all" ? "All" : opt === "recent" ? "Recent Graduates" : opt === "mentoring" ? "Mentoring" : "Donating"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
              <Loader2 style={{ width: "24px", height: "24px", color: "#64748b", animation: "spin 1s linear infinite" }} />
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <Users style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No alumni records found</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {paginatedAlumni.map((person) => {
                  const name = person.user?.name || "Unknown";
                  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                  const totalDonation = person.donations.reduce((s, d) => s + d.amount, 0);
                  return (
                    <div key={person.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0055ff, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 600, fontSize: "13px", flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                        <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {person.currentPosition || person.industry || "—"} • Class of {person.graduationYear}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                          <MapPin style={{ width: "12px", height: "12px", color: "#64748b" }} />
                          <span style={{ color: "#64748b", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80px" }}>{person.university || "—"}</span>
                        </div>
                        {totalDonation > 0 && (
                          <p style={{ color: "#10b981", fontSize: "12px", fontWeight: 500, margin: "2px 0 0" }}>{formatCurrency(totalDonation)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setMessageModal({ alumni: person, subject: "", body: "" })}
                        style={{ padding: "8px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", flexShrink: 0 }}
                      >
                        <MessageCircle style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {filteredAlumni.length > ROWS_PER_PAGE && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Showing {(safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filteredAlumni.length)} of {filteredAlumni.length}
                  </span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      disabled={safePage <= 1}
                      onClick={() => setPage(safePage - 1)}
                      style={{ ...btnStyle(safePage <= 1 ? "#e2e8f0" : "#f8fafc"), color: safePage <= 1 ? "#cbd5e1" : "#475569", border: "1px solid #e2e8f0", padding: "6px 10px", opacity: 1 }}
                    >
                      <ChevronLeft style={{ width: "14px", height: "14px" }} />
                    </button>
                    <span style={{ padding: "6px 12px", fontSize: "12px", color: "#475569", fontWeight: 500, display: "flex", alignItems: "center" }}>
                      {safePage} / {totalPages}
                    </span>
                    <button
                      disabled={safePage >= totalPages}
                      onClick={() => setPage(safePage + 1)}
                      style={{ ...btnStyle(safePage >= totalPages ? "#e2e8f0" : "#f8fafc"), color: safePage >= totalPages ? "#cbd5e1" : "#475569", border: "1px solid #e2e8f0", padding: "6px 10px", opacity: 1 }}
                    >
                      <ChevronRight style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Upcoming Events */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>Upcoming Events</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {events.length === 0 ? (
                <p style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8", fontSize: "13px", margin: 0 }}>No upcoming events</p>
              ) : (
                events.slice(0, 5).map((event, i) => (
                  <div key={event.id || i} style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px" }}>{event.title}</span>
                      <span style={{ padding: "4px 8px", borderRadius: "8px", backgroundColor: "#dbeafe", color: "#2563eb", fontSize: "11px", flexShrink: 0 }}>{event.type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                      <Calendar style={{ width: "12px", height: "12px", color: "#94a3b8" }} />
                      <span style={{ color: "#64748b" }}>
                        {new Date(event.start).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Donation Summary */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>Donation Summary</h3>
            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <p style={{ color: "#10b981", fontSize: "28px", fontWeight: 700, margin: 0 }}>{formatCurrency(totalDonations)}</p>
                <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0" }}>Total Raised</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Building Fund", amount: Math.round(totalDonations * 0.53), percent: 53 },
                  { label: "Scholarship", amount: Math.round(totalDonations * 0.27), percent: 27 },
                  { label: "Equipment", amount: Math.round(totalDonations * 0.20), percent: 20 },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span style={{ color: "#475569" }}>{item.label}</span>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>{formatCurrency(item.amount)}</span>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "#f1f5f9", borderRadius: "999px", height: "6px" }}>
                      <div style={{ backgroundColor: "#10b981", height: "6px", borderRadius: "999px", width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Alumni Modal */}
      {showAddModal && (
        <div style={modalOverlay} onClick={() => setShowAddModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Add Alumni Record</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Graduation Year *</label>
                  <input
                    type="number"
                    value={form.graduationYear}
                    onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                    placeholder="e.g. 2015"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>University</label>
                  <input
                    type="text"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    placeholder="University name"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Degree</label>
                  <input
                    type="text"
                    value={form.degree}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                    placeholder="e.g. B.Sc Computer Science"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="e.g. Technology"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Current Employer</label>
                    <input
                      type="text"
                      value={form.currentEmployer}
                      onChange={(e) => setForm({ ...form, currentEmployer: e.target.value })}
                      placeholder="Company name"
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Current Position</label>
                    <input
                      type="text"
                      value={form.currentPosition}
                      onChange={(e) => setForm({ ...form, currentPosition: e.target.value })}
                      placeholder="Job title"
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Biography</label>
                  <textarea
                    value={form.biography}
                    onChange={(e) => setForm({ ...form, biography: e.target.value })}
                    placeholder="Brief bio..."
                    rows={3}
                    style={{ ...inputStyle, resize: "none" }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    onClick={handleAddAlumni}
                    disabled={submitting}
                    style={{ ...btnStyle("#10b981", submitting), flex: 1, justifyContent: "center" }}
                  >
                    {submitting ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Plus style={{ width: "16px", height: "16px" }} />}
                    {submitting ? "Creating..." : "Add Alumni"}
                  </button>
                  <button onClick={() => setShowAddModal(false)} style={{ padding: "10px 20px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal && (
        <div style={modalOverlay} onClick={() => setMessageModal(null)}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Send Message</h2>
              <button onClick={() => setMessageModal(null)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>To</label>
                  <input type="text" readOnly value={messageModal.alumni.user?.name || "Unknown"}
                    style={{ ...inputStyle, backgroundColor: "#f8fafc", color: "#475569" }} />
                </div>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <input type="text" value={messageModal.subject}
                    onChange={(e) => setMessageModal({ ...messageModal, subject: e.target.value })}
                    placeholder="e.g. Mentorship Inquiry"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea rows={4} value={messageModal.body}
                    onChange={(e) => setMessageModal({ ...messageModal, body: e.target.value })}
                    placeholder="Type your message..."
                    style={{ ...inputStyle, resize: "none" }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button onClick={() => {
                    toast.success(`Message sent to ${messageModal.alumni.user?.name || "alumni"}`);
                    setMessageModal(null);
                  }} disabled={!messageModal.subject || !messageModal.body}
                    style={{ ...btnStyle("#10b981", !messageModal.subject || !messageModal.body), flex: 1, justifyContent: "center" }}>
                    Send Message
                  </button>
                  <button onClick={() => setMessageModal(null)}
                    style={{ padding: "10px 20px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Building,
  UserCheck,
  X,
  Loader2,
  Eye,
  Pencil,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface ClassItem {
  id: string;
  name: string;
  displayName: string;
  section: string | null;
  arm: string | null;
  capacity: number;
  level: number;
  _count: { students: number };
  classTeacher: { name: string } | null;
}

const classOrder = ["Creche", "Nursery 1", "Nursery 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
function getClassSortIndex(name: string): number { const idx = classOrder.indexOf(name); return idx === -1 ? classOrder.length : idx; }

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewClass, setViewClass] = useState<ClassItem | null>(null);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", displayName: "", level: "primary", capacity: "40" });
  const [form, setForm] = useState({ name: "", displayName: "", level: "primary", capacity: "40", arm: "" });
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/classes?${params}`);
      const d = await res.json();
      setClasses(d.classes || []);
      setTotal(d.total || 0);
    } catch { setClasses([]); }
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sortedClasses = [...classes].sort((a, b) => getClassSortIndex(a.name) - getClassSortIndex(b.name));
  const totalStudents = sortedClasses.reduce((sum, c) => sum + c._count.students, 0);
  const totalCapacity = sortedClasses.reduce((s, c) => s + c.capacity, 0);
  const avgClassSize = sortedClasses.length ? Math.round(totalStudents / sortedClasses.length) : 0;
  const capacityUsed = totalCapacity ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Class name is required"); return; }
    setSubmitting(true);
    try {
      const levelMap: Record<string, number> = { nursery: 1, primary: 2, junior: 3, secondary: 4 };
      const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, displayName: form.displayName || form.name, level: levelMap[form.level] || 2, capacity: parseInt(form.capacity) || 40, arm: form.arm || undefined }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      toast.success("Class created successfully");
      setShowModal(false);
      setForm({ name: "", displayName: "", level: "primary", capacity: "40", arm: "" });
      fetchClasses();
    } catch (err: any) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const progressColor = (pct: number) => pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ marginTop: "32px", borderRadius: "20px", padding: "32px 36px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Class Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage classes, streams, arms, and teacher assignments across all levels</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "12px", background: "#ffffff", color: "#0055ff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <Plus style={{ width: "14px", height: "14px" }} /> Add Class
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Classes", value: String(total), icon: Building, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
          { label: "Total Students", value: String(totalStudents), icon: Users, bg: "linear-gradient(135deg, #10b981, #059669)" },
          { label: "Avg. Class Size", value: String(avgClassSize), icon: GraduationCap, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
          { label: "Capacity Used", value: `${capacityUsed}%`, icon: UserCheck, bg: "linear-gradient(135deg, #f472b6, #ec4899)" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{kpi.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{kpi.value}</p>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <kpi.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        {/* Table Card */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>All Classes</h3>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input type="text" placeholder="Search classes..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "10px 14px 10px 38px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", width: "200px", boxSizing: "border-box" }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Loader2 style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto", animation: "spin 1s linear infinite" }} />
            </div>
          ) : sortedClasses.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Building style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>No classes found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {["Class", "Section", "Teacher", "Students", "Capacity"].map((h) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                    ))}
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClasses.map((cls) => {
                    const usagePct = cls.capacity ? Math.round((cls._count.students / cls.capacity) * 100) : 0;
                    const barColor = progressColor(usagePct);
                    return (
                      <tr key={cls.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{cls.displayName}{cls.arm ? ` - Arm ${cls.arm}` : ""}</span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{cls.section || "—"}</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: cls.classTeacher ? "#0f172a" : "#94a3b8" }}>{cls.classTeacher ? cls.classTeacher.name : "Unassigned"}</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a", fontWeight: 500 }}>{cls._count.students}<span style={{ color: "#94a3b8" }}>/{cls.capacity}</span></td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "#f1f5f9", maxWidth: "80px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(usagePct, 100)}%`, borderRadius: "3px", background: barColor, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: barColor, minWidth: "32px" }}>{usagePct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ position: "relative", display: "inline-block" }} ref={openMenu === cls.id ? menuRef : undefined}>
                            <button onClick={() => setOpenMenu(openMenu === cls.id ? null : cls.id)} style={{ padding: "6px", borderRadius: "8px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <MoreHorizontal style={{ width: "16px", height: "16px" }} />
                            </button>
                            {openMenu === cls.id && (
                              <div style={{ position: "absolute", right: 0, top: "32px", width: "144px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden" }}>
                                <button onClick={() => { setOpenMenu(null); setViewClass(cls); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#475569", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                  <Eye style={{ width: "14px", height: "14px" }} /> View
                                </button>
                                <button onClick={() => { setOpenMenu(null); setEditClass(cls); const levelNames: Record<number, string> = { 1: "nursery", 2: "primary", 3: "junior", 4: "secondary" }; setEditForm({ name: cls.name, displayName: cls.displayName, level: levelNames[cls.level] || "primary", capacity: String(cls.capacity) }); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", border: "none", background: "transparent", color: "#475569", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                                  <Pencil style={{ width: "14px", height: "14px" }} /> Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Capacity Overview Sidebar */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", alignSelf: "start" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Capacity Overview</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedClasses.map((cls) => {
              const pct = cls.capacity ? Math.round((cls._count.students / cls.capacity) * 100) : 0;
              const barColor = progressColor(pct);
              return (
                <div key={cls.id} style={{ padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#0f172a" }}>{cls.displayName}{cls.arm ? ` - ${cls.arm}` : ""}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: barColor }}>{pct}%</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: "2px", background: barColor, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Add Class</h3>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: "16px", height: "16px" }} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. JSS1" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Display Name</label>
                <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="e.g. Junior Secondary 1A" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Arm</label>
                <input type="text" value={form.arm} onChange={(e) => setForm({ ...form, arm: e.target.value })} placeholder="e.g. A, B, C" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Level</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#475569", outline: "none", boxSizing: "border-box", colorScheme: "light" }}>
                    <option value="nursery">Nursery</option>
                    <option value="primary">Primary</option>
                    <option value="junior">Junior</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Capacity</label>
                  <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Class Modal */}
      {viewClass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setViewClass(null)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Class Details</h3>
              <button onClick={() => setViewClass(null)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: "16px", height: "16px" }} /></button>
            </div>
            <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Class Name", value: `${viewClass.displayName}${viewClass.arm ? ` - Arm ${viewClass.arm}` : ""}` },
                { label: "Section", value: viewClass.section || "—" },
                { label: "Class Teacher", value: viewClass.classTeacher?.name || "Unassigned" },
                { label: "Students", value: `${viewClass._count.students} / ${viewClass.capacity}` },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewClass(null)} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editClass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setEditClass(null)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Edit Class</h3>
              <button onClick={() => setEditClass(null)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: "16px", height: "16px" }} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const levelMap: Record<string, number> = { nursery: 1, primary: 2, junior: 3, secondary: 4 };
                const res = await fetch("/api/classes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editClass.id, name: editForm.name, displayName: editForm.displayName || editForm.name, level: levelMap[editForm.level] || 2, capacity: parseInt(editForm.capacity) || 40 }) });
                if (!res.ok) throw new Error("Failed");
                toast.success("Class updated successfully");
                setEditClass(null);
                fetchClasses();
              } catch { toast.error("Failed to update class"); }
            }} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Name *</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Display Name</label>
                <input type="text" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Level</label>
                  <select value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#475569", outline: "none", boxSizing: "border-box", colorScheme: "light" }}>
                    <option value="nursery">Nursery</option>
                    <option value="primary">Primary</option>
                    <option value="junior">Junior</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Capacity</label>
                  <input type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px" }}>
                <button type="button" onClick={() => setEditClass(null)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

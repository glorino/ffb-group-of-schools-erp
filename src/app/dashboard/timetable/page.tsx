"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Plus,
  Trash2,
  GripVertical,
  Users,
  BookOpen,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

interface TimetableEntry {
  id: string;
  classId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: string | null;
  type: string;
  class: { id: string; name: string; displayName: string | null };
  teacher: { id: string; firstName: string; lastName: string };
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const modalCard: React.CSSProperties = { background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" };
const modalGradient: React.CSSProperties = { padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" };

function ReadOnlyTimetable({ entries, loading }: { entries: TimetableEntry[]; loading: boolean }) {
  const getEntry = (day: number, time: string) => entries.find(e => e.dayOfWeek === day && e.startTime === time);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 style={{ width: "24px", height: "24px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", width: "90px" }}>Time</th>
              {dayLabels.map((day) => (
                <th key={day} style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 700, color: "#475569", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.03em" }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", whiteSpace: "nowrap" }}>{time}</td>
                {dayLabels.map((_, di) => {
                  const entry = getEntry(di + 1, time);
                  return (
                    <td key={di} style={{ padding: "6px" }}>
                      <div style={{ minHeight: "56px", borderRadius: "10px", padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: entry ? "#f8fafc" : "#fafbfc", border: entry ? "1px solid #e2e8f0" : "1px solid transparent" }}>
                        {entry ? (
                          <div>
                            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#10b981", lineHeight: 1.3 }}>{entry.subject || "Lesson"}</p>
                            <p style={{ margin: "3px 0 0", fontSize: "9px", color: "#94a3b8" }}>{entry.teacher.firstName} {entry.teacher.lastName[0]}.</p>
                            {entry.room && <p style={{ margin: "2px 0 0", fontSize: "8px", color: "#cbd5e1" }}>{entry.room}</p>}
                          </div>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#e2e8f0" }}>&mdash;</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTimetable({ entries, setEntries, classes, teachers, selectedClass, setSelectedClass }: {
  entries: TimetableEntry[];
  setEntries: (e: TimetableEntry[]) => void;
  classes: { id: string; name: string; displayName: string | null }[];
  teachers: { id: string; firstName: string; lastName: string; employeeId: string }[];
  selectedClass: string;
  setSelectedClass: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailSlot, setDetailSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ dayOfWeek: "1", startTime: "8:00 AM", endTime: "9:00 AM", teacherId: "", room: "", subject: "", type: "lesson" });

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    fetch(`/api/timetable?classId=${selectedClass}`)
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => { setEntries([]); toast.error("Failed to load timetable"); })
      .finally(() => setLoading(false));
  }, [selectedClass, setEntries]);

  const getEntry = (day: number, time: string) => entries.find(e => e.dayOfWeek === day && e.startTime === time);

  const stats = [
    { label: "Total Slots", value: entries.length, icon: BookOpen, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Teachers Assigned", value: new Set(entries.map(e => e.teacherId)).size, icon: Users, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Rooms Used", value: new Set(entries.filter(e => e.room).map(e => e.room)).size, icon: Calendar, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Days Covered", value: new Set(entries.map(e => e.dayOfWeek)).size, icon: AlertCircle, bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
  ];

  const handleCreate = async () => {
    if (!form.teacherId) { toast.error("Please select a teacher"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/timetable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId: selectedClass, ...form, dayOfWeek: parseInt(form.dayOfWeek) }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Timetable slot created");
      setShowModal(false);
      const d = await fetch(`/api/timetable?classId=${selectedClass}`).then(r => r.json());
      setEntries(d.entries || []);
    } catch { toast.error("Failed to create slot"); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/timetable?id=${id}`, { method: "DELETE" });
      setEntries(entries.filter(e => e.id !== id));
      toast.success("Slot deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const typeColors: Record<string, { bg: string; color: string }> = {
    lesson: { bg: "#eff6ff", color: "#2563eb" },
    break: { bg: "#fef3c7", color: "#d97706" },
    lab: { bg: "#f3e8ff", color: "#7c3aed" },
    assembly: { bg: "#f1f5f9", color: "#64748b" },
  };

  return (
    <>
      {/* Controls Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "200px", cursor: "pointer", colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
          {classes.map(c => <option key={c.id} value={c.id}>{c.displayName || c.name}</option>)}
        </select>
        <button onClick={() => setShowModal(true)} disabled={!selectedClass} style={{ padding: "10px 22px", borderRadius: "12px", border: "none", background: !selectedClass ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: !selectedClass ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: !selectedClass ? "none" : "0 4px 14px rgba(0,85,255,0.3)", transition: "all 0.15s" }}>
          <Plus style={{ width: "16px", height: "16px" }} /> Add Slot
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {stats.map((stat, i) => (
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

      {/* Weekly Timetable Label */}
      <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Weekly Timetable</p>

      {/* Timetable Grid */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: "24px", height: "24px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", width: "90px" }}>Time</th>
                  {dayLabels.map((day) => (
                    <th key={day} style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 700, color: "#475569", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.03em" }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", whiteSpace: "nowrap" }}>{time}</td>
                    {dayLabels.map((_, di) => {
                      const entry = getEntry(di + 1, time);
                      return (
                        <td key={di} style={{ padding: "6px" }}>
                          <div
                            onClick={() => entry && setDetailSlot(entry)}
                            style={{ minHeight: "60px", borderRadius: "10px", padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", transition: "all 0.15s", background: entry ? "#f8fafc" : "#fafbfc", border: entry ? "1px solid #e2e8f0" : "1px dashed #e2e8f0", position: "relative" }}
                            onMouseEnter={(e) => { if (entry) e.currentTarget.style.background = "#f1f5f9"; }}
                            onMouseLeave={(e) => { if (entry) e.currentTarget.style.background = "#f8fafc"; }}
                          >
                            {entry ? (
                              <>
                                <div>
                                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{entry.teacher.firstName} {entry.teacher.lastName}</p>
                                  {entry.room && <p style={{ margin: "3px 0 0", fontSize: "9px", color: "#94a3b8" }}>{entry.room}</p>}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                  style={{ position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "6px", border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                >
                                  <Trash2 style={{ width: "11px", height: "11px" }} />
                                </button>
                              </>
                            ) : (
                              <GripVertical style={{ width: "16px", height: "16px", color: "#e2e8f0" }} />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalGradient}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Add Timetable Slot</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Schedule a class for this week</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Day of Week</label>
                <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  {dayLabels.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Start Time</label>
                  <select value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>End Time</label>
                  <select value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Teacher <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Room</label>
                  <input type="text" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 101" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="lesson">Lesson</option>
                    <option value="break">Break</option>
                    <option value="lab">Lab</option>
                    <option value="assembly">Assembly</option>
                  </select>
                </div>
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreate} disabled={submitting || !form.teacherId} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting || !form.teacherId ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting || !form.teacherId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: submitting || !form.teacherId ? "none" : "0 4px 14px rgba(0,85,255,0.3)" }}>
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailSlot && (
        <div style={modalOverlay} onClick={() => setDetailSlot(null)}>
          <div style={{ ...modalCard, maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalGradient}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Timetable Slot</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Class session details</p>
                </div>
                <button onClick={() => setDetailSlot(null)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Day", value: dayLabels[detailSlot.dayOfWeek - 1] },
                { label: "Time", value: `${detailSlot.startTime} — ${detailSlot.endTime}` },
                { label: "Subject", value: detailSlot.subject || "—" },
                { label: "Teacher", value: `${detailSlot.teacher.firstName} ${detailSlot.teacher.lastName}` },
                { label: "Class", value: detailSlot.class.displayName || detailSlot.class.name },
                { label: "Room", value: detailSlot.room || "—" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}>Type</span>
                <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: typeColors[detailSlot.type]?.bg || "#f1f5f9", color: typeColors[detailSlot.type]?.color || "#64748b" }}>{detailSlot.type}</span>
              </div>
              <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => { setDetailSlot(null); handleDelete(detailSlot.id); }} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}>
                  Delete Slot
                </button>
                <button onClick={() => setDetailSlot(null)} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,85,255,0.3)" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TimetablePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string; displayName: string | null }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; firstName: string; lastName: string; employeeId: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReadOnly) {
      fetch("/api/children?email=" + encodeURIComponent((session?.user as any)?.email || ""))
        .then(r => r.json())
        .then(d => {
          const child = d.children?.[0];
          if (child?.classId) { setSelectedClass(child.classId); } else { setLoading(false); }
        })
        .catch(() => { setLoading(false); });
    } else {
      Promise.all([
        fetch("/api/classes").then(r => r.json()),
        fetch("/api/teachers?limit=100").then(r => r.json()),
      ]).then(([classData, teacherData]) => {
        setClasses(classData.classes || classData || []);
        setTeachers(teacherData.teachers || []);
        if (classData.classes?.length && !selectedClass) setSelectedClass(classData.classes[0].id);
      }).catch(() => {});
    }
  }, [isReadOnly, session]);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    fetch(`/api/timetable?classId=${selectedClass}`)
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => { setEntries([]); toast.error("Failed to load timetable"); })
      .finally(() => setLoading(false));
  }, [selectedClass]);

  const className = classes.find(c => c.id === selectedClass);

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>
              {isReadOnly ? "My Timetable" : "Timetable Management"}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
              {isReadOnly ? `${className?.displayName || className?.name || "Your class"} schedule` : "Schedule classes, assign teachers, and manage rooms"}
            </p>
          </div>
          {isReadOnly && (
            <div style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{className?.displayName || className?.name || "—"}</span>
            </div>
          )}
        </div>
      </div>

      {isReadOnly ? (
        <ReadOnlyTimetable entries={entries} loading={loading} />
      ) : (
        <AdminTimetable entries={entries} setEntries={setEntries} classes={classes} teachers={teachers} selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      )}
    </div>
  );
}

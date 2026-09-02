"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Users,
  Clock,
  Loader2,
  MapPin,
  GraduationCap,
  BarChart3,
  Edit3,
  Save,
  X,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface TeacherDetail {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  employeeId: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  qualification: string | null;
  specialization: string | null;
  status: string;
  createdAt: string;
  teacherSubjects: { subject: { id: string; name: string } }[];
  user: { id: string; email: string; image: string | null; lastLoginAt: string | null } | null;
}

interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string | null;
  room: string | null;
  class: { name: string; displayName: string };
}

interface TeacherStats {
  timetableEntries: number;
  assignedClasses: number;
  attendanceMarked: number;
}

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<{ id: string; name: string; displayName: string }[]>([]);
  const [stats, setStats] = useState<TeacherStats>({ timetableEntries: 0, assignedClasses: 0, attendanceMarked: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "timetable" | "subjects">("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  useEffect(() => { fetchTeacher(); }, [params.id]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch teacher");
      const data = await res.json();
      setTeacher(data.teacher);
      setTimetable(data.timetable || []);
      setAssignedClasses(data.assignedClasses || []);
      setStats(data.stats || { timetableEntries: 0, assignedClasses: 0, attendanceMarked: 0 });
    } catch { toast.error("Failed to load teacher details"); router.push("/dashboard/teachers"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/teachers/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Teacher updated successfully");
      setEditing(false);
      fetchTeacher();
    } catch { toast.error("Failed to update teacher"); }
  };

  const startEdit = () => {
    if (!teacher) return;
    setEditForm({ firstName: teacher.firstName, lastName: teacher.lastName, phone: teacher.phone || "", email: teacher.email || "", qualification: teacher.qualification || "", specialization: teacher.specialization || "" });
    setEditing(true);
  };

  if (loading) return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ height: "160px", borderRadius: "20px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
      <div style={{ height: "48px", borderRadius: "16px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
      <div style={{ height: "400px", borderRadius: "20px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
    </div>
  );

  if (!teacher) return null;

  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;
  const dayNames = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const groupedTimetable = dayNames.map((name, idx) => ({ day: name, entries: timetable.filter((t) => t.dayOfWeek === idx + 1) }));

  const statusColor = teacher.status === "active" ? { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" } : { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" };

  const infoRow = (label: string, value: string, icon: any) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
      {(() => { const I = icon; return <I style={{ width: "16px", height: "16px", color: "#94a3b8", marginTop: "2px", flexShrink: 0 }} />; })()}
      <div>
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back */}
      <button onClick={() => router.push("/dashboard/teachers")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", border: "none", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", marginTop: "16px" }}>
        <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Teachers
      </button>

      {/* Profile Header */}
      <div style={{ borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#ffffff" }}>
        <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", padding: "32px 28px 0" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 50%, rgba(16,185,129,0.15) 0%, transparent 60%)" }} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", position: "relative", zIndex: 1, paddingBottom: "20px", flexWrap: "wrap" }}>
            <div style={{ width: "88px", height: "88px", borderRadius: "20px", background: "linear-gradient(135deg, #ffffff, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0055ff", fontSize: "28px", fontWeight: 800, border: "4px solid #ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>{teacher.firstName} {teacher.middleName ? teacher.middleName + " " : ""}{teacher.lastName}</h1>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, background: `${statusColor.color}20`, color: statusColor.color, border: `1px solid ${statusColor.color}30` }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor.color }} /> {teacher.status}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{teacher.employeeId}</p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                {teacher.email && <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Mail style={{ width: "14px", height: "14px" }} /> {teacher.email}</span>}
                {teacher.phone && <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Phone style={{ width: "14px", height: "14px" }} /> {teacher.phone}</span>}
                {teacher.qualification && <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><GraduationCap style={{ width: "14px", height: "14px" }} /> {teacher.qualification}</span>}
              </div>
            </div>
            <div style={{ paddingBottom: "4px" }}>
              {editing ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleSave} style={{ padding: "10px 20px", borderRadius: "12px", background: "#ffffff", color: "#0055ff", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}><Save style={{ width: "14px", height: "14px" }} /> Save</button>
                  <button onClick={() => setEditing(false)} style={{ padding: "10px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><X style={{ width: "14px", height: "14px" }} /> Cancel</button>
                </div>
              ) : (
                <button onClick={startEdit} style={{ padding: "10px 20px", borderRadius: "12px", background: "#ffffff", color: "#0055ff", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}><Edit3 style={{ width: "14px", height: "14px" }} /> Edit Profile</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { label: "Timetable Slots", value: stats.timetableEntries, icon: Clock, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
          { label: "Assigned Classes", value: stats.assignedClasses, icon: Users, bg: "linear-gradient(135deg, #10b981, #059669)" },
          { label: "Attendance Marked", value: stats.attendanceMarked, icon: BarChart3, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{s.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{s.value}</p>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon style={{ width: "20px", height: "20px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "6px", width: "fit-content" }}>
        {[
          { id: "overview" as const, label: "Overview", icon: User },
          { id: "timetable" as const, label: "Timetable", icon: Clock },
          { id: "subjects" as const, label: "Subjects", icon: BookOpen },
        ].map((t) => {
          const active = tab === t.id;
          return <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", background: active ? "#0055ff" : "transparent", color: active ? "#ffffff" : "#94a3b8", transition: "all 0.15s" }}>
            <t.icon style={{ width: "16px", height: "16px" }} /> {t.label}
          </button>;
        })}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Personal Info */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Personal Information</h3>
            {editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[
                  { key: "firstName", label: "First Name" },
                  { key: "lastName", label: "Last Name" },
                  { key: "phone", label: "Phone" },
                  { key: "email", label: "Email" },
                  { key: "qualification", label: "Qualification" },
                  { key: "specialization", label: "Specialization" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>{f.label}</label>
                    <input type="text" value={editForm[f.key] || ""} onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {infoRow("Full Name", `${teacher.firstName} ${teacher.middleName ? teacher.middleName + " " : ""}${teacher.lastName}`, User)}
                {infoRow("Employee ID", teacher.employeeId, Award)}
                {infoRow("Gender", teacher.gender || "—", Users)}
                {infoRow("Date of Birth", teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—", Calendar)}
                {infoRow("Phone", teacher.phone || "—", Phone)}
                {infoRow("Email", teacher.email || "—", Mail)}
                {infoRow("Qualification", teacher.qualification || "—", GraduationCap)}
                {infoRow("Specialization", teacher.specialization || "—", BookOpen)}
                {infoRow("Status", teacher.status, teacher.status === "active" ? BarChart3 : X)}
                {infoRow("Joined", new Date(teacher.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }), Calendar)}
              </div>
            )}
          </div>

          {/* Account Details */}
          {teacher.user && (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Account Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {infoRow("Account Email", teacher.user.email, Mail)}
                {infoRow("Last Login", teacher.user.lastLoginAt ? new Date(teacher.user.lastLoginAt).toLocaleString("en-NG") : "Never", Clock)}
              </div>
            </div>
          )}

          {/* Profile Photo */}
          {teacher.user?.image && (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Profile Photo</h3>
              <img src={teacher.user.image} alt={teacher.firstName} style={{ width: "96px", height: "96px", borderRadius: "16px", objectFit: "cover" }} />
            </div>
          )}
        </div>
      )}

      {/* TIMETABLE TAB */}
      {tab === "timetable" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {groupedTimetable.map(({ day, entries }) => (
            <div key={day} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>{day.toLowerCase()}</h4>
              </div>
              {entries.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No classes scheduled</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {entries.map((e) => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 24px", borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }} onMouseEnter={(ev) => (ev.currentTarget.style.background = "#f8fafc")} onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}>
                      <div style={{ minWidth: "60px", textAlign: "center", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{e.startTime}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{e.endTime}</p>
                      </div>
                      <div style={{ width: "1px", height: "32px", background: "#e2e8f0" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{e.subject || "General"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{e.class.displayName || e.class.name}{e.room ? ` • ${e.room}` : ""}</p>
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, background: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" }}>Lesson</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {timetable.length === 0 && (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "64px", textAlign: "center" }}>
              <Clock style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>No timetable entries found</p>
            </div>
          )}
        </div>
      )}

      {/* SUBJECTS TAB */}
      {tab === "subjects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Assigned Subjects */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Assigned Subjects</h3>
            {teacher.teacherSubjects.length === 0 ? (
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No subjects assigned</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {teacher.teacherSubjects.map((ts) => (
                  <div key={ts.subject.id} style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,85,255,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <BookOpen style={{ width: "18px", height: "18px", color: "#2563eb" }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{ts.subject.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>Assigned Subject</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Classes */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Assigned Classes</h3>
            {assignedClasses.length === 0 ? (
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No classes assigned</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {assignedClasses.map((c) => (
                  <div key={c.id} style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(16,185,129,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin style={{ width: "18px", height: "18px", color: "#059669" }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{c.displayName || c.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>Class</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

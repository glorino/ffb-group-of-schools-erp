"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Edit,
  Save,
  X,
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
  day: string;
  period: number;
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

  useEffect(() => {
    fetchTeacher();
  }, [params.id]);

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
    } catch {
      toast.error("Failed to load teacher details");
      router.push("/dashboard/teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/teachers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Teacher updated successfully");
      setEditing(false);
      fetchTeacher();
    } catch {
      toast.error("Failed to update teacher");
    }
  };

  const startEdit = () => {
    if (!teacher) return;
    setEditForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone || "",
      email: teacher.email || "",
      qualification: teacher.qualification || "",
      specialization: teacher.specialization || "",
    });
    setEditing(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!teacher) return null;

  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;

  const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const groupedTimetable = dayOrder.map((day) => ({
    day,
    entries: timetable.filter((t) => t.day === day),
  }));

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Users },
    { id: "timetable" as const, label: "Timetable", icon: Clock },
    { id: "subjects" as const, label: "Subjects", icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push("/dashboard/teachers")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teachers
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {teacher.firstName} {teacher.middleName ? teacher.middleName + " " : ""}{teacher.lastName}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${teacher.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {teacher.status}
              </span>
            </div>
            <p className="text-white/50 text-sm mt-1">{teacher.employeeId}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/40">
              {teacher.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{teacher.email}</span>}
              {teacher.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{teacher.phone}</span>}
              {teacher.qualification && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{teacher.qualification}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-sm font-semibold hover:brightness-110 transition-all">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white/60 text-sm hover:bg-white/[0.1] transition-all">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            ) : (
              <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.1] transition-all">
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Timetable Slots", value: stats.timetableEntries, icon: Clock, color: "from-blue-500 to-blue-600" },
          { label: "Assigned Classes", value: stats.assignedClasses, icon: Users, color: "from-emerald-500 to-emerald-600" },
          { label: "Attendance Marked", value: stats.attendanceMarked, icon: BarChart3, color: "from-purple-500 to-purple-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[12px] mb-1">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-[var(--primary)] text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Personal Information</h3>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "firstName", label: "First Name" },
                  { key: "lastName", label: "Last Name" },
                  { key: "phone", label: "Phone" },
                  { key: "email", label: "Email" },
                  { key: "qualification", label: "Qualification" },
                  { key: "specialization", label: "Specialization" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-white/50 text-[12px] mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={editForm[f.key] || ""}
                      onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: `${teacher.firstName} ${teacher.middleName ? teacher.middleName + " " : ""}${teacher.lastName}` },
                  { label: "Employee ID", value: teacher.employeeId },
                  { label: "Gender", value: teacher.gender || "—" },
                  { label: "Date of Birth", value: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : "—" },
                  { label: "Phone", value: teacher.phone || "—" },
                  { label: "Email", value: teacher.email || "—" },
                  { label: "Qualification", value: teacher.qualification || "—" },
                  { label: "Specialization", value: teacher.specialization || "—" },
                  { label: "Status", value: teacher.status },
                  { label: "Joined", value: new Date(teacher.createdAt).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-white/40 text-[12px] mb-1">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {teacher.user && (
            <div className="card">
              <h3 className="text-white font-semibold text-lg mb-4">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-white/40 text-[12px] mb-1">Account Email</span>
                  <span className="text-white text-sm font-medium">{teacher.user.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/40 text-[12px] mb-1">Last Login</span>
                  <span className="text-white text-sm font-medium">
                    {teacher.user.lastLoginAt ? new Date(teacher.user.lastLoginAt).toLocaleString() : "Never"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {teacher.user?.image && (
            <div className="card">
              <h3 className="text-white font-semibold text-lg mb-4">Profile Photo</h3>
              <img src={teacher.user.image} alt={teacher.firstName} className="w-24 h-24 rounded-xl object-cover" />
            </div>
          )}
        </motion.div>
      )}

      {tab === "timetable" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {groupedTimetable.map(({ day, entries }) => (
            <div key={day} className="card">
              <h4 className="text-white font-semibold text-sm mb-3 capitalize">{day.toLowerCase()}</h4>
              {entries.length === 0 ? (
                <p className="text-white/30 text-[13px]">No classes scheduled</p>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.04]">
                      <div className="text-center shrink-0 w-16">
                        <p className="text-white text-[13px] font-medium">{e.startTime}</p>
                        <p className="text-white/40 text-[11px]">{e.endTime}</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex-1">
                        <p className="text-white text-[13px] font-medium">{e.subject || "General"}</p>
                        <p className="text-white/40 text-[12px]">{e.class.displayName || e.class.name}{e.room ? ` • ${e.room}` : ""}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-[11px] bg-[var(--primary)]/20 text-[var(--primary)]">Period {e.period}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {timetable.length === 0 && (
            <div className="card text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">No timetable entries found</p>
            </div>
          )}
        </motion.div>
      )}

      {tab === "subjects" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Assigned Subjects</h3>
            {teacher.teacherSubjects.length === 0 ? (
              <p className="text-white/40 text-sm">No subjects assigned</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacher.teacherSubjects.map((ts) => (
                  <div key={ts.subject.id} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/30 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-medium">{ts.subject.name}</p>
                        <p className="text-white/40 text-[11px]">Assigned Subject</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Assigned Classes</h3>
            {assignedClasses.length === 0 ? (
              <p className="text-white/40 text-sm">No classes assigned</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assignedClasses.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-medium">{c.displayName || c.name}</p>
                        <p className="text-white/40 text-[11px]">Class</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

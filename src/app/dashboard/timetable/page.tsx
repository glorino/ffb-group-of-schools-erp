"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
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

function ReadOnlyTimetable({ entries, loading }: { entries: TimetableEntry[]; loading: boolean }) {
  const getEntry = (day: number, time: string) =>
    entries.find(e => e.dayOfWeek === day && e.startTime === time);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#94a3b8] animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-[#64748b] text-[11px] font-medium w-[90px]">Time</th>
            {dayLabels.map((day, i) => (
              <th key={day} className="p-2 text-center text-[#475569] text-[12px] font-semibold">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, ti) => (
            <tr key={time} className="border-t border-[#e2e8f0]">
              <td className="p-2 text-[#94a3b8] text-[11px] font-medium whitespace-nowrap">{time}</td>
              {dayLabels.map((_, di) => {
                const entry = getEntry(di + 1, time);
                return (
                  <td key={di} className="p-1.5">
                    <div className={`min-h-[52px] rounded-lg p-2 flex items-center justify-center text-center ${
                      entry ? "bg-white/[0.06] border border-[#e2e8f0]" : "bg-[#f8fafc]"
                    }`}>
                      {entry ? (
                        <div>
                          <p className="text-[var(--accent)] text-[11px] font-bold leading-tight">{entry.subject || "Lesson"}</p>
                          <p className="text-[#64748b] text-[9px] mt-0.5">{entry.teacher.firstName} {entry.teacher.lastName[0]}.</p>
                          {entry.room && <p className="text-[#94a3b8] text-[8px]">{entry.room}</p>}
                        </div>
                      ) : (
                        <span className="text-[#94a3b8] text-[10px]">—</span>
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
  const [form, setForm] = useState({
    dayOfWeek: "1",
    startTime: "8:00 AM",
    endTime: "9:00 AM",
    teacherId: "",
    room: "",
    subject: "",
    type: "lesson",
  });

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    fetch(`/api/timetable?classId=${selectedClass}`)
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => { setEntries([]); toast.error("Failed to load timetable"); })
      .finally(() => setLoading(false));
  }, [selectedClass, setEntries]);

  const getEntry = (day: number, time: string) =>
    entries.find(e => e.dayOfWeek === day && e.startTime === time);

  const stats = [
    { label: "Total Slots", value: entries.length, icon: BookOpen, color: "#0055ff" },
    { label: "Teachers Assigned", value: new Set(entries.map(e => e.teacherId)).size, icon: Users, color: "#28ff9c" },
    { label: "Rooms Used", value: new Set(entries.filter(e => e.room).map(e => e.room)).size, icon: Calendar, color: "#a855f7" },
    { label: "Days Covered", value: new Set(entries.map(e => e.dayOfWeek)).size, icon: AlertCircle, color: "#f97316" },
  ];

  const handleCreate = async () => {
    if (!form.teacherId) { toast.error("Please select a teacher"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass, ...form, dayOfWeek: parseInt(form.dayOfWeek) }),
      });
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

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4 relative z-30">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
          style={{ colorScheme: "light" }}
        >
          {classes.map(c => (
            <option key={c.id} value={c.id} style={{ background: "#ffffff", color: "#1a1a2e" }}>{c.displayName || c.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedClass}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/25 relative z-30"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[12px] mb-1">{stat.label}</p>
                <p className="text-[28px] font-bold text-[#1a1a2e]">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[#64748b] text-[12px] mb-3 font-medium uppercase tracking-wider">Weekly Timetable</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#94a3b8] animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-[#64748b] text-[11px] font-medium w-[90px]">Time</th>
                {dayLabels.map((day) => (
                  <th key={day} className="p-2 text-center text-[#475569] text-[12px] font-semibold">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-t border-[#e2e8f0]">
                  <td className="p-2 text-[#94a3b8] text-[11px] font-medium whitespace-nowrap">{time}</td>
                  {dayLabels.map((_, di) => {
                    const entry = getEntry(di + 1, time);
                    return (
                      <td key={di} className="p-1.5">
                        <div
                          onClick={() => entry && setDetailSlot(entry)}
                          className={`min-h-[52px] rounded-lg p-2 flex items-center justify-center text-center transition-all ${
                            entry
                              ? "bg-white/[0.06] border border-[#e2e8f0] hover:bg-[#f1f5f9] cursor-pointer group relative"
                              : "bg-[#f8fafc] hover:bg-[#f8fafc] cursor-pointer"
                          }`}
                        >
                          {entry ? (
                            <>
                              <div>
                                <p className="text-[#1a1a2e] text-[11px] font-medium">{entry.teacher.firstName} {entry.teacher.lastName}</p>
                                <p className="text-[#94a3b8] text-[9px]">{entry.room || "—"}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                className="absolute top-1 right-1 p-1 rounded-md bg-[#fee2e2] text-[#dc2626] opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <GripVertical className="w-4 h-4 text-[#94a3b8]" />
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

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1a1a2e] font-semibold text-lg">Add Timetable Slot</h3>
                <button onClick={() => setShowModal(false)} className="text-[#94a3b8] hover:text-[#475569]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[#64748b] text-[12px] mb-1 block">Day of Week</label>
                  <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "light" }}>
                    {dayLabels.map((d, i) => <option key={i} value={i + 1} style={{ background: "#ffffff", color: "#1a1a2e" }}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#64748b] text-[12px] mb-1 block">Start Time</label>
                    <select value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "light" }}>
                      {timeSlots.map(t => <option key={t} value={t} style={{ background: "#ffffff", color: "#1a1a2e" }}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#64748b] text-[12px] mb-1 block">End Time</label>
                    <select value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "light" }}>
                      {timeSlots.map(t => <option key={t} value={t} style={{ background: "#ffffff", color: "#1a1a2e" }}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[#64748b] text-[12px] mb-1 block">Teacher</label>
                  <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "light" }}>
                    <option value="" style={{ background: "#ffffff", color: "#1a1a2e" }}>Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id} style={{ background: "#ffffff", color: "#1a1a2e" }}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#64748b] text-[12px] mb-1 block">Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] placeholder-white/20 focus:outline-none focus:border-[var(--primary)]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#64748b] text-[12px] mb-1 block">Room</label>
                    <input type="text" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                      placeholder="e.g. Room 101"
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] placeholder-white/20 focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="text-[#64748b] text-[12px] mb-1 block">Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "light" }}>
                      <option value="lesson" style={{ background: "#ffffff", color: "#1a1a2e" }}>Lesson</option>
                      <option value="break" style={{ background: "#ffffff", color: "#1a1a2e" }}>Break</option>
                      <option value="lab" style={{ background: "#ffffff", color: "#1a1a2e" }}>Lab</option>
                      <option value="assembly" style={{ background: "#ffffff", color: "#1a1a2e" }}>Assembly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[13px] font-medium hover:bg-[#f1f5f9] transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={submitting || !form.teacherId}
                  className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[var(--primary)]/25">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Slot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailSlot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1a1a2e] font-semibold text-lg">Timetable Slot Details</h3>
                <button onClick={() => setDetailSlot(null)} className="text-[#94a3b8] hover:text-[#475569]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Day</span><span className="text-[#1a1a2e] text-[13px] font-medium">{dayLabels[detailSlot.dayOfWeek - 1]}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Time</span><span className="text-[#1a1a2e] text-[13px] font-medium">{detailSlot.startTime} — {detailSlot.endTime}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Subject</span><span className="text-[#1a1a2e] text-[13px] font-medium">{detailSlot.subject || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Teacher</span><span className="text-[#1a1a2e] text-[13px] font-medium">{detailSlot.teacher.firstName} {detailSlot.teacher.lastName}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Class</span><span className="text-[#1a1a2e] text-[13px] font-medium">{detailSlot.class.displayName || detailSlot.class.name}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Room</span><span className="text-[#1a1a2e] text-[13px] font-medium">{detailSlot.room || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b] text-[13px]">Type</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    detailSlot.type === "lesson" ? "bg-[#dbeafe] text-[#2563eb]" :
                    detailSlot.type === "break" ? "bg-[#fef3c7] text-[#d97706]" :
                    detailSlot.type === "lab" ? "bg-[#f3e8ff] text-[#7c3aed]" :
                    "bg-white/[0.06] text-[#64748b]"
                  }`}>{detailSlot.type}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-0 pt-4 mt-4 border-t border-[#e2e8f0]">
                <button onClick={() => { setDetailSlot(null); handleDelete(detailSlot.id); }}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[#dc2626] text-[13px] font-medium hover:bg-[#fee2e2] transition-colors">
                  Delete
                </button>
                <button onClick={() => setDetailSlot(null)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
          if (child?.classId) {
            setSelectedClass(child.classId);
          } else {
            setLoading(false);
          }
        })
        .catch(() => { setLoading(false); });
    } else {
      Promise.all([
        fetch("/api/classes").then(r => r.json()),
        fetch("/api/teachers?limit=100").then(r => r.json()),
      ]).then(([classData, teacherData]) => {
        setClasses(classData.classes || classData || []);
        setTeachers(teacherData.teachers || []);
        if (classData.classes?.length && !selectedClass) {
          setSelectedClass(classData.classes[0].id);
        }
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">
            {isReadOnly ? "My Timetable" : "Timetable Management"}
          </h1>
          <p className="text-[#475569]">
            {isReadOnly
              ? `${className?.displayName || className?.name || "Your class"} schedule`
              : "Schedule classes, assign teachers, and manage rooms"
            }
          </p>
        </div>
        {isReadOnly && (
          <div className="px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <span className="text-[#64748b] text-[12px]">{className?.displayName || className?.name || "—"}</span>
          </div>
        )}
      </div>

      {isReadOnly ? (
        <ReadOnlyTimetable entries={entries} loading={loading} />
      ) : (
        <AdminTimetable
          entries={entries} setEntries={setEntries}
          classes={classes} teachers={teachers}
          selectedClass={selectedClass} setSelectedClass={setSelectedClass}
        />
      )}
    </motion.div>
  );
}

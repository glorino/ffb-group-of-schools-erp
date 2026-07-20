"use client";

import { useEffect, useState } from "react";
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

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

interface TimetableEntry {
  id: string;
  classId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  type: string;
  class: { id: string; name: string; displayName: string | null };
  teacher: { id: string; firstName: string; lastName: string };
}

interface ClassOption {
  id: string;
  name: string;
  displayName: string | null;
}

interface TeacherOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: "1",
    startTime: "8:00 AM",
    endTime: "9:00 AM",
    teacherId: "",
    room: "",
    type: "lesson",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then(r => r.json()),
      fetch("/api/teachers?limit=100").then(r => r.json()),
    ]).then(([classData, teacherData]) => {
      setClasses(classData.classes || classData || []);
      setTeachers(teacherData.teachers || []);
      if (classData.classes?.length && !selectedClass) {
        setSelectedClass(classData.classes[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    fetch(`/api/timetable?classId=${selectedClass}`)
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => { setEntries([]); toast.error("Failed to load timetable"); })
      .finally(() => setLoading(false));
  }, [selectedClass]);

  const getEntry = (day: number, time: string) =>
    entries.find(e => e.dayOfWeek === day && e.startTime === time);

  const handleCreate = async () => {
    if (!form.teacherId) { toast.error("Please select a teacher"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, classId: selectedClass, dayOfWeek: parseInt(form.dayOfWeek) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setEntries(prev => [...prev, { ...data.entry, class: classes.find(c => c.id === selectedClass)!, teacher: teachers.find(t => t.id === form.teacherId)! }]);
      setShowModal(false);
      setForm({ dayOfWeek: "1", startTime: "8:00 AM", endTime: "9:00 AM", teacherId: "", room: "", type: "lesson" });
      toast.success("Timetable slot added");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/timetable?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success("Slot removed");
    } catch {
      toast.error("Failed to remove slot");
    }
  };

  const stats = [
    { label: "Total Slots", value: entries.length.toString(), icon: BookOpen, color: "from-blue-500 to-blue-600" },
    { label: "Teachers Assigned", value: String(new Set(entries.map(e => e.teacherId)).size), icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Rooms Used", value: String(new Set(entries.filter(e => e.room).map(e => e.room)).size), icon: Calendar, color: "from-purple-500 to-purple-600" },
    { label: "Days Covered", value: String(new Set(entries.map(e => e.dayOfWeek)).size), icon: AlertCircle, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Timetable Management</h1>
            <p className="text-white/60">Schedule classes, assign teachers, and manage rooms</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              disabled={!selectedClass}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Weekly Timetable</h3>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer"
            style={{ colorScheme: "dark" }}
          >
            <option value="" style={{ background: "#0f1b33", color: "#fff" }}>Select Class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id} style={{ background: "#0f1b33", color: "#fff" }}>{c.displayName || c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="p-2 text-white/50 text-sm font-medium">Time</div>
                {dayLabels.slice(0, 5).map((day) => (
                  <div key={day} className="p-2 text-white/50 text-sm font-medium text-center">{day}</div>
                ))}
              </div>
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="p-2 text-white/40 text-sm flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {time}
                  </div>
                  {dayLabels.slice(0, 5).map((day, dayIdx) => {
                    const dayNum = dayIdx + 1;
                    const slot = getEntry(dayNum, time);
                    return (
                      <div
                        key={`${day}-${time}`}
                        className={`p-2 rounded-xl min-h-[60px] flex items-center justify-center transition-all group relative ${
                          slot
                            ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30 hover:bg-[var(--primary)]/30"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {slot ? (
                          <>
                            <div className="text-center">
                              <p className="text-white text-xs font-medium">{slot.teacher.firstName} {slot.teacher.lastName}</p>
                              <p className="text-white/40 text-[10px]">{slot.room || "—"}</p>
                            </div>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <GripVertical className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[var(--sidebar)]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold">Add Timetable Slot</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/70 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Day of Week</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                    style={{ colorScheme: "dark" }}
                  >
                    {dayLabels.slice(0, 5).map((d, i) => (
                      <option key={i} value={String(i + 1)} style={{ background: "#0f1b33", color: "#fff" }}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Start Time</label>
                    <select
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                      style={{ colorScheme: "dark" }}
                    >
                      {timeSlots.map(t => (
                        <option key={t} value={t} style={{ background: "#0f1b33", color: "#fff" }}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">End Time</label>
                    <select
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                      style={{ colorScheme: "dark" }}
                    >
                      {timeSlots.map(t => (
                        <option key={t} value={t} style={{ background: "#0f1b33", color: "#fff" }}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-[12px] mb-1.5">Teacher</label>
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="" style={{ background: "#0f1b33", color: "#fff" }}>Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id} style={{ background: "#0f1b33", color: "#fff" }}>{t.firstName} {t.lastName} ({t.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Room</label>
                    <input
                      type="text"
                      value={form.room}
                      onChange={(e) => setForm({ ...form, room: e.target.value })}
                      placeholder="e.g. Room 101"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[12px] mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] outline-none focus:border-[var(--primary)]/50"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="lesson" style={{ background: "#0f1b33", color: "#fff" }}>Lesson</option>
                      <option value="break" style={{ background: "#0f1b33", color: "#fff" }}>Break</option>
                      <option value="exam" style={{ background: "#0f1b33", color: "#fff" }}>Exam</option>
                      <option value="lab" style={{ background: "#0f1b33", color: "#fff" }}>Lab</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting || !form.teacherId}
                  className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[var(--primary)]/25"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Slot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

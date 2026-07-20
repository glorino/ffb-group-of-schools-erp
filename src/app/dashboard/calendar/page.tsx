"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  type: string;
  description?: string;
}

interface SchoolEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  type?: string;
}

const eventColorMap: Record<string, string> = {
  exam: "bg-red-500/20 text-red-400",
  meeting: "bg-blue-500/20 text-blue-400",
  event: "bg-emerald-500/20 text-emerald-400",
  admin: "bg-purple-500/20 text-purple-400",
  holiday: "bg-yellow-500/20 text-yellow-400",
  sports: "bg-orange-500/20 text-orange-400",
};

export default function CalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    allDay: false,
    color: "#0055ff",
    type: "event",
    description: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch calendar");
      setCalendarEvents(data.calendarEvents || []);
      setSchoolEvents(data.schoolEvents || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load calendar");
      setCalendarEvents([]);
      setSchoolEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      toast.success("Event created successfully");
      setShowModal(false);
      setForm({ title: "", start: "", end: "", allDay: false, color: "#0055ff", type: "event", description: "" });
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    downloadCSV(
      calendarEvents.map((e) => ({
        Title: e.title,
        Start: new Date(e.start).toLocaleDateString(),
        End: new Date(e.end).toLocaleDateString(),
        Type: e.type,
        "All Day": e.allDay ? "Yes" : "No",
      })),
      "calendar_events"
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const getEventsForDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return calendarEvents.filter((e) => {
      const start = e.start.split("T")[0];
      const end = e.end.split("T")[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return calendarEvents
      .filter((e) => new Date(e.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }, [calendarEvents]);

  const eventCategories = useMemo(() => {
    const catMap: Record<string, number> = {};
    calendarEvents.forEach((e) => {
      catMap[e.type] = (catMap[e.type] || 0) + 1;
    });
    return Object.entries(catMap).map(([type, count]) => ({ type, count }));
  }, [calendarEvents]);

  const today = new Date();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Calendar</h1>
            <p className="text-white/60">
              View and manage school events, exams, and activities
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                handleExport();
                toast.success("Exported successfully");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[12px] hover:bg-white/[0.08]"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-white/50 text-[13px] font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day === today.getDate() &&
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear();
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[13px] cursor-pointer transition-all relative ${
                      isToday
                        ? "bg-[var(--primary)] text-white font-bold"
                        : dayEvents.length > 0
                        ? "bg-white/[0.08] text-white hover:bg-white/[0.12]"
                        : "text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && !isToday && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ background: e.color || "var(--accent)" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Upcoming Events</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-white/40 text-[13px] text-center py-10">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${eventColorMap[event.type] || "bg-white/10 text-white/40"}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-white text-[13px] font-medium mb-1">{event.title}</p>
                    <div className="flex items-center gap-3 text-[12px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-white/30" />
                        <span className="text-white/40">
                          {new Date(event.start).toLocaleDateString()}
                          {event.end && event.start !== event.end
                            ? ` - ${new Date(event.end).toLocaleDateString()}`
                            : ""}
                        </span>
                      </div>
                      {event.allDay && (
                        <span className="text-white/30">All Day</span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-white/30 text-[12px] mt-1 line-clamp-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Event Categories</h3>
            <div className="space-y-2">
              {eventCategories.length === 0 ? (
                <p className="text-white/40 text-[13px] text-center py-4">No categories</p>
              ) : (
                eventCategories.map((category, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: category.type === "exam" ? "#ef4444" : category.type === "meeting" ? "#3b82f6" : category.type === "event" ? "#10b981" : "#a855f7" }}
                      />
                      <span className="text-white/70 text-[13px]">{category.type}</span>
                    </div>
                    <span className="text-white/40 text-[13px]">{category.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Add Event</h3>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. Parent-Teacher Meeting"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Start *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.start}
                      onChange={(e) => setForm({ ...form, start: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">End</label>
                    <input
                      type="datetime-local"
                      value={form.end}
                      onChange={(e) => setForm({ ...form, end: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="event">Event</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="exam">Exam</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="meeting">Meeting</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="admin">Administrative</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="holiday">Holiday</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="sports">Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Color</label>
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full h-[38px] rounded-xl bg-white/[0.04] border border-white/[0.08] cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allDay}
                      onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white/60 text-[13px]">All Day Event</span>
                  </label>
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
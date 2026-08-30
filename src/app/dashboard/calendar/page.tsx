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
  X,
  Loader2,
  Download,
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
  exam: "bg-[#fee2e2] text-[#dc2626]",
  meeting: "bg-[#dbeafe] text-[#2563eb]",
  event: "bg-[#dcfce7] text-[#16a34a]",
  admin: "bg-[#f3e8ff] text-[#7c3aed]",
  holiday: "bg-yellow-500/20 text-[#ca8a04]",
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
        className="card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mt-8 p-8 shadow-sm"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Calendar</h1>
            <p className="text-[#475569]">
              View and manage school events, exams, and activities
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                handleExport();
                toast.success("Exported successfully");
              }}
              className="btn btn-secondary"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
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
          className="lg:col-span-2 card shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1a1a2e] font-semibold text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[12px] hover:bg-[#f1f5f9]"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-[#64748b] text-[13px] font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
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
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[13px] cursor-pointer transition-colors relative border border-transparent ${
                      isToday
                        ? "bg-[var(--primary)] text-white font-bold border-[var(--primary)]"
                        : dayEvents.length > 0
                        ? "bg-[#f8fafc] text-[#1a1a2e] hover:bg-[#f1f5f9] border-[#e2e8f0]"
                        : "text-[#475569] hover:bg-[#f8fafc] hover:border-[#f1f5f9]"
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
          <div className="card shadow-sm">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Upcoming Events</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-[#64748b] animate-spin" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-[#64748b] text-[13px] text-center py-10">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${eventColorMap[event.type] || "bg-[#f1f5f9] text-[#64748b]"}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-[#1a1a2e] text-[13px] font-medium mb-1">{event.title}</p>
                    <div className="flex items-center gap-3 text-[12px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#94a3b8]" />
                        <span className="text-[#64748b]">
                          {new Date(event.start).toLocaleDateString()}
                          {event.end && event.start !== event.end
                            ? ` - ${new Date(event.end).toLocaleDateString()}`
                            : ""}
                        </span>
                      </div>
                      {event.allDay && (
                        <span className="text-[#94a3b8]">All Day</span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-[#94a3b8] text-[12px] mt-1 line-clamp-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card shadow-sm">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Event Categories</h3>
            <div className="space-y-2">
              {eventCategories.length === 0 ? (
                <p className="text-[#64748b] text-[13px] text-center py-4">No categories</p>
              ) : (
                eventCategories.map((category, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: category.type === "exam" ? "#ef4444" : category.type === "meeting" ? "#3b82f6" : category.type === "event" ? "#10b981" : "#a855f7" }}
                      />
                      <span className="text-[#475569] text-[13px]">{category.type}</span>
                    </div>
                    <span className="text-[#64748b] text-[13px]">{category.count}</span>
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
            className="modal-overlay" onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content shadow-sm"
            >
              <div className="modal-header">
                <h3 className="text-[#1a1a2e] font-semibold text-lg">Add Event</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#64748b] hover:text-[#1a1a2e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. Parent-Teacher Meeting"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">Start *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.start}
                      onChange={(e) => setForm({ ...form, start: e.target.value })}
                      style={{ colorScheme: "light" }}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">End</label>
                    <input
                      type="datetime-local"
                      value={form.end}
                      onChange={(e) => setForm({ ...form, end: e.target.value })}
                      style={{ colorScheme: "light" }}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      style={{ colorScheme: "light" }}
                      className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="event">Event</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="exam">Exam</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="meeting">Meeting</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="admin">Administrative</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="holiday">Holiday</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="sports">Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">Color</label>
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full h-[38px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer"
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
                    <span className="text-[#475569] text-[13px]">All Day Event</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Optional description..."
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn btn-primary"
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
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Suspense } from "react";

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

const eventColorMap: Record<string, { bg: string; color: string }> = {
  exam: { bg: "#fee2e2", color: "#dc2626" },
  meeting: { bg: "#dbeafe", color: "#2563eb" },
  event: { bg: "#dcfce7", color: "#16a34a" },
  admin: { bg: "#f3e8ff", color: "#7c3aed" },
  holiday: { bg: "#fef9c3", color: "#ca8a04" },
  sports: { bg: "#ffedd5", color: "#f97316" },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "2px solid #e5e7eb",
  fontSize: "13px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  background: "#ffffff",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#0055ff";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)";
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#e5e7eb";
  e.currentTarget.style.boxShadow = "none";
};

function CalendarPageInner() {
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
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Calendar</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>View and manage school events, exams, and activities</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                handleExport();
                toast.success("Exported successfully");
              }}
              style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <Plus style={{ width: "16px", height: "16px" }} /> Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar + Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Calendar Grid */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={prevMonth}
                style={{ padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <ChevronLeft style={{ width: "16px", height: "16px" }} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "12px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                style={{ padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "12px" }}>
            {daysOfWeek.map((day) => (
              <div key={day} style={{ textAlign: "center", color: "#64748b", fontSize: "13px", fontWeight: 500, padding: "8px 0" }}>
                {day}
              </div>
            ))}
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
              <Loader2 style={{ width: "32px", height: "32px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day === today.getDate() &&
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear();

                let cellBg = "transparent";
                let cellColor = "#475569";
                let cellBorder = "1px solid transparent";
                let cellFontWeight: string | number = 400;
                if (isToday) {
                  cellBg = "#0055ff";
                  cellColor = "#ffffff";
                  cellBorder = "1px solid #0055ff";
                  cellFontWeight = 700;
                } else if (dayEvents.length > 0) {
                  cellBg = "#f8fafc";
                  cellColor = "#0f172a";
                  cellBorder = "1px solid #e2e8f0";
                }

                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      cursor: "pointer",
                      position: "relative",
                      background: cellBg,
                      color: cellColor,
                      border: cellBorder,
                      fontWeight: cellFontWeight,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isToday) {
                        e.currentTarget.style.background = "#f1f5f9";
                        e.currentTarget.style.borderColor = "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isToday) {
                        e.currentTarget.style.background = dayEvents.length > 0 ? "#f8fafc" : "transparent";
                        e.currentTarget.style.borderColor = dayEvents.length > 0 ? "#e2e8f0" : "transparent";
                      }
                    }}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && !isToday && (
                      <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div
                            key={i}
                            style={{ width: "5px", height: "5px", borderRadius: "50%", background: e.color || "#a855f7" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Upcoming Events */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Upcoming Events</h3>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 style={{ width: "24px", height: "24px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Calendar style={{ width: "26px", height: "26px", color: "#cbd5e1" }} />
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>No upcoming events</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {upcomingEvents.map((event) => {
                  const ec = eventColorMap[event.type] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <div
                      key={event.id}
                      style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", transition: "background 0.15s", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: ec.bg, color: ec.color, textTransform: "capitalize" }}>
                          {event.type}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a", marginBottom: "6px" }}>{event.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar style={{ width: "12px", height: "12px", color: "#94a3b8" }} />
                          <span style={{ color: "#64748b" }}>
                            {new Date(event.start).toLocaleDateString()}
                            {event.end && event.start !== event.end
                              ? ` - ${new Date(event.end).toLocaleDateString()}`
                              : ""}
                          </span>
                        </div>
                        {event.allDay && (
                          <span style={{ color: "#94a3b8" }}>All Day</span>
                        )}
                      </div>
                      {event.description && (
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event Categories */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Event Categories</h3>
            {eventCategories.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>No categories</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {eventCategories.map((category, i) => {
                  const dotColor = category.type === "exam" ? "#ef4444"
                    : category.type === "meeting" ? "#3b82f6"
                    : category.type === "event" ? "#10b981"
                    : category.type === "holiday" ? "#eab308"
                    : category.type === "sports" ? "#f97316"
                    : "#a855f7";
                  return (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: dotColor }} />
                        <span style={{ fontSize: "13px", color: "#475569" }}>{category.type}</span>
                      </div>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{category.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Add Event</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Create a new calendar event</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            {/* Modal Form */}
            <form onSubmit={handleCreate} style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Parent-Teacher Meeting"
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Start <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start}
                    onChange={(e) => setForm({ ...form, start: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>End</label>
                  <input
                    type="datetime-local"
                    value={form.end}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    <option value="event">Event</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="admin">Administrative</option>
                    <option value="holiday">Holiday</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Color</label>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    style={{ width: "100%", height: "42px", borderRadius: "10px", border: "2px solid #e5e7eb", cursor: "pointer", background: "#ffffff", padding: "4px" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.allDay}
                    onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                    style={{ width: "16px", height: "16px", borderRadius: "4px", accentColor: "#0055ff" }}
                  />
                  <span style={{ fontSize: "13px", color: "#475569" }}>All Day Event</span>
                </label>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="Optional description..."
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: "12px 28px", borderRadius: "12px", border: "none", background: submitting ? "#93c5fd" : "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: submitting ? "none" : "0 4px 14px rgba(0,85,255,0.3)", transition: "all 0.15s" }}
                >
                  {submitting && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <CalendarPageInner />
    </Suspense>
  );
}

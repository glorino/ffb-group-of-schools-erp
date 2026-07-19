"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
} from "lucide-react";

const events = [
  { id: 1, title: "Mid-Term Examination", date: "Jan 20-30, 2025", time: "All Day", type: "exam", color: "bg-red-500/20 text-red-400" },
  { id: 2, title: "Parent-Teacher Meeting", date: "Jan 22, 2025", time: "10:00 AM", type: "meeting", color: "bg-blue-500/20 text-blue-400" },
  { id: 3, title: "School Sports Day", date: "Jan 25, 2025", time: "8:00 AM", type: "event", color: "bg-emerald-500/20 text-emerald-400" },
  { id: 4, title: "Board Meeting", date: "Jan 28, 2025", time: "2:00 PM", type: "admin", color: "bg-purple-500/20 text-purple-400" },
  { id: 5, title: "Career Day", date: "Feb 5, 2025", time: "9:00 AM", type: "event", color: "bg-orange-500/20 text-orange-400" },
];

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
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
            <h3 className="text-white font-semibold text-lg">January 2025</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-white/50 text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const hasEvent = [20, 22, 25, 28].includes(day);
              const isToday = day === 15;
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm cursor-pointer transition-all ${
                    isToday ? "bg-[var(--primary)] text-white font-bold" :
                    hasEvent ? "bg-white/10 text-white hover:bg-white/15" :
                    "text-white/60 hover:bg-white/5"
                  }`}
                >
                  <div className="text-center">
                    <span>{day}</span>
                    {hasEvent && !isToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mx-auto mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${event.color}`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">{event.title}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <span className="text-white/40">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/30" />
                      <span className="text-white/40">{event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Event Categories</h3>
            <div className="space-y-2">
              {[
                { label: "Examinations", count: 3, color: "bg-red-500" },
                { label: "Meetings", count: 2, color: "bg-blue-500" },
                { label: "Events", count: 5, color: "bg-emerald-500" },
                { label: "Administrative", count: 2, color: "bg-purple-500" },
              ].map((category, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-white/70 text-sm">{category.label}</span>
                  </div>
                  <span className="text-white/40 text-sm">{category.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

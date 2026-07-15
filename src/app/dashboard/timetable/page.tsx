"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Download,
  Settings,
  GripVertical,
  Users,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timetableData = [
  { day: "Monday", time: "8:00 AM", subject: "Mathematics", teacher: "Mrs. Okonkwo", class: "JSS1A", room: "Room 101" },
  { day: "Monday", time: "9:00 AM", subject: "English Language", teacher: "Mr. Nwosu", class: "JSS1A", room: "Room 101" },
  { day: "Monday", time: "10:00 AM", subject: "Physics", teacher: "Mrs. Abubakar", class: "SS1A", room: "Lab 1" },
  { day: "Monday", time: "11:00 AM", subject: "Chemistry", teacher: "Mr. Adeyemi", class: "SS2A", room: "Lab 2" },
  { day: "Tuesday", time: "8:00 AM", subject: "Biology", teacher: "Mrs. Okwu", class: "SS3A", room: "Lab 3" },
  { day: "Tuesday", time: "9:00 AM", subject: "Literature", teacher: "Mr. Obi", class: "SS1B", room: "Room 201" },
  { day: "Wednesday", time: "8:00 AM", subject: "Mathematics", teacher: "Mrs. Okonkwo", class: "JSS2A", room: "Room 102" },
  { day: "Thursday", time: "8:00 AM", subject: "English Language", teacher: "Mr. Nwosu", class: "JSS3A", room: "Room 103" },
  { day: "Friday", time: "8:00 AM", subject: "Agricultural Science", teacher: "Mr. Bello", class: "JSS1A", room: "Farm" },
];

const stats = [
  { label: "Total Classes", value: "180", icon: BookOpen, color: "from-blue-500 to-blue-600" },
  { label: "Teachers Assigned", value: "156", icon: Users, color: "from-emerald-500 to-emerald-600" },
  { label: "Conflicts", value: "2", icon: AlertCircle, color: "from-red-500 to-red-600" },
  { label: "Rooms Used", value: "24", icon: Calendar, color: "from-purple-500 to-purple-600" },
];

export default function TimetablePage() {
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
            <p className="text-white/60">
              Drag-and-drop interface for scheduling classes and managing rooms
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
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
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none">
              <option>JSS1</option>
              <option>JSS2</option>
              <option>JSS3</option>
              <option>SS1</option>
              <option>SS2</option>
              <option>SS3</option>
            </select>
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="p-2 text-white/50 text-sm font-medium">Time</div>
              {days.map((day) => (
                <div key={day} className="p-2 text-white/50 text-sm font-medium text-center">{day}</div>
              ))}
            </div>
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-6 gap-2 mb-2">
                <div className="p-2 text-white/40 text-sm flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {time}
                </div>
                {days.map((day) => {
                  const slot = timetableData.find((t) => t.day === day && t.time === time);
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`p-2 rounded-xl min-h-[60px] flex items-center justify-center transition-all cursor-pointer ${
                        slot
                          ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30 hover:bg-[var(--primary)]/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {slot ? (
                        <div className="text-center">
                          <p className="text-white text-xs font-medium">{slot.subject}</p>
                          <p className="text-white/40 text-[10px]">{slot.teacher}</p>
                        </div>
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
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Search,
  Filter,
  AlertTriangle,
} from "lucide-react";

const todayStats = [
  { label: "Total Students", value: 2847, icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Present", value: 2681, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
  { label: "Absent", value: 98, icon: XCircle, color: "from-red-500 to-red-600" },
  { label: "Late", value: 68, icon: Clock, color: "from-yellow-500 to-yellow-600" },
];

const classAttendance = [
  { className: "JSS1A", present: 42, absent: 3, late: 2, rate: 93.3 },
  { className: "JSS1B", present: 40, absent: 5, late: 1, rate: 88.9 },
  { className: "JSS2A", present: 38, absent: 2, late: 4, rate: 88.4 },
  { className: "JSS2B", present: 41, absent: 1, late: 3, rate: 93.2 },
  { className: "JSS3", present: 44, absent: 2, late: 1, rate: 95.7 },
  { className: "SS1A", present: 36, absent: 4, late: 2, rate: 85.7 },
  { className: "SS1B", present: 38, absent: 3, late: 1, rate: 90.5 },
  { className: "SS2A", present: 35, absent: 1, late: 3, rate: 89.7 },
  { className: "SS2B", present: 37, absent: 2, late: 2, rate: 90.2 },
  { className: "SS3", present: 45, absent: 0, late: 2, rate: 95.7 },
];

const absentStudents = [
  { name: "Oluwaseun Akindele", class: "SS3", reason: "Sick", notified: true },
  { name: "Blessing Eze", class: "JSS1A", reason: "Family emergency", notified: true },
  { name: "Yusuf Aliyu", class: "JSS2B", reason: "Not reported", notified: false },
  { name: "Ngozi Okoro", class: "SS1A", reason: "Medical appointment", notified: true },
  { name: "Tunde Bakare", class: "SS2A", reason: "Not reported", notified: false },
];

const weeklyTrend = [
  { day: "Mon", rate: 94.2 },
  { day: "Tue", rate: 92.8 },
  { day: "Wed", rate: 95.1 },
  { day: "Thu", rate: 93.5 },
  { day: "Fri", rate: 89.7 },
];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState("2025-01-15");
  const [selectedSession, setSelectedSession] = useState("morning");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance Management</h2>
          <p className="text-white/50 text-sm">
            Track student and teacher attendance with QR code support
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Scanner
          </button>
          <button className="px-4 py-2.5 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Date & Session Selector */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-white/50 text-xs mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-1">Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {todayStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Class Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Class Attendance</h3>
            <button className="text-[var(--accent)] text-sm hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {classAttendance.map((cls, i) => (
                  <tr key={i}>
                    <td className="text-white font-medium">{cls.className}</td>
                    <td className="text-emerald-400">{cls.present}</td>
                    <td className="text-red-400">{cls.absent}</td>
                    <td className="text-yellow-400">{cls.late}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px] h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cls.rate >= 90
                                ? "bg-emerald-500"
                                : cls.rate >= 80
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${cls.rate}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-sm">{cls.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">Weekly Trend</h3>
          <div className="space-y-3">
            {weeklyTrend.map((day, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white/60 text-sm w-10">{day.day}</span>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${day.rate}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-lg"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                    {day.rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Absent Students Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-semibold text-lg">Absent Students Today</h3>
          </div>
          <button className="px-4 py-2 rounded-xl bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/30 transition-all">
            Notify Parents
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Reason</th>
                <th>Parent Notified</th>
              </tr>
            </thead>
            <tbody>
              {absentStudents.map((student, i) => (
                <tr key={i}>
                  <td className="text-white font-medium">{student.name}</td>
                  <td className="text-white/60">{student.class}</td>
                  <td className="text-white/60">{student.reason}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.notified
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {student.notified ? "Notified" : "Not Notified"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

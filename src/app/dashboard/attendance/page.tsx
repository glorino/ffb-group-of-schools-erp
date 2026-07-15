"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  AlertTriangle,
} from "lucide-react";

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface ClassAttendance {
  className: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

interface AbsentStudent {
  name: string;
  class: string;
  reason: string;
  notified: boolean;
}

interface AttendanceResponse {
  stats: AttendanceStats;
  classAttendance: ClassAttendance[];
  absentStudents: AbsentStudent[];
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSession, setSelectedSession] = useState("morning");
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      date: selectedDate,
      session: selectedSession,
    });

    fetch(`/api/attendance?${params}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate, selectedSession]);

  const todayStats = [
    { label: "Total Students", value: data?.stats?.total ?? 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Present", value: data?.stats?.present ?? 0, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
    { label: "Absent", value: data?.stats?.absent ?? 0, icon: XCircle, color: "from-red-500 to-red-600" },
    { label: "Late", value: data?.stats?.late ?? 0, icon: Clock, color: "from-yellow-500 to-yellow-600" },
  ];

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
                <p className="text-2xl font-bold text-white">{Number(stat.value).toLocaleString()}</p>
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="p-4"><div className="skeleton h-4 w-full" /></td>
                    </tr>
                  ))
                ) : data?.classAttendance?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-white/40">
                      No attendance data for this date
                    </td>
                  </tr>
                ) : (
                  data?.classAttendance?.map((cls, i) => (
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
                          <span className="text-white/60 text-sm">{cls.rate.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Attendance Rate Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">Today&apos;s Summary</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Present</span>
                <span className="text-emerald-400 text-sm font-bold">
                  {data?.stats?.total ? ((data.stats.present / data.stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${data?.stats?.total ? (data.stats.present / data.stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Absent</span>
                <span className="text-red-400 text-sm font-bold">
                  {data?.stats?.total ? ((data.stats.absent / data.stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${data?.stats?.total ? (data.stats.absent / data.stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Late</span>
                <span className="text-yellow-400 text-sm font-bold">
                  {data?.stats?.total ? ((data.stats.late / data.stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${data?.stats?.total ? (data.stats.late / data.stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
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
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="p-4"><div className="skeleton h-4 w-full" /></td>
                  </tr>
                ))
              ) : data?.absentStudents?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-white/40">
                    No absent students recorded
                  </td>
                </tr>
              ) : (
                data?.absentStudents?.map((student, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

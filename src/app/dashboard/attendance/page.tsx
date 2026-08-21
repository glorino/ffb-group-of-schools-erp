"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Users,
  Calendar,
  Download,
  Search,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

export default function AttendancePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSession, setSelectedSession] = useState("morning");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [admissionInput, setAdmissionInput] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ date: selectedDate });

    fetch(`/api/attendance?${params}`)
      .then((res) => res.json())
      .then((d) => setRecords(d.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDate, selectedSession]);

  const stats = useMemo(() => {
    const present = records.filter(r => r.status === "present").length;
    const absent = records.filter(r => r.status === "absent").length;
    const late = records.filter(r => r.status === "late").length;
    return { total: records.length, present, absent, late };
  }, [records]);

  const todayStats = [
    { label: "Total Students", value: stats.total, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Present", value: stats.present, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
    { label: "Absent", value: stats.absent, icon: XCircle, color: "from-red-500 to-red-600" },
    { label: "Late", value: stats.late, icon: Clock, color: "from-yellow-500 to-yellow-600" },
  ];

  const markPresent = async (admissionNumber: string) => {
    if (!admissionNumber.trim()) { toast.error("Please enter an admission number"); return; }
    try {
      const res = await fetch(`/api/students?search=${admissionNumber}`);
      const data = await res.json();
      const student = data.students?.[0];
      if (student) {
        await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: student.id, date: selectedDate, session: selectedSession, status: "present", classId: student.classId }),
        });
        toast.success(`${student.firstName} ${student.lastName} marked present`);
        setAdmissionInput("");
      } else { toast.error("Student not found"); }
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Attendance Management</h2>
          <p className="section-subtitle">Track student and teacher attendance with QR code support</p>
        </div>
        <div className="flex gap-3">
          {!isReadOnly && (
            <button
              onClick={() => setShowQRScanner(true)}
              className="btn btn-secondary"
            >
              <QrCode className="w-4 h-4" />
              QR Scanner
            </button>
          )}
          <button
            onClick={() => {
              downloadCSV(records.map(r => ({
                Student: `${r.student?.firstName} ${r.student?.lastName}`,
                "Admission No": r.student?.admissionNumber,
                Class: r.class?.name || r.class?.displayName,
                Status: r.status,
                Date: new Date(r.date).toLocaleDateString(),
                Notes: r.notes || "",
              })), "attendance_report");
              toast.success("Exported successfully");
            }}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Date & Session Selector */}
      <div className="flex flex-wrap gap-4">
        <div className="form-group">
          <label className="input-label">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label className="input-label">Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="select-field"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid-4">
        {todayStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`stat-card-icon bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{Number(stat.value).toLocaleString()}</p>
              <p className="stat-card-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="charts-grid">
        {/* Class Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="table-container"
        >
          <div className="table-header">
            <h3>Class Attendance</h3>
          </div>
          <div className="table-scroll">
            <table className="table-glass">
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
                        <td colSpan={5} className="p-4"><div className="h-4 w-full rounded bg-[#f1f5f9] animate-pulse" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#64748b]">
                      No attendance data for this date
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const classMap: Record<string, { present: number; absent: number; late: number }> = {};
                    records.forEach(r => {
                      const className = r.class?.displayName || r.class?.name || "Unknown";
                      if (!classMap[className]) classMap[className] = { present: 0, absent: 0, late: 0 };
                      if (r.status === "present") classMap[className].present++;
                      else if (r.status === "absent") classMap[className].absent++;
                      else if (r.status === "late") classMap[className].late++;
                    });
                    return Object.entries(classMap).map(([className, s]) => {
                      const total = s.present + s.absent + s.late;
                      const rate = total > 0 ? Math.round((s.present / total) * 100) : 0;
                      return (
                        <tr key={className} className="border-b border-[#e2e8f0]">
                          <td className="text-[#1a1a2e] font-medium">{className}</td>
                          <td className="text-[#16a34a]">{s.present}</td>
                          <td className="text-[#dc2626]">{s.absent}</td>
                          <td className="text-[#ca8a04]">{s.late}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="progress-bar flex-1 max-w-[100px]">
                                <div
                                  className={`progress-bar-fill ${rate >= 90 ? "bg-emerald-500" : rate >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="text-[#475569] text-xs">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()
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
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Today&apos;s Summary</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#1a1a2e] text-[13px] font-medium">Present</span>
                <span className="text-[#16a34a] text-[13px] font-bold">
                  {stats.total ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill bg-emerald-500" style={{ width: `${stats.total ? (stats.present / stats.total) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#1a1a2e] text-[13px] font-medium">Absent</span>
                <span className="text-[#dc2626] text-[13px] font-bold">
                  {stats.total ? ((stats.absent / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill bg-red-500" style={{ width: `${stats.total ? (stats.absent / stats.total) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#1a1a2e] text-[13px] font-medium">Late</span>
                <span className="text-[#ca8a04] text-[13px] font-bold">
                  {stats.total ? ((stats.late / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill bg-yellow-500" style={{ width: `${stats.total ? (stats.late / stats.total) * 100 : 0}%` }} />
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
        className="table-container"
      >
        <div className="table-header">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3>Absent Students Today</h3>
          </div>
          {!isReadOnly && (
            <button
              onClick={async () => {
                const absentCount = records.filter(r => r.status === "absent").length;
                if (absentCount === 0) {
                  toast.error("No absent students to notify");
                  return;
                }
                setNotifying(true);
                try {
                  const res = await fetch("/api/attendance/notify-parents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: selectedDate, session: selectedSession }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed");
                  toast.success(`Notifications sent to ${data.notified} parent(s)`);
                } catch {
                  toast.error("Failed to send notifications");
                } finally {
                  setNotifying(false);
                }
              }}
              disabled={notifying}
              className="btn btn-primary"
            >
              {notifying ? "Sending..." : "Notify Parents"}
            </button>
          )}
        </div>
        <div className="table-scroll">
          <table className="table-glass">
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
                        <td colSpan={4} className="p-4"><div className="h-4 w-full rounded bg-[#f1f5f9] animate-pulse" /></td>
                  </tr>
                ))
              ) : (
                records.filter(r => r.status === "absent").length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#64748b]">
                      No absent students recorded
                    </td>
                  </tr>
                ) : (
                  records.filter(r => r.status === "absent").map((student, i) => (
                    <tr key={i} className="border-b border-[#e2e8f0]">
                      <td className="text-[#1a1a2e] font-medium">{student.student?.firstName} {student.student?.lastName}</td>
                      <td className="text-[#475569]">{student.class?.name || student.class?.displayName}</td>
                      <td className="text-[#475569]">{student.notes || "—"}</td>
                      <td>
                        <span className="badge badge-warning">Pending</span>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      {showQRScanner && (
        <div className="modal-overlay">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowQRScanner(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[#e2e8f0]">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[#1a1a2e] font-semibold text-xl">Mark Attendance</h3>
              <p className="text-[#94a3b8] text-sm mt-1">Enter student admission number to mark present</p>
            </div>
            <input
              type="text"
              placeholder="Type admission number..."
              autoFocus
              value={admissionInput}
              onChange={(e) => setAdmissionInput(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await markPresent(admissionInput);
                }
              }}
              className="w-full px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowQRScanner(false)} className="btn btn-secondary flex-1">
                Close
              </button>
              <button onClick={() => markPresent(admissionInput)} className="btn btn-primary flex-1">
                Mark Present
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
